import React from 'react';
import { useGroceryStore, groceryStore } from '../store/groceryStore';
import { Store, CheckCircle2, Clock, PackageCheck, Sparkles, User, MapPin, CheckSquare, Square } from 'lucide-react';

export default function StaffView() {
  const { orders } = useGroceryStore();

  // Orders that need staff packing ('placed' or currently being packed)
  const pendingOrders = orders.filter(o => o.status === 'placed' || o.status === 'packed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Direct Access: www.example.com/Staff
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Store Staff Fulfillment Portal</h1>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
          <Store className="w-4 h-4" />
          <span>{pendingOrders.length} Orders to Pack</span>
        </div>
      </div>

      {/* Orders Packing Queue */}
      {pendingOrders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">All Orders Are Packed & Cleared!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No pending customer orders right now. New customer orders will automatically appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingOrders.map((order) => {
            const isFullyPacked = order.items.every(item => order.packedItems?.includes(item.id));
            const isReady = order.status === 'packed';

            return (
              <div
                key={order.id}
                className={`glass-panel p-6 rounded-3xl border transition-all ${
                  isReady 
                    ? 'border-blue-500/40 bg-blue-950/20' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                
                {/* Order Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-white">{order.id}</h3>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        order.fulfillmentType === 'delivery' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {order.fulfillmentType}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Placed at: {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400">LKR {order.totalAmount}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">{order.paymentMethod} PAYMENT</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 mb-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block">Customer Name:</span>
                    <span className="font-bold text-slate-200">{order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">NIC Number:</span>
                    <span className="font-bold text-slate-200">{order.nic}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 font-semibold block">Address / Location:</span>
                    <span className="font-bold text-slate-200">{order.deliveryAddress}</span>
                  </div>
                </div>

                {/* Packing Checklist */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1">
                    <span>ITEMS PACKING CHECKLIST:</span>
                    <span className="text-blue-400">
                      {order.packedItems?.length || 0} / {order.items.length} Packed
                    </span>
                  </div>

                  {order.items.map((item) => {
                    const isChecked = order.packedItems?.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => groceryStore.toggleItemPacked(order.id, item.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                          isChecked
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-blue-400 shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-500 shrink-0" />
                          )}
                          <span className={`text-xs font-bold ${isChecked ? 'line-through text-slate-400' : ''}`}>
                            {item.name}
                          </span>
                        </div>

                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-800 text-white">
                          x{item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm Status Button */}
                <button
                  disabled={order.status === 'packed'}
                  onClick={() => groceryStore.updateOrderStatus(order.id, 'packed')}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                    order.status === 'packed'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 cursor-default'
                      : 'bg-blue-500 hover:bg-blue-400 text-slate-950 shadow-lg shadow-blue-500/25 active:scale-95'
                  }`}
                >
                  <PackageCheck className="w-5 h-5" />
                  <span>
                    {order.status === 'packed' 
                      ? '✓ Order Packed & Marked Ready' 
                      : 'Confirm Order Status to READY'}
                  </span>
                </button>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
