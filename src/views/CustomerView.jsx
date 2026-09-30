import React, { useState } from 'react';
import { useGroceryStore, groceryStore } from '../store/groceryStore';
import { 
  Search, Filter, ShoppingBag, Plus, Minus, Trash2, ArrowRight, 
  Sparkles, CheckCircle2, Clock, Truck, ShieldCheck, Tag, X, ChevronRight
} from 'lucide-react';
import CheckoutModal from './CheckoutModal';

export default function CustomerView({ isCartOpen, setIsCartOpen }) {
  const { products, cart, categories: storeCategories } = useGroceryStore();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Dynamic Categories list from Store / MongoDB
  const categoryNames = ['All', ...storeCategories.map(c => c.name)];

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen pb-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          
          <div className="space-y-5 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>100% Organic & Farm Fresh Grocery Delivery</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none">
              Fresh Groceries Delivered <span className="gradient-text">Right To Your Door</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
              Browse farm-fresh organic produce, dairy, bakery & daily essentials. Enjoy fast delivery with free shipping on your first kilometer!
            </p>

            {/* Quick Benefits Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 shadow-md">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span><strong>1st KM FREE</strong> Delivery</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 shadow-md">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Orders &gt; LKR 2,500 <strong>Card Payment</strong></span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 shadow-md">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Daily Discount Prices</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Prominent Search Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search for products, fresh milk, organic fruits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-full pl-12 pr-10 py-3 text-sm font-semibold shadow-xl border-slate-700/80 focus:border-emerald-500/60"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Circular Category Selector Grid (onlinekade style) */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Explore Categories</span>
            </h2>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Show All Categories</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-6 justify-items-center">
            
            {/* 'All' Category Circle */}
            <button
              onClick={() => setSelectedCategory('All')}
              className="group flex flex-col items-center cursor-pointer transition transform active:scale-95"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                selectedCategory === 'All'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 ring-4 ring-emerald-500/40 scale-105'
                  : 'bg-slate-900/90 border border-slate-800 text-emerald-400 hover:border-emerald-500/50 hover:bg-slate-800'
              }`}>
                <Sparkles className="w-8 h-8 group-hover:rotate-12 transition duration-300" />
              </div>
              <span className={`text-xs font-bold text-center mt-2.5 line-clamp-2 transition ${
                selectedCategory === 'All' ? 'text-emerald-400 font-extrabold' : 'text-slate-300 group-hover:text-white'
              }`}>
                All Items
              </span>
            </button>

            {/* Dynamic Category Circles */}
            {storeCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id || cat._id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className="group flex flex-col items-center cursor-pointer transition transform active:scale-95"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 shadow-xl relative bg-slate-900 border ${
                    isSelected
                      ? 'ring-4 ring-emerald-500 border-emerald-500 scale-105'
                      : 'border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800'
                  }`}>
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <Tag className="w-7 h-7 text-emerald-400" />
                    )}
                  </div>
                  <span className={`text-xs font-bold text-center mt-2.5 line-clamp-2 transition max-w-[85px] sm:max-w-[96px] ${
                    isSelected ? 'text-emerald-400 font-extrabold' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}

          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const hasDiscount = p.discountPrice && p.discountPrice < p.price;
            const savings = hasDiscount ? p.price - p.discountPrice : 0;
            const discountPercent = hasDiscount ? Math.round((savings / p.price) * 100) : 0;

            return (
              <div 
                key={p.id}
                className="glass-card rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden group"
              >
                
                {/* Discount Badge */}
                {hasDiscount && (
                  <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px] uppercase shadow-lg">
                    {discountPercent}% OFF
                  </span>
                )}

                {/* Stock Badge */}
                <span className={`absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                  p.inStock 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                </span>

                {/* Image */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 bg-slate-900/60">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 mb-4">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{p.category}</span>
                  <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition">{p.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                  
                  <div className="text-xs font-medium text-slate-400">
                    Unit: <span className="text-slate-200">{p.unit}</span>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    {hasDiscount ? (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-white">LKR {p.discountPrice}</span>
                          <span className="text-xs text-slate-500 line-through">LKR {p.price}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-semibold">Save LKR {savings}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-black text-white">LKR {p.price}</span>
                    )}
                  </div>

                  <button
                    disabled={!p.inStock}
                    onClick={() => groceryStore.addToCart(p, 1)}
                    className={`p-3 rounded-2xl transition cursor-pointer flex items-center justify-center ${
                      p.inStock
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 active:scale-95'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                    title={p.inStock ? 'Add to Cart' : 'Item Out of Stock'}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* Slide-Over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md glass-panel border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-slide-left">
                
                {/* Cart Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">Your Shopping Basket</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {cartItemCount} items
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-bounce" />
                      <p className="text-sm font-semibold">Your basket is empty.</p>
                      <p className="text-xs text-slate-600 mt-1">Add fresh fruits, veggies & daily essentials!</p>
                    </div>
                  ) : (
                    cart.map((item) => {
                      const itemPrice = item.product.discountPrice || item.product.price;
                      return (
                        <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                            <span className="text-[10px] text-slate-400">{item.product.unit}</span>
                            <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
                              LKR {itemPrice}
                            </div>
                          </div>

                          {/* Qty Controls */}
                          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => groceryStore.updateCartQty(item.product.id, item.quantity - 1)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                            <button
                              onClick={() => groceryStore.updateCartQty(item.product.id, item.quantity + 1)}
                              className="p-1 text-slate-400 hover:text-white"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Subtotal & Checkout Trigger */}
                {cart.length > 0 && (
                  <div className="border-t border-slate-800 pt-4 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Basket Subtotal:</span>
                      <span className="text-xl font-extrabold text-white">LKR {cartSubtotal}</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/20 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={(newOrder) => {
          setActiveTrackingOrder(newOrder);
        }}
      />

    </div>
  );
}
