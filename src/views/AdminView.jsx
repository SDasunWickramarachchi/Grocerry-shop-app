import React, { useState } from 'react';
import { useGroceryStore, groceryStore } from '../store/groceryStore';
import MapPickerModal from '../components/MapPickerModal';
import { 
  LayoutDashboard, Store, Package, UserCheck, DollarSign, Truck, 
  TrendingUp, Plus, ToggleLeft, ToggleRight, MapPin, Check, Save, 
  Sparkles, ShieldCheck, Mail, Phone, Award, Globe, Edit3, Trash2, Navigation,
  MessageSquare, Smartphone, CreditCard, Banknote, ShieldAlert, PieChart, Activity, X, Tag, Upload, Image as ImageIcon
} from 'lucide-react';

export default function AdminView() {
  const { 
    products, orders, deliveryFeePerKm, storeLocation, storeBranches, smsLogs,
    categories, addCategory, updateCategory, deleteCategory,
    users, approveUser, rejectUser
  } = useGroceryStore();

  const [activeTab, setActiveTab] = useState('branches');

  const [newFeeRate, setNewFeeRate] = useState(deliveryFeePerKm);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  
  // Category Management State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Edit Branch Modal State
  const [editingBranch, setEditingBranch] = useState(null); // branch object or null
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Branch Form states (used for both Add and Edit)
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchLat, setBranchLat] = useState('6.9147');
  const [branchLng, setBranchLng] = useState('79.8516');
  const [isDetectingBranchCoords, setIsDetectingBranchCoords] = useState(false);

  // New product state
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Fresh Produce');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('');
  const [prodUnit, setProdUnit] = useState('1 kg');
  const [prodStock, setProdStock] = useState('20');
  const [prodImage, setProdImage] = useState('');

  // Image Upload helper (converts local file to Base64 data URL)
  const handleImageFileUpload = (e, setImageFn) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFn(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analytics calculations
  const totalDeliveryRevenue = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const totalProductRevenue = orders.reduce((sum, o) => sum + (o.itemsSubtotal || 0), 0);
  const grandTotalRevenue = totalProductRevenue + totalDeliveryRevenue;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;

  // Payment Analytics
  const cardOrders = orders.filter(o => o.paymentMethod === 'card');
  const cashOrders = orders.filter(o => o.paymentMethod === 'cash');
  const cardVolume = cardOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const cashVolume = cashOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const forcedCardCount = orders.filter(o => o.totalAmount > 2500).length;

  // SMS Analytics
  const smsPlacedCount = smsLogs.filter(s => s.stage === 'Order Placed').length;
  const smsPackedCount = smsLogs.filter(s => s.stage === 'Order Packed').length;
  const smsDeliveryCount = smsLogs.filter(s => s.stage === 'Out for Delivery' || s.stage === 'Delivered').length;

  const handleUpdateFee = (e) => {
    e.preventDefault();
    groceryStore.setDeliveryFeePerKm(newFeeRate);
  };

  // Real-Time Google Maps Geocoding for Branch Coordinates
  const handleDetectBranchCoordinates = async (addressText) => {
    if (!addressText || addressText.trim().length < 3) return;

    setIsDetectingBranchCoords(true);

    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: addressText }, (results, status) => {
        setIsDetectingBranchCoords(false);
        if (status === 'OK' && results[0]?.geometry?.location) {
          const lat = results[0].geometry.location.lat().toFixed(4);
          const lng = results[0].geometry.location.lng().toFixed(4);
          setBranchLat(lat);
          setBranchLng(lng);
        } else {
          fetchNominatimBranchGeocode(addressText);
        }
      });
    } else {
      fetchNominatimBranchGeocode(addressText);
    }
  };

  const fetchNominatimBranchGeocode = async (query) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (data && data.length > 0) {
        setBranchLat(parseFloat(data[0].lat).toFixed(4));
        setBranchLng(parseFloat(data[0].lon).toFixed(4));
      } else {
        fallbackSimulateCoords(query);
      }
    } catch (e) {
      fallbackSimulateCoords(query);
    } finally {
      setIsDetectingBranchCoords(false);
    }
  };

  const fallbackSimulateCoords = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash += text.charCodeAt(i);
    const lat = (6.0 + (hash % 150) / 100).toFixed(4);
    const lng = (79.8 + (hash % 100) / 100).toFixed(4);
    setBranchLat(lat);
    setBranchLng(lng);
  };

  const openAddBranchModal = () => {
    setBranchName('');
    setBranchAddress('');
    setBranchManager('');
    setBranchPhone('');
    setBranchLat('6.9147');
    setBranchLng('79.8516');
    setShowAddBranchModal(true);
  };

  const openEditBranchModal = (branch) => {
    setEditingBranch(branch);
    setBranchName(branch.name);
    setBranchAddress(branch.address);
    setBranchManager(branch.manager || 'Branch Manager');
    setBranchPhone(branch.phone || '+94 11 200 0000');
    setBranchLat(branch.lat || '6.9147');
    setBranchLng(branch.lng || '79.8516');
  };

  const handleSaveBranchForm = (e) => {
    e.preventDefault();

    if (editingBranch) {
      // Update existing branch
      groceryStore.updateStoreBranch(editingBranch.id, {
        name: branchName,
        address: branchAddress,
        manager: branchManager,
        phone: branchPhone,
        lat: branchLat,
        lng: branchLng
      });
      setEditingBranch(null);
    } else {
      // Create new branch
      groceryStore.addStoreBranch({
        name: branchName,
        address: branchAddress,
        manager: branchManager,
        phone: branchPhone,
        lat: branchLat,
        lng: branchLng
      });
      setShowAddBranchModal(false);
    }
  };

  const handleDeleteBranch = (branchId) => {
    groceryStore.deleteStoreBranch(branchId);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    groceryStore.addProduct({
      name: prodName,
      category: prodCategory,
      price: prodPrice,
      discountPrice: prodDiscountPrice || prodPrice,
      unit: prodUnit,
      stock: prodStock,
      image: prodImage
    });

    setProdName('');
    setProdPrice('');
    setProdDiscountPrice('');
    setProdImage('');
    setShowAddModal(false);
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatImage('');
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatImage(cat.image || '');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id || editingCategory._id, {
        name: catName,
        description: catDesc,
        image: catImage
      });
    } else {
      addCategory({
        name: catName,
        description: catDesc,
        image: catImage
      });
    }
    setShowCategoryModal(false);
  };

  const pendingStaffDrivers = users.filter(u => (u.role === 'staff' || u.role === 'delivery') && u.status === 'pending');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'users', label: 'User Approvals', icon: UserCheck, badge: `${pendingStaffDrivers.length} Pending` },
    { id: 'branches', label: 'Store Branches', icon: MapPin, badge: `${storeBranches.length} Branches` },
    { id: 'categories', label: 'Categories', icon: Tag, badge: `${categories.length} Categories` },
    { id: 'items', label: 'Items & Products', icon: Package, badge: `${products.length} Products` },
    { id: 'sms', label: 'SMS Analytics', icon: Smartphone, badge: `${smsLogs.length} Sent` },
    { id: 'payments', label: 'Payment Analysis', icon: CreditCard, badge: 'Gateway' },
    { id: 'profile', label: 'Admin Profile', icon: UserCheck, badge: 'Verified' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ded0b6]/15 pb-6 mb-8">
        <div>
          <span className="text-xs font-bold text-[#b08b68] uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Protected Portal: /Admin
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">UNGI KADE Administration Center</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#905534]/20 border border-[#b08b68]/30 text-xs font-bold text-[#ded0b6]">
            <Store className="w-4 h-4 text-[#b08b68]" />
            <span>{storeLocation.name}</span>
          </div>

          <button
            onClick={() => {
              setActiveTab('items');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-warm font-bold text-xs shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Main Sidebar + Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDE NAVIGATION BAR */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="glass-panel p-2 lg:p-3 rounded-2xl border border-[#ded0b6]/15 flex lg:block overflow-x-auto no-scrollbar gap-2 lg:space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#ded0b6]/60 hidden lg:block">
              Admin Navigation Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`shrink-0 lg:w-full flex items-center justify-between px-3.5 py-2.5 lg:py-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap gap-3 ${
                    isActive
                      ? 'btn-warm shadow-lg scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#b08b68]'}`} />
                    <span>{item.label}</span>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#1a130e] text-[#ded0b6]' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-[#231a14] border border-[#ded0b6]/15 space-y-2 text-xs">
            <span className="font-bold text-[#b08b68] uppercase text-[10px] tracking-wider block">Gateway Status</span>
            <div className="flex items-center justify-between text-slate-300">
              <span>Card Mandate Threshold:</span>
              <span className="font-bold text-amber-400">&gt; LKR 2,500</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>SMS Dispatcher:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" /> Active (99.8%)
              </span>
            </div>
          </div>
        </aside>

        {/* SECTION CONTENT AREA */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-[#b08b68]" />
                  <span>Revenue Analytics & Store Overview</span>
                </h2>
                <span className="text-xs text-[#ded0b6]/70">Real-Time Revenue Telemetry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-[#ded0b6]/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-[#b08b68]" />
                  </div>
                  <div className="text-2xl font-black text-white">LKR {grandTotalRevenue.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Products + Delivery System Fee</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#b08b68]/30 bg-[#905534]/10 glow-warm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#ded0b6] uppercase">Delivery Revenue</span>
                    <Truck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">LKR {totalDeliveryRevenue.toLocaleString()}</div>
                  <span className="text-[10px] text-[#ded0b6]/80 mt-1 block">Earned after 1st KM Free</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#ded0b6]/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Product Sales</span>
                    <TrendingUp className="w-4 h-4 text-[#b08b68]" />
                  </div>
                  <div className="text-2xl font-black text-white">LKR {totalProductRevenue.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Net grocery subtotal</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#ded0b6]/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Deliveries</span>
                    <Package className="w-4 h-4 text-[#b08b68]" />
                  </div>
                  <div className="text-2xl font-black text-white">{completedOrders} / {orders.length}</div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Orders fulfilled</span>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-[#ded0b6]/15 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#b08b68]" /> Configure Per-KM Delivery Rate
                  </h3>
                  <p className="text-xs text-slate-400">
                    Rate charged per kilometer after the <strong>First 1.0 KM FREE</strong> threshold.
                  </p>
                </div>

                <form onSubmit={handleUpdateFee} className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">LKR</span>
                    <input
                      type="number"
                      min="0"
                      value={newFeeRate}
                      onChange={(e) => setNewFeeRate(e.target.value)}
                      className="glass-input rounded-xl pl-10 pr-10 py-2 text-sm font-bold w-36 text-center"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">/KM</span>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl btn-warm font-bold text-xs shadow-md"
                  >
                    Save Rate
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: STORE USERS & DELIVERY APPROVALS */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#b08b68]" />
                    <span>Store Staff & Delivery Driver Approvals</span>
                  </h2>
                  <p className="text-xs text-slate-400">Admin must approve registered Store Staff and Delivery Drivers before portal login</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.filter(u => u.role === 'staff' || u.role === 'delivery').map(u => {
                  const uId = u.id || u._id;
                  const isApproved = u.status === 'approved';
                  const isPending = u.status === 'pending';

                  return (
                    <div key={uId} className="glass-panel p-5 rounded-2xl border border-[#ded0b6]/15 space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl text-white font-bold text-xs uppercase ${u.role === 'staff' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                            {u.role}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{u.name || u.username}</h4>
                            <span className="text-xs text-slate-400 font-mono">@{u.username}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {u.status}
                        </span>
                      </div>

                      {u.phone && (
                        <div className="text-xs text-slate-400">
                          Contact Phone: <strong className="text-slate-200">{u.phone}</strong>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-[#ded0b6]/10">
                        {!isApproved && (
                          <button
                            onClick={() => approveUser(uId)}
                            className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-md"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve User</span>
                          </button>
                        )}

                        {u.status !== 'rejected' && (
                          <button
                            onClick={() => rejectUser(uId)}
                            className="py-2 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs border border-rose-500/40 transition cursor-pointer flex items-center justify-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: STORE BRANCHES (EDIT & DELETE BRANCH SUPPORT) */}
          {activeTab === 'branches' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ded0b6]/15 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#b08b68]" />
                    <span>Store Branches & Location Management</span>
                  </h2>
                  <span className="text-xs text-[#ded0b6]/70">Google Maps Geocoded Store Origins</span>
                </div>

                <button
                  onClick={openAddBranchModal}
                  className="px-4 py-2 rounded-xl btn-warm font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer w-fit"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Store Branch</span>
                </button>
              </div>

              {/* Active Branch Highlight Banner */}
              <div className="glass-panel p-6 rounded-3xl border border-[#b08b68]/40 bg-[#905534]/15 glow-warm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Currently Active Store Origin
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{storeLocation.name}</h3>
                    <p className="text-xs text-[#ded0b6] mt-0.5">{storeLocation.address}</p>
                  </div>
                  <div className="text-xs font-mono bg-[#1a130e] p-2.5 rounded-xl border border-[#ded0b6]/20 text-slate-300 shrink-0">
                    <div>LAT: <strong className="text-emerald-400">{storeLocation.lat}</strong></div>
                    <div>LNG: <strong className="text-emerald-400">{storeLocation.lng}</strong></div>
                  </div>
                </div>
              </div>

              {/* Store Branches Grid (EDIT & DELETE BUTTONS) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#ded0b6] uppercase tracking-wider">Store Branch Network ({storeBranches.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {storeBranches.map((b) => {
                    const isSelected = storeLocation.address === b.address || storeLocation.id === b.id;
                    return (
                      <div
                        key={b.id}
                        className={`glass-card p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                          isSelected ? 'border-[#b08b68] bg-[#905534]/20' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white">{b.name}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{b.address}</p>
                            <span className="text-[10px] font-mono text-[#b08b68] block mt-1">
                              GPS: {b.lat}, {b.lng}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSelected && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                Active
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditBranchModal(b)}
                              className="p-1.5 rounded-lg bg-[#b08b68]/20 hover:bg-[#b08b68]/30 text-[#ded0b6] border border-[#b08b68]/40 transition cursor-pointer"
                              title="Edit Store Branch"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBranch(b.id)}
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition cursor-pointer"
                              title="Delete Branch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#ded0b6]/10">
                          <span>Manager: {b.manager || 'Branch Manager'}</span>
                          <button
                            onClick={() => groceryStore.setStoreLocation(b)}
                            disabled={isSelected}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                                : 'btn-warm'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Set Active'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#b08b68]" />
                    <span>Category Management</span>
                  </h2>
                  <p className="text-xs text-slate-400">Add, edit, delete categories and manage category image assets</p>
                </div>
                <button
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2 rounded-xl btn-warm font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              </div>

              {/* Database Status Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-emerald-300 font-semibold">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Database Engine Connected & Active (Collections: Categories, Products)</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  {categories.length} Categories Synced
                </span>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const catId = cat.id || cat._id;
                  const productCount = products.filter(p => p.category === cat.name).length;

                  return (
                    <div 
                      key={catId}
                      className="glass-panel p-4 rounded-2xl border border-[#ded0b6]/15 space-y-3 relative overflow-hidden group hover:border-[#b08b68]/40 transition"
                    >
                      <div className="h-32 rounded-xl overflow-hidden relative bg-slate-900 border border-[#ded0b6]/10">
                        {cat.image ? (
                          <img 
                            src={cat.image} 
                            alt={cat.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                            No Image Uploaded
                          </div>
                        )}
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          {productCount} Products
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{cat.description || 'No description provided.'}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#ded0b6]/10">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => deleteCategory(catId)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ITEMS & INVENTORY */}
          {activeTab === 'items' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#b08b68]" />
                  <span>Inventory & Items Management</span>
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3.5 py-1.5 rounded-xl btn-warm font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="glass-panel rounded-3xl border border-[#ded0b6]/15 p-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1a130e]/80 text-[#ded0b6] uppercase font-bold border-b border-[#ded0b6]/15">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Regular Price</th>
                        <th className="p-3">Discount Price</th>
                        <th className="p-3">Stock Count</th>
                        <th className="p-3">Availability</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ded0b6]/10">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-[#231a14]/60 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                              <div>
                                <div className="font-bold text-white text-sm">{p.name}</div>
                                <span className="text-[10px] text-slate-400">{p.unit}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-300 font-semibold">{p.category}</td>
                          <td className="p-3 font-bold text-white">LKR {p.price}</td>
                          <td className="p-3 font-bold text-emerald-400">LKR {p.discountPrice}</td>
                          <td className="p-3 font-semibold text-slate-300">{p.stock} units</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              p.inStock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {p.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => groceryStore.toggleStockStatus(p.id)}
                              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer ${
                                p.inStock
                                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {p.inStock ? (
                                <>
                                  <ToggleLeft className="w-4 h-4" />
                                  <span>Make Out of Stock</span>
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="w-4 h-4" />
                                  <span>Make In Stock</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SMS NOTIFICATION ANALYTICS */}
          {activeTab === 'sms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#b08b68]" />
                  <span>SMS Notification Analytics & Gateway Logs</span>
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Gateway Status: 99.8% Delivered
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-[#ded0b6]/15">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Total SMS Sent</span>
                  <div className="text-3xl font-black text-white">{smsLogs.length} Messages</div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">100% Customer Dispatch Rate</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#ded0b6]/15">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Order Placed SMS</span>
                  <div className="text-3xl font-black text-[#ded0b6]">{smsPlacedCount}</div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Instant checkout notifications</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#ded0b6]/15">
                  <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Fulfillment SMS</span>
                  <div className="text-3xl font-black text-emerald-400">{smsPackedCount + smsDeliveryCount}</div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Packed, En Route & Doorstep alerts</span>
                </div>
              </div>

              <div className="glass-panel rounded-3xl border border-[#ded0b6]/15 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#b08b68]" /> Recent Customer SMS Gateway Logs
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1a130e]/80 text-[#ded0b6] uppercase font-bold border-b border-[#ded0b6]/15">
                      <tr>
                        <th className="p-3">Time</th>
                        <th className="p-3">Recipient Phone</th>
                        <th className="p-3">Stage</th>
                        <th className="p-3 hidden sm:table-cell">Message Content</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ded0b6]/10 font-mono">
                      {smsLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#231a14]/60 transition">
                          <td className="p-3 text-slate-400 font-sans">{log.timestamp}</td>
                          <td className="p-3 font-bold text-white font-sans">{log.recipient}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-[#905534]/20 text-[#ded0b6] font-bold text-[10px] font-sans">
                              {log.stage}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 font-sans hidden sm:table-cell">{log.text}</td>
                          <td className="p-3 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] font-sans">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT GATEWAY ANALYSIS */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#b08b68]" />
                  <span>Payment Gateway Analysis & Card Rule Enforcements</span>
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Card Gateway Active (Visa / Mastercard)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-[#b08b68]/40 bg-[#905534]/15 glow-warm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-[#ded0b6] uppercase">Card Payment Volume</span>
                    <CreditCard className="w-4 h-4 text-[#b08b68]" />
                  </div>
                  <div className="text-3xl font-black text-white">LKR {cardVolume.toLocaleString()}</div>
                  <span className="text-[10px] text-[#ded0b6] mt-1 block">{cardOrders.length} Card Transactions</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#ded0b6]/15">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Cash on Delivery</span>
                    <Banknote className="w-4 h-4 text-[#b08b68]" />
                  </div>
                  <div className="text-3xl font-black text-[#ded0b6]">LKR {cashVolume.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400 mt-1 block">{cashOrders.length} Cash Transactions</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#ded0b6]/15">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-amber-400 uppercase">&gt; LKR 2,500 Card Mandates</span>
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-amber-300">{forcedCardCount} Orders</div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Strictly forced card payments</span>
                </div>
              </div>

              <div className="glass-panel rounded-3xl border border-[#ded0b6]/15 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Method Distribution</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-200">Credit / Debit Card Payments ({cardOrders.length} orders)</span>
                      <span className="text-emerald-400 font-extrabold">
                        {orders.length > 0 ? Math.round((cardOrders.length / orders.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-[#ded0b6]/10">
                      <div
                        className="btn-warm h-3 rounded-full transition-all duration-500"
                        style={{ width: `${orders.length > 0 ? (cardOrders.length / orders.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-200">Cash on Delivery ({cashOrders.length} orders)</span>
                      <span className="text-amber-400 font-extrabold">
                        {orders.length > 0 ? Math.round((cashOrders.length / orders.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-[#ded0b6]/10">
                      <div
                        className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${orders.length > 0 ? (cashOrders.length / orders.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ADMIN PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#b08b68]" />
                  <span>Admin Profile & Account Security</span>
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Role: Super Administrator
                </span>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-[#ded0b6]/15 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#905534] to-[#7f4829] flex items-center justify-center text-white font-black text-xl shadow-lg border border-[#ded0b6]/30">
                    AD
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Dasun Wickramarachchi</h3>
                    <p className="text-xs text-[#ded0b6]">Zyara Software Solution Pvt Ltd</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Assigned Branch: {storeLocation.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-[#ded0b6]/15">
                  <div className="p-3.5 rounded-2xl bg-[#1a130e] border border-[#ded0b6]/15 space-y-1">
                    <span className="text-slate-500 font-semibold block">Email Address:</span>
                    <span className="font-bold text-white">admin@zyara.lk</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1a130e] border border-[#ded0b6]/15 space-y-1">
                    <span className="text-slate-500 font-semibold block">Phone Contact:</span>
                    <span className="font-bold text-white">+94 77 123 9988</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1a130e] border border-[#ded0b6]/15 space-y-1">
                    <span className="text-slate-500 font-semibold block">Security Level:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Full System Access
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#1a130e] border border-[#ded0b6]/15 space-y-1">
                    <span className="text-slate-500 font-semibold block">Session Status:</span>
                    <span className="font-bold text-emerald-400">Authenticated & Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Add/Edit Store Branch Modal (Google Maps Auto-Detection) */}
      {(showAddBranchModal || editingBranch) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#b08b68]/40 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#b08b68]" />
                <span>{editingBranch ? 'Edit Store Branch' : 'Add New Store Branch'}</span>
              </h2>
              <button 
                onClick={() => {
                  setShowAddBranchModal(false);
                  setEditingBranch(null);
                }} 
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranchForm} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="UNGI KADE Kurunegala Branch"
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Physical Address (Google Maps Auto-Detects GPS Coordinates) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={branchAddress}
                    onChange={(e) => {
                      setBranchAddress(e.target.value);
                      handleDetectBranchCoordinates(e.target.value);
                    }}
                    placeholder="e.g. No 45 Galle Road, Colombo 03"
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm pr-24"
                  />
                  {isDetectingBranchCoords ? (
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[#b08b68] animate-pulse">
                      Detecting...
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDetectBranchCoordinates(branchAddress)}
                      className="absolute right-2 top-1.5 px-2 py-1 rounded-lg btn-warm text-[10px] font-bold"
                    >
                      Geocode
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Visual Map Picker Button for Admin */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#905534]/30 hover:bg-[#905534]/50 border border-[#b08b68]/50 text-xs font-bold text-[#ded0b6] flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>📍 Select Branch Location on Interactive Map</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={branchLat}
                    onChange={(e) => setBranchLat(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={branchLng}
                    onChange={(e) => setBranchLng(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Branch Manager Name</label>
                  <input
                    type="text"
                    value={branchManager}
                    onChange={(e) => setBranchManager(e.target.value)}
                    placeholder="Saman Kumara"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="+94 37 222 1100"
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBranchModal(false);
                    setEditingBranch(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl btn-warm font-bold text-sm shadow-lg"
                >
                  {editingBranch ? 'Update Store Branch' : 'Save Store Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#b08b68]/40 max-w-lg w-full space-y-4">
            <h2 className="text-xl font-bold text-white">Add New Product to Store</h2>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Fresh Mangoes"
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm bg-[#1a130e]"
                  >
                    {categories.map(c => (
                      <option key={c.id || c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Unit / Size</label>
                  <input
                    type="text"
                    required
                    value={prodUnit}
                    onChange={(e) => setProdUnit(e.target.value)}
                    placeholder="1 kg or 500g"
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Regular Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="850"
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Discount Price (LKR)</label>
                  <input
                    type="number"
                    value={prodDiscountPrice}
                    onChange={(e) => setProdDiscountPrice(e.target.value)}
                    placeholder="720"
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Stock Count</label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                />
              </div>

              {/* Enhanced Image File Upload & URL Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Product Image (File Upload or URL)</label>
                
                <div className="flex gap-2 items-center">
                  <label className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, setProdImage)}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="Or paste image URL (e.g. https://...)"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />

                {/* Live Image Preview */}
                {prodImage && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <img src={prodImage} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Image asset ready</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl btn-warm font-bold text-sm shadow-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal (MongoDB) */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#b08b68]/40 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#ded0b6]/15 pb-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#b08b68]" />
                <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
              </h2>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Organic Beverages"
                  className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Short description for customers..."
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />
              </div>

              {/* Category Image Upload & URL input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Category Cover Image</label>
                
                <div className="flex gap-2">
                  <label className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, setCatImage)}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="Or paste image URL (e.g. https://...)"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs"
                />

                {catImage && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <img src={catImage} alt="Category Preview" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Category image preview</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl btn-warm font-bold text-sm shadow-lg cursor-pointer"
                >
                  {editingCategory ? 'Update Category' : 'Save to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Store Branch Map Picker Modal */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        title="Select Store Branch Location on Map"
        initialLat={branchLat}
        initialLng={branchLng}
        onConfirm={({ lat, lng, address }) => {
          setBranchLat(lat);
          setBranchLng(lng);
          if (address) setBranchAddress(address);
        }}
      />

    </div>
  );
}
