import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function Navbar({ cartCount, onOpenCart, navigateToHome }) {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-[#ded0b6]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={navigateToHome} 
            className="flex items-center gap-2 cursor-pointer group py-1"
          >
            <img 
              src="/logo.png" 
              alt="UNGI කඩේ Since 1998" 
              className="h-12 sm:h-14 w-auto max-h-14 object-contain group-hover:scale-105 transition duration-300 rounded-xl shadow-md border border-[#b08b68]/30 bg-[#f5ebe0]/10 p-1"
            />
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl btn-warm font-bold text-sm transition transform active:scale-95 cursor-pointer shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">My Basket</span>
              {cartCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-[#1a130e] text-[#ded0b6] rounded-full font-extrabold border border-[#ded0b6]/30">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
