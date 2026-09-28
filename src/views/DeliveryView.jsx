import React from 'react';
import { useGroceryStore, groceryStore } from '../store/groceryStore';
import { 
  Truck, MapPin, Navigation, CheckCircle2, Phone, User, 
  FileText, Sparkles, ShieldCheck, Home, ExternalLink, Globe
} from 'lucide-react';

export default function DeliveryView() {
  const { orders, storeLocation } = useGroceryStore();

  // Active delivery orders (packed, out_for_delivery, delivered)
  const deliveryOrders = orders.filter(o => 
    o.fulfillmentType === 'delivery' && ['packed', 'out_for_delivery', 'delivered'].includes(o.status)
  );

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
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={isEnRoute || isDelivered}
                    onClick={() => groceryStore.updateOrderStatus(order.id, 'out_for_delivery')}
                    className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      isEnRoute || isDelivered
                        ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                        : 'btn-warm shadow-lg active:scale-95'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Start Delivery</span>
                  </button>

                  <button
                    disabled={isDelivered}
                    onClick={() => groceryStore.updateOrderStatus(order.id, 'delivered')}
                    className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                      isDelivered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg active:scale-95'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>{isDelivered ? '✓ Delivered at Doorstep' : 'Confirm Doorstep Delivery'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
