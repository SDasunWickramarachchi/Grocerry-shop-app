import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('PWA App: You can also install this app via your browser menu (Add to Home Screen).');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="bg-gradient-to-r from-[#2a1e16] via-[#1a130e] to-[#2a1e16] border-b border-[#b08b68]/40 px-4 py-2 text-xs flex items-center justify-between shadow-lg text-[#f5ebe0]">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-[#b08b68]/20 text-[#ded0b6]">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-[#ded0b6]">UNGI KADE PWA App</span>
          <span className="hidden sm:inline text-[#ded0b6]/70 ml-2">Install on your phone or desktop for fast access and offline support!</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg btn-warm font-bold shadow-md transition transform active:scale-95 cursor-pointer text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install PWA</span>
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 text-[#ded0b6]/60 hover:text-[#f5ebe0]"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
