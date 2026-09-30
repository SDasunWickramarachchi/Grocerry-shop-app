import React, { useState, useEffect } from 'react';
import { useGroceryStore } from './store/groceryStore';
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import PWAPrompt from './components/PWAPrompt';
import PortalLogin from './components/PortalLogin';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';
import StaffView from './views/StaffView';
import DeliveryView from './views/DeliveryView';
import DeveloperView from './views/DeveloperView';
import { LogOut, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const { cart } = useGroceryStore();
  const [activeRoute, setActiveRoute] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [authRoles, setAuthRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('ungikade_authRoles');
      return saved ? JSON.parse(saved) : { developer: false, admin: false, staff: false, delivery: false };
    } catch (e) {
      return { developer: false, admin: false, staff: false, delivery: false };
    }
  });

  // Sync route with URL hash or pathname
  useEffect(() => {
    const handleUrlChange = () => {
      let route = window.location.hash.replace('#/', '').replace('#', '');
      if (!route) {
        route = window.location.pathname.replace('/', '');
      }
      setActiveRoute(route);
    };

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const navigateToHome = () => {
    window.location.hash = '#/';
    setActiveRoute('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (roleKey) => {
    setAuthRoles(prev => {
      const updated = { ...prev, [roleKey]: true };
      localStorage.setItem('ungikade_authRoles', JSON.stringify(updated));
      return updated;
    });
    groceryStore.syncFromDatabase();
  };

  const handleLogout = (roleKey) => {
    setAuthRoles(prev => {
      const updated = { ...prev, [roleKey]: false };
      localStorage.setItem('ungikade_authRoles', JSON.stringify(updated));
      return updated;
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Render view or portal login screen based on URL route
  const renderView = () => {
    const route = activeRoute.toLowerCase();

    if (route === 'developer') {
      if (!authRoles.developer) {
        return <PortalLogin roleKey="developer" onLoginSuccess={handleLoginSuccess} />;
      }
      return (
        <div>
          <PortalHeader roleName="Developer Portal" onLogout={() => handleLogout('developer')} />
          <DeveloperView />
        </div>
      );
    }

    if (route === 'admin') {
      if (!authRoles.admin) {
        return <PortalLogin roleKey="admin" onLoginSuccess={handleLoginSuccess} />;
      }
      return (
        <div>
          <PortalHeader roleName="Admin Management Panel" onLogout={() => handleLogout('admin')} />
          <AdminView />
        </div>
      );
    }

    if (route === 'staff' || route === 'storestaff') {
      if (!authRoles.staff) {
        return <PortalLogin roleKey="staff" onLoginSuccess={handleLoginSuccess} />;
      }
      return (
        <div>
          <PortalHeader roleName="Store Staff Fulfillment Portal" onLogout={() => handleLogout('staff')} />
          <StaffView />
        </div>
      );
    }

    if (route === 'delivery' || route === 'driver') {
      if (!authRoles.delivery) {
        return <PortalLogin roleKey="delivery" onLoginSuccess={handleLoginSuccess} />;
      }
      return (
        <div>
          <PortalHeader roleName="Delivery Driver App" onLogout={() => handleLogout('delivery')} />
          <DeliveryView />
        </div>
      );
    }

    // Default Customer Web View
    return <CustomerView isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />;
  };

  return (
    <div className="min-h-screen bg-[#1a130e] text-[#f5ebe0] flex flex-col selection:bg-[#905534] selection:text-white">
      
      {/* PWA Install Prompt Banner */}
      <PWAPrompt />

      {/* Customer Header Bar */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        navigateToHome={navigateToHome}
      />

      {/* Main Page View */}
      <div className="flex-1">
        {renderView()}
      </div>

      {/* Live Customer SMS Toast Alerts */}
      <NotificationToast />

      {/* Footer */}
      <footer className="glass-panel border-t border-[#ded0b6]/15 py-6 text-center text-xs text-[#ded0b6]/70 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#f5ebe0]">UNGI KADE Grocery Store PWA</span>
            <span className="text-[#b08b68]/40">|</span>
            <span className="text-[#b08b68] font-semibold">First 1 KM Free Delivery Active</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#ded0b6]/90 font-medium">
            <span>Developed by</span>
            <strong className="text-[#f5ebe0] font-bold">Dasun Wickramarachchi</strong>
            <span>at</span>
            <strong className="text-[#b08b68] font-bold">Zyara Software Solution Pvt Ltd</strong>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Sub-component for Logged-In Portal Header Bar
function PortalHeader({ roleName, onLogout }) {
  return (
    <div className="bg-[#231a14]/90 border-b border-[#ded0b6]/15 px-4 py-2.5 text-xs flex items-center justify-between">
      <div className="flex items-center gap-2 text-[#f5ebe0] font-semibold">
        <ShieldCheck className="w-4 h-4 text-[#b08b68]" />
        <span>Authenticated Session: <strong>{roleName}</strong></span>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold transition cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Log Out</span>
      </button>
    </div>
  );
}
