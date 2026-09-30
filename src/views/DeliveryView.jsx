import React, { useState } from 'react';
import { useGroceryStore, groceryStore } from '../store/groceryStore';
import { 
  Truck, MapPin, Navigation, CheckCircle2, Phone, User, 
  FileText, Sparkles, ShieldCheck, Home, ExternalLink, Globe, Lock, Key, AlertCircle, X
} from 'lucide-react';

export default function DeliveryView() {
  const { orders, storeLocation } = useGroceryStore();
  
  // PIN Verification Modal State
  const [pinModalOrder, setPinModalOrder] = useState(null);
  const [inputPin, setInputPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Active delivery orders (packed, out_for_delivery, delivered)
  const deliveryOrders = orders.filter(o => 
    o.fulfillmentType === 'delivery' && ['packed', 'out_for_delivery', 'delivered'].includes(o.status)
  );

  const handleOpenPinModal = (order) => {
    setPinModalOrder(order);
    setInputPin('');
    setPinError('');
  };

  const handleVerifyPinSubmit = (e) => {
    e.preventDefault();
    setPinError('');

    if (!inputPin.trim()) {
      setPinError('Please enter the 4-digit PIN received by customer via SMS!');
      return;
    }

    const result = groceryStore.verifyAndCompleteDelivery(pinModalOrder.id, inputPin);
    if (result.success) {
      setPinModalOrder(null);
      setInputPin('');
      setPinError('');
    } else {
      setPinError(result.message || 'Invalid PIN entered! Please ask customer for correct SMS PIN.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded0b6]/15 pb-6">
        <div>
          <span className="text-xs font-bold text-[#b08b68] uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Protected Driver Portal: /Delivery
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Delivery Driver GPS Navigation Dashboard</h1>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#905534]/20 border border-[#b08b68]/30 text-[#ded0b6] text-xs font-bold">
          <Truck className="w-4 h-4 text-[#b08b68]" />
          <span>{deliveryOrders.length} Active Tasks</span>
        </div>
      </div>

      {deliveryOrders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <Truck className="w-12 h-12 text-[#b08b68] mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Deliveries Assigned</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When store staff packs customer delivery orders, they will automatically appear here with Google Maps GPS coordinates!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deliveryOrders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isEnRoute = order.status === 'out_for_delivery';

            const destLat = order.deliveryCoordinates?.lat || storeLocation.lat;
            const destLng = order.deliveryCoordinates?.lng || storeLocation.lng;
            const encodedAddress = encodeURIComponent(order.deliveryAddress);

            // Google Maps Directions & Embed Link
            const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${storeLocation.lat},${storeLocation.lng}&destination=${encodedAddress}&travelmode=driving`;
            const mapEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

            return (
              <div
                key={order.id}
                className={`glass-panel p-6 rounded-3xl border transition-all ${
                  isDelivered 
                    ? 'border-emerald-500/30 bg-emerald-950/10' 
                    : isEnRoute 
                    ? 'border-[#b08b68] bg-[#905534]/15 glow-warm' 
                    : 'border-slate-800'
                }`}
              >
                
                {/* Order Header */}
                <div className="flex justify-between items-start border-b border-[#ded0b6]/15 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white">{order.id}</h3>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        isDelivered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        isEnRoute ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Distance from <strong className="text-[#ded0b6]">{storeLocation.name}</strong>: <strong className="text-emerald-400">{order.distanceKm} KM</strong>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-white">LKR {order.totalAmount}</span>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">{order.paymentMethod} PAYMENT</span>
                  </div>
                </div>

                {/* Customer Details & Address */}
                <div className="space-y-3 p-4 rounded-2xl bg-[#1a130e]/80 border border-[#ded0b6]/15 mb-4 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 font-semibold block">Customer Name:</span>
                      <span className="font-bold text-slate-100 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#b08b68]" /> {order.customerName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold block">NIC Verification:</span>
                      <span className="font-bold text-slate-100 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#b08b68]" /> {order.nic}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block">Phone Number:</span>
                    <a href={`tel:${order.phone}`} className="font-bold text-emerald-400 flex items-center gap-1 hover:underline">
                      <Phone className="w-3.5 h-3.5" /> {order.phone}
                    </a>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block">Delivery Address:</span>
                    <div className="font-bold text-white flex items-start gap-1.5 mt-0.5">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                {/* LIVE GOOGLE MAPS EMBED & NAVIGATION WIDGET */}
                <div className="p-3 rounded-2xl bg-[#1a130e] border border-[#ded0b6]/20 space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#f5ebe0] flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#b08b68]" /> Google Maps Live Driver Navigation
                    </span>
                    <a
                      href={googleMapsDirUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg btn-warm text-[10px] font-bold flex items-center gap-1"
                    >
                      <span>Open Google Maps App</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Embedded Google Map */}
                  <div className="w-full h-48 rounded-xl overflow-hidden border border-[#ded0b6]/15 bg-slate-900">
                    <iframe
                      title={`Google Map for ${order.id}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={mapEmbedUrl}
                      loading="lazy"
                    ></iframe>
                  </div>

                  {/* Satellite Coordinates Data */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#231a14] p-2.5 rounded-xl border border-[#ded0b6]/15">
                    <div>
                      <span className="text-slate-500 block text-[10px]">DESTINATION LATITUDE:</span>
                      <span className="text-emerald-400 font-bold">{destLat}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">DESTINATION LONGITUDE:</span>
                      <span className="text-emerald-400 font-bold">{destLng}</span>
                    </div>
                  </div>
                </div>

                {/* Driver Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    disabled={isEnRoute || isDelivered}
                    onClick={() => groceryStore.updateOrderStatus(order.id, 'out_for_delivery')}
                    className={`py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      isEnRoute || isDelivered
                        ? 'bg-slate-900 text-slate-500 border border-slate-800/80 cursor-not-allowed'
                        : 'btn-warm shadow-lg active:scale-95'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>{isEnRoute ? '🚚 En Route to Customer' : isDelivered ? 'Delivery Completed' : 'Start Delivery'}</span>
                  </button>

                  <button
                    disabled={isDelivered}
                    onClick={() => handleOpenPinModal(order)}
                    className={`py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      isDelivered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/20 active:scale-95'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{isDelivered ? '✓ Arrived & Delivered at Doorstep' : '📍 Confirm Arrival & Verify PIN'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Doorstep Delivery PIN Verification Modal */}
      {pinModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/40 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Doorstep Delivery Verification</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Order {pinModalOrder.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setPinModalOrder(null)} 
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1a130e] border border-[#ded0b6]/15 space-y-1 text-xs">
              <div className="text-slate-400">Customer: <strong className="text-white">{pinModalOrder.customerName}</strong></div>
              <div className="text-slate-400">Phone: <strong className="text-emerald-400">{pinModalOrder.phone}</strong></div>
              <div className="text-slate-400 line-clamp-1">Address: <strong className="text-slate-200">{pinModalOrder.deliveryAddress}</strong></div>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#ded0b6] mb-1">
                  Enter 4-Digit Customer SMS Delivery PIN *
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Ask <strong>{pinModalOrder.customerName}</strong> for the 4-digit PIN received on <strong>{pinModalOrder.phone}</strong>.
                </p>

                <div className="relative">
                  <Key className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength="6"
                    required
                    autoFocus
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    placeholder="Enter 4-digit PIN (e.g. 4829)"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-center font-mono font-black text-lg tracking-widest border-emerald-500/40 text-white"
                  />
                </div>
              </div>

              {/* Demo Helper Badge for Testing convenience */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">
                  📱 Customer SMS PIN (Demo Helper): <strong className="text-amber-300 font-mono text-xs">{pinModalOrder.deliveryPin || '1234'}</strong>
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalOrder(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify PIN & Complete</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

