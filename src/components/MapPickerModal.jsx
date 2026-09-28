import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Search, Navigation, Check, Locate, RefreshCw, Globe } from 'lucide-react';

// Haversine formula for exact distance in KM
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDist = R * c;
  const drivingDist = straightDist * 1.15;
  return Math.max(0.5, Math.round(drivingDist * 10) / 10);
}

export default function MapPickerModal({
  isOpen,
  onClose,
  title = 'Google Maps Location Picker',
  initialLat = 6.9147,
  initialLng = 79.8516,
  originLocation = null, // e.g. { lat, lng, name } for store origin
  onConfirm
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const polylineInstanceRef = useRef(null);

  const [selectedLat, setSelectedLat] = useState(parseFloat(initialLat) || 6.9147);
  const [selectedLng, setSelectedLng] = useState(parseFloat(initialLng) || 79.8516);
  const [reverseAddress, setReverseAddress] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [calculatedKm, setCalculatedKm] = useState(null);
  const [usingGoogleApi, setUsingGoogleApi] = useState(false);

  // Initialize Map Engine (Google Maps API priority)
  useEffect(() => {
    if (!isOpen) return;

    const lat = parseFloat(initialLat) || 6.9147;
    const lng = parseFloat(initialLng) || 79.8516;
    setSelectedLat(lat);
    setSelectedLng(lng);

    if (originLocation) {
      const oLat = parseFloat(originLocation.lat) || 6.9147;
      const oLng = parseFloat(originLocation.lng) || 79.8516;
      setCalculatedKm(calculateDistance(oLat, oLng, lat, lng));
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Check if official Google Maps JS API is available
      if (window.google && window.google.maps) {
        setUsingGoogleApi(true);
        initGoogleMap(lat, lng);
      } else if (typeof window.L !== 'undefined') {
        setUsingGoogleApi(false);
        initLeafletMap(lat, lng);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current && mapInstanceRef.current.remove) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, initialLat, initialLng]);

  // Google Maps JS API Initialization
  const initGoogleMap = (lat, lng) => {
    const google = window.google;
    const center = { lat, lng };

    const map = new google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
    });

    const marker = new google.maps.Marker({
      position: center,
      map,
      draggable: true,
      title: 'Selected Location'
    });

    markerInstanceRef.current = marker;
    mapInstanceRef.current = map;

    const updatePos = (nLat, nLng) => {
      const fLat = parseFloat(nLat.toFixed(5));
      const fLng = parseFloat(nLng.toFixed(5));
      setSelectedLat(fLat);
      setSelectedLng(fLng);

      if (originLocation) {
        const oLat = parseFloat(originLocation.lat) || 6.9147;
        const oLng = parseFloat(originLocation.lng) || 79.8516;
        setCalculatedKm(calculateDistance(oLat, oLng, fLat, fLng));
      }

      reverseGeocodeGoogle(fLat, fLng);
    };

    map.addListener('click', (e) => {
      const cLat = e.latLng.lat();
      const cLng = e.latLng.lng();
      marker.setPosition({ lat: cLat, lng: cLng });
      updatePos(cLat, cLng);
    });

    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      updatePos(pos.lat(), pos.lng());
    });

    reverseGeocodeGoogle(lat, lng);
  };

  // Google Maps Geocoder
  const reverseGeocodeGoogle = (lat, lng) => {
    setIsReverseGeocoding(true);
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        setIsReverseGeocoding(false);
        if (status === 'OK' && results[0]) {
          setReverseAddress(results[0].formatted_address);
        } else {
          reverseGeocodeNominatim(lat, lng);
        }
      });
    } else {
      reverseGeocodeNominatim(lat, lng);
    }
  };

  // Leaflet Map Initialization Fallback
  const initLeafletMap = (lat, lng) => {
    const L = window.L;
    if (mapInstanceRef.current && mapInstanceRef.current.remove) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; Google Maps / OpenStreetMap Engine',
      maxZoom: 19
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(239, 68, 68, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #ea4335, #c5221f); border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
    markerInstanceRef.current = marker;
    mapInstanceRef.current = map;

    if (originLocation) {
      const oLat = parseFloat(originLocation.lat) || 6.9147;
      const oLng = parseFloat(originLocation.lng) || 79.8516;

      const storeIcon = L.divIcon({
        className: 'store-origin-pin',
        html: `
          <div style="width: 32px; height: 32px; background: #1a130e; border: 2px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const storeMarker = L.marker([oLat, oLng], { icon: storeIcon }).addTo(map);
      storeMarker.bindTooltip(`Store: ${originLocation.name || 'Store Origin'}`, { permanent: true, direction: 'top' });

      const polyline = L.polyline([[oLat, oLng], [lat, lng]], { color: '#ea4335', weight: 3, dashArray: '6, 8' }).addTo(map);
      polylineInstanceRef.current = polyline;
    }

    const updatePosition = (nLat, nLng) => {
      const fLat = parseFloat(nLat.toFixed(5));
      const fLng = parseFloat(nLng.toFixed(5));
      setSelectedLat(fLat);
      setSelectedLng(fLng);

      if (originLocation) {
        const oLat = parseFloat(originLocation.lat) || 6.9147;
        const oLng = parseFloat(originLocation.lng) || 79.8516;
        setCalculatedKm(calculateDistance(oLat, oLng, fLat, fLng));

        if (polylineInstanceRef.current) {
          polylineInstanceRef.current.setLatLngs([[oLat, oLng], [fLat, fLng]]);
        }
      }

      reverseGeocodeNominatim(fLat, fLng);
    };

    map.on('click', (e) => {
      marker.setLatLng([e.latlng.lat, e.latlng.lng]);
      updatePosition(e.latlng.lat, e.latlng.lng);
    });

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      updatePosition(pos.lat, pos.lng);
    });

    reverseGeocodeNominatim(lat, lng);
    setTimeout(() => map.invalidateSize(), 200);
  };

  // OpenStreetMap Nominatim Reverse Geocode
  const reverseGeocodeNominatim = async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (data && data.display_name) {
        setReverseAddress(data.display_name.split(', ').slice(0, 4).join(', '));
      } else {
        setReverseAddress(`GPS: ${lat}, ${lng}`);
      }
    } catch (e) {
      setReverseAddress(`GPS: ${lat}, ${lng}`);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Search Submit
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let q = searchQuery.trim();
      if (!q.toLowerCase().includes('sri lanka')) q += ', Sri Lanka';

      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: q }, (results, status) => {
          setIsSearching(false);
          if (status === 'OK' && results[0]) {
            const loc = results[0].geometry.location;
            const nLat = loc.lat();
            const nLng = loc.lng();
            setSelectedLat(nLat);
            setSelectedLng(nLng);
            if (mapInstanceRef.current && markerInstanceRef.current) {
              if (usingGoogleApi) {
                mapInstanceRef.current.setCenter({ lat: nLat, lng: nLng });
                markerInstanceRef.current.setPosition({ lat: nLat, lng: nLng });
              } else {
                mapInstanceRef.current.flyTo([nLat, nLng], 15);
                markerInstanceRef.current.setLatLng([nLat, nLng]);
              }
            }
            setReverseAddress(results[0].formatted_address);
          } else {
            fetchNominatimSearch(q);
          }
        });
      } else {
        fetchNominatimSearch(q);
      }
    } catch (err) {
      setIsSearching(false);
    }
  };

  const fetchNominatimSearch = async (q) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const nLat = parseFloat(data[0].lat);
        const nLng = parseFloat(data[0].lon);
        setSelectedLat(nLat);
        setSelectedLng(nLng);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          if (usingGoogleApi) {
            mapInstanceRef.current.setCenter({ lat: nLat, lng: nLng });
            markerInstanceRef.current.setPosition({ lat: nLat, lng: nLng });
          } else {
            mapInstanceRef.current.flyTo([nLat, nLng], 15);
            markerInstanceRef.current.setLatLng([nLat, nLng]);
          }
        }
        setReverseAddress(data[0].display_name.split(', ').slice(0, 4).join(', '));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // Use Device GPS
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const cLat = parseFloat(pos.coords.latitude.toFixed(5));
          const cLng = parseFloat(pos.coords.longitude.toFixed(5));

          setSelectedLat(cLat);
          setSelectedLng(cLng);

          if (mapInstanceRef.current && markerInstanceRef.current) {
            if (usingGoogleApi) {
              mapInstanceRef.current.setCenter({ lat: cLat, lng: cLng });
              markerInstanceRef.current.setPosition({ lat: cLat, lng: cLng });
            } else {
              mapInstanceRef.current.flyTo([cLat, cLng], 16);
              markerInstanceRef.current.setLatLng([cLat, cLng]);
            }
          }

          if (originLocation) {
            const oLat = parseFloat(originLocation.lat) || 6.9147;
            const oLng = parseFloat(originLocation.lng) || 79.8516;
            setCalculatedKm(calculateDistance(oLat, oLng, cLat, cLng));
          }

          reverseGeocodeGoogle(cLat, cLng);
        },
        (err) => alert('Could not get device location. Please click on map.'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        lat: selectedLat,
        lng: selectedLng,
        address: reverseAddress,
        distanceKm: calculatedKm
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative max-w-3xl w-full glass-panel rounded-3xl border border-[#b08b68]/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#1a130e] border-b border-[#ded0b6]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
              <Globe className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                  Google Maps API Engine
                </span>
              </h3>
              <p className="text-[11px] text-[#ded0b6]">Click or drag pin to set exact Google Maps coordinates</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Search & GPS Control Bar */}
        <div className="p-3 bg-[#231a14] border-b border-[#ded0b6]/10 flex flex-col sm:flex-row items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Google Maps Search place, town or street (e.g. Park Street Colombo)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-20 py-2 text-xs text-white"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1 px-3 py-1 rounded-lg btn-warm text-[10px] font-bold cursor-pointer"
            >
              {isSearching ? 'Searching...' : 'Google Search'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#905534]/30 hover:bg-[#905534]/50 border border-[#b08b68]/40 text-xs font-bold text-[#ded0b6] flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer"
          >
            <Locate className="w-3.5 h-3.5 text-emerald-400" />
            <span>Use My GPS</span>
          </button>
        </div>

        {/* Map Canvas Container */}
        <div className="relative flex-1 min-h-[350px] sm:min-h-[420px] bg-slate-900">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
          
          {/* Real-Time Coordinates & Distance Floating Tag */}
          <div className="absolute top-3 left-3 z-20 bg-[#1a130e]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#ded0b6]/20 shadow-lg text-xs space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-[#b08b68]">Google Maps GPS Pin</div>
            <div className="font-mono text-white font-bold">
              Lat: {selectedLat}, Lng: {selectedLng}
            </div>
            {calculatedKm !== null && (
              <div className="text-emerald-400 font-extrabold text-xs pt-1 border-t border-[#ded0b6]/10 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                <span>Distance to Store: {calculatedKm} KM ({calculatedKm <= 1.0 ? 'FREE Delivery' : `LKR ${(calculatedKm - 1) * 150}`})</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Address & Confirm Bar */}
        <div className="p-4 bg-[#1a130e] border-t border-[#ded0b6]/15 space-y-3">
          <div className="flex items-start gap-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-[#b08b68] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Google Maps Formatted Address:</span>
              {isReverseGeocoding ? (
                <span className="text-[#b08b68] font-bold animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Resolving Google Maps Address...
                </span>
              ) : (
                <span className="font-semibold text-white block truncate">{reverseAddress || 'Google Maps Selected Pin'}</span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-2 py-2.5 rounded-xl btn-warm font-black text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Set Selected Google Maps Location</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
