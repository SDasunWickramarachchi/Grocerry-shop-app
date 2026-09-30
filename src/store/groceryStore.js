import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

// Initial Mock Product Data
const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Organic Farm Fresh Bananas',
    category: 'Fresh Produce',
    price: 450,
    discountPrice: 380,
    unit: '1 kg',
    stock: 45,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
    description: 'Sweet, rich in potassium, locally grown pesticide-free bananas.'
  },
  {
    id: 'p2',
    name: 'Fresh Red Crisp Apples',
    category: 'Fresh Produce',
    price: 1200,
    discountPrice: 990,
    unit: '1 kg',
    stock: 30,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
    description: 'Juicy, crisp red apples imported from high-altitude orchards.'
  },
  {
    id: 'p3',
    name: 'Pure Whole Fresh Milk',
    category: 'Dairy & Eggs',
    price: 520,
    discountPrice: 480,
    unit: '1 Litre',
    stock: 25,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
    description: 'Pasteurized, 100% natural full cream whole fresh milk.'
  },
  {
    id: 'p4',
    name: 'Farm Free-Range Eggs',
    category: 'Dairy & Eggs',
    price: 680,
    discountPrice: 590,
    unit: 'Pack of 10',
    stock: 15,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
    description: 'Nutritious free-range eggs rich in Omega-3 and proteins.'
  },
  {
    id: 'p5',
    name: 'Artisanal Whole Wheat Bread',
    category: 'Bakery',
    price: 420,
    discountPrice: 360,
    unit: '400g Loaf',
    stock: 20,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: 'Freshly baked daily whole grain bread with flaxseed topping.'
  },
  {
    id: 'p6',
    name: 'Premium Roasted Coffee Beans',
    category: 'Beverages',
    price: 2800,
    discountPrice: 2450,
    unit: '250g Pack',
    stock: 12,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    description: 'Dark roast single-origin Arabica coffee beans.'
  },
  {
    id: 'p7',
    name: 'Cold Pressed Extra Virgin Olive Oil',
    category: 'Pantry',
    price: 3400,
    discountPrice: 2950,
    unit: '500 ml',
    stock: 8,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
    description: '100% cold pressed Mediterranean extra virgin olive oil.'
  },
  {
    id: 'p8',
    name: 'Dark Chocolate Almond Bar (70%)',
    category: 'Snacks & Sweets',
    price: 850,
    discountPrice: 720,
    unit: '100g Bar',
    stock: 0,
    inStock: false,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
    description: 'Rich Belgian dark chocolate blended with roasted almonds.'
  }
];

const DEFAULT_STORE_BRANCHES = [
  {
    id: 'b1',
    name: 'UNGI KADE Main Branch - Colombo 03',
    address: 'No 45, Galle Road, Colombo 03, Sri Lanka',
    lat: 6.9147,
    lng: 79.8516,
    manager: 'Kasun Perera',
    phone: '+94 11 234 5678'
  },
  {
    id: 'b2',
    name: 'UNGI KADE Kandy City Branch',
    address: 'No 12, Dalada Veediya, Kandy, Sri Lanka',
    lat: 7.2906,
    lng: 80.6337,
    manager: 'Nimal Jayasinghe',
    phone: '+94 81 223 4567'
  },
  {
    id: 'b3',
    name: 'UNGI KADE Galle Fort Branch',
    address: 'No 88, Church Street, Galle Fort, Sri Lanka',
    lat: 6.0300,
    lng: 80.2170,
    manager: 'Dilshan Silva',
    phone: '+94 91 222 3456'
  },
  {
    id: 'b4',
    name: 'UNGI KADE Negombo Coastal Branch',
    address: 'No 24, Porutota Road, Negombo, Sri Lanka',
    lat: 7.2307,
    lng: 79.8406,
    manager: 'Ruwan Fernando',
    phone: '+94 31 223 8901'
  }
];

const DEFAULT_ORDERS = [
  {
    id: 'ORD-1092',
    customerName: 'Sarah Jenkins',
    nic: '958210344V',
    phone: '+94 77 123 4567',
    fulfillmentType: 'delivery',
    deliveryAddress: 'No 45, Park Street, Colombo 02',
    distanceKm: 1.2,
    deliveryFee: 30, // (1.2 - 1) * 150 = 30
    itemsSubtotal: 3430,
    totalAmount: 3460,
    paymentMethod: 'card',
    status: 'placed',
    deliveryPin: '1234',
    packedItems: ['p1'],
    deliveryCoordinates: { lat: 6.9163, lng: 79.8540 },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    items: [
      { id: 'p1', name: 'Organic Farm Fresh Bananas', price: 380, quantity: 2 },
      { id: 'p6', name: 'Premium Roasted Coffee Beans', price: 2450, quantity: 1 },
      { id: 'p3', name: 'Pure Whole Fresh Milk', price: 480, quantity: 1 }
    ]
  }
];

const DEFAULT_SMS_LOGS = [
  { id: 'sms_1', recipient: '+94 77 123 4567', text: 'UNGI KADE: Order ORD-1092 Placed! We are packing your items.', stage: 'Order Placed', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), status: 'Delivered' },
  { id: 'sms_2', recipient: '+94 77 987 6543', text: 'UNGI KADE: Order ORD-1088 Ready for Pickup!', stage: 'Order Packed', timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(), status: 'Delivered' }
];

function getStored(key, defaultVal) {
  try {
    const saved = localStorage.getItem('ungikade_' + key);
    return saved ? JSON.parse(saved) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem('ungikade_' + key, JSON.stringify(val));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
}

const listeners = new Set();

const DEFAULT_CATEGORIES = [
  { id: 'cat1', name: 'Fresh Produce', description: 'Farm fresh fruits & organic vegetables', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80', icon: 'Sparkles' },
  { id: 'cat2', name: 'Dairy & Eggs', description: 'Fresh farm milk, cheeses & organic eggs', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80', icon: 'ShieldCheck' },
  { id: 'cat3', name: 'Bakery', description: 'Freshly baked artisanal bread & pastries', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', icon: 'Tag' },
  { id: 'cat4', name: 'Beverages', description: 'Premium coffee, juices & teas', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80', icon: 'Clock' },
  { id: 'cat5', name: 'Pantry', description: 'Essential cooking oils, rice & spices', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80', icon: 'Truck' },
  { id: 'cat6', name: 'Snacks & Sweets', description: 'Delicious chocolates & crispy snacks', image: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=600&q=80', icon: 'Sparkles' }
];

const DEFAULT_USERS = [
  { id: 'usr_dev_1', username: 'Dasun@ZyaraSoft', password: 'ZyaraSoft', role: 'developer', name: 'Dasun Wickramarachchi (Lead Developer)', status: 'approved' },
  { id: 'usr_admin_1', username: 'admin', password: 'admin123', role: 'admin', name: 'Main Store Administrator', status: 'approved' },
  { id: 'usr_staff_1', username: 'staff', password: 'staff123', role: 'staff', name: 'Store Fulfillment Staff', status: 'approved' },
  { id: 'usr_driver_1', username: 'driver', password: 'driver123', role: 'delivery', name: 'Main Delivery Driver', status: 'approved' }
];

let globalState = {
  authToken: getStored('authToken', ''),
  isDemoEnabled: getStored('isDemoEnabled', false),
  users: getStored('users', DEFAULT_USERS),
  categories: getStored('categories', DEFAULT_CATEGORIES),
  products: getStored('products', DEFAULT_PRODUCTS),
  cart: getStored('cart', []),
  orders: getStored('orders', DEFAULT_ORDERS),
  deliveryFeePerKm: getStored('deliveryFeePerKm', 150),
  storeBranches: getStored('storeBranches', DEFAULT_STORE_BRANCHES),
  storeLocation: getStored('storeLocation', DEFAULT_STORE_BRANCHES[0]),
  smsLogs: getStored('smsLogs', DEFAULT_SMS_LOGS),
  systemLogs: getStored('systemLogs', [
    { id: 'l1', timestamp: new Date().toLocaleTimeString(), text: 'System initialized. UNGI KADE PWA engine ready.', type: 'system' }
  ]),
  notifications: []
};

function getAuthHeaders() {
  const token = globalState.authToken || getStored('authToken', '');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}


function notifySubscribers() {
  listeners.forEach(fn => fn({ ...globalState }));
}

export const groceryStore = {
  getState: () => ({ ...globalState }),

  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  log: (text, type = 'info') => {
    const newLog = {
      id: 'log_' + Date.now() + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString(),
      text,
      type
    };
    globalState.systemLogs = [newLog, ...globalState.systemLogs].slice(0, 100);
    setStored('systemLogs', globalState.systemLogs);
    notifySubscribers();
  },

  logSms: (recipient, text, stage) => {
    const newSms = {
      id: 'sms_' + Date.now(),
      recipient: recipient || 'Customer',
      text,
      stage,
      timestamp: new Date().toLocaleTimeString(),
      status: 'Delivered'
    };
    globalState.smsLogs = [newSms, ...globalState.smsLogs];
    setStored('smsLogs', globalState.smsLogs);
    notifySubscribers();
  },

  pushNotification: (title, message, type = 'info') => {
    const id = 'notif_' + Date.now();
    const notif = { id, title, message, type, timestamp: new Date().toLocaleTimeString() };
    globalState.notifications = [notif, ...globalState.notifications];
    notifySubscribers();
    
    setTimeout(() => {
      globalState.notifications = globalState.notifications.filter(n => n.id !== id);
      notifySubscribers();
    }, 6000);
  },

  dismissNotification: (id) => {
    globalState.notifications = globalState.notifications.filter(n => n.id !== id);
    notifySubscribers();
  },

  calculateDeliveryFee: (distanceKm) => {
    const d = parseFloat(distanceKm) || 0;
    if (d <= 1) return 0;
    return Math.round((d - 1) * globalState.deliveryFeePerKm);
  },

  setDeliveryFeePerKm: (rate) => {
    const newRate = Math.max(0, parseInt(rate) || 0);
    globalState.deliveryFeePerKm = newRate;
    setStored('deliveryFeePerKm', newRate);
    groceryStore.log(`Admin updated delivery charge rate to LKR ${newRate}/KM (First KM remains FREE).`, 'admin');
    groceryStore.pushNotification('Delivery Rate Updated', `New rate: LKR ${newRate}/KM after 1st free KM.`, 'success');
    notifySubscribers();
  },

  // Branch CRUD (Add, Edit, Delete)
  addStoreBranch: (branchData) => {
    const newBranch = {
      id: 'b_' + Date.now(),
      name: branchData.name,
      address: branchData.address,
      lat: parseFloat(branchData.lat) || 6.9147,
      lng: parseFloat(branchData.lng) || 79.8516,
      manager: branchData.manager || 'Branch Manager',
      phone: branchData.phone || '+94 11 200 0000'
    };

    globalState.storeBranches = [newBranch, ...globalState.storeBranches];
    setStored('storeBranches', globalState.storeBranches);
    groceryStore.log(`Admin created new store branch: ${newBranch.name} (${newBranch.address}).`, 'admin');
    groceryStore.pushNotification('Branch Created', `${newBranch.name} added to store network!`, 'success');

    try {
      fetch(`${API_BASE_URL}/api/branches`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newBranch)
      }).catch(err => console.log('API branch sync error:', err));
    } catch(e){}

    notifySubscribers();
  },

  updateStoreBranch: (branchId, updatedData) => {
    let updatedBranch = null;
    const updatedBranches = globalState.storeBranches.map(b => {
      if (b.id === branchId || b._id === branchId || b.name === branchId) {
        updatedBranch = {
          ...b,
          name: updatedData.name || b.name,
          address: updatedData.address || b.address,
          lat: parseFloat(updatedData.lat) || b.lat,
          lng: parseFloat(updatedData.lng) || b.lng,
          manager: updatedData.manager || b.manager,
          phone: updatedData.phone || b.phone
        };
        return updatedBranch;
      }
      return b;
    });

    globalState.storeBranches = updatedBranches;
    setStored('storeBranches', updatedBranches);

    // If active branch was modified, sync storeLocation
    if (updatedBranch && (globalState.storeLocation.id === branchId || globalState.storeLocation._id === branchId || globalState.storeLocation.name === updatedBranch.name)) {
      globalState.storeLocation = updatedBranch;
      setStored('storeLocation', globalState.storeLocation);
    }

    groceryStore.log(`Admin updated store branch: ${updatedData.name || branchId}.`, 'admin');
    groceryStore.pushNotification('Branch Updated', `Store branch details updated successfully!`, 'success');

    if (updatedBranch) {
      try {
        fetch(`${API_BASE_URL}/api/branches/${branchId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedBranch)
        }).catch(err => console.log('API branch sync error:', err));
      } catch(e){}
    }

    notifySubscribers();
  },

  deleteStoreBranch: (branchId) => {
    const targetBranch = globalState.storeBranches.find(b => b.id === branchId || b._id === branchId || b.name === branchId);
    if (!targetBranch) return;

    if (globalState.storeBranches.length <= 1) {
      groceryStore.pushNotification('Cannot Delete Branch', 'At least one store branch must remain active.', 'warning');
      return;
    }

    const targetId = targetBranch.id || targetBranch._id;
    const updatedBranches = globalState.storeBranches.filter(b => b.id !== targetId && b._id !== targetId && b.name !== targetBranch.name);
    globalState.storeBranches = updatedBranches;
    setStored('storeBranches', updatedBranches);

    if (globalState.storeLocation.id === targetId || globalState.storeLocation._id === targetId || globalState.storeLocation.name === targetBranch.name) {
      globalState.storeLocation = updatedBranches[0];
      setStored('storeLocation', globalState.storeLocation);
    }

    groceryStore.log(`Admin deleted store branch: ${targetBranch.name}.`, 'admin');
    groceryStore.pushNotification('Branch Deleted', `Store branch '${targetBranch.name}' has been deleted.`, 'info');

    try {
      fetch(`${API_BASE_URL}/api/branches/${targetId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).catch(err => console.log('API branch delete error:', err));
    } catch(e){}

    notifySubscribers();
  },

  setStoreLocation: (locationData) => {
    globalState.storeLocation = {
      ...globalState.storeLocation,
      ...locationData
    };
    setStored('storeLocation', globalState.storeLocation);
    groceryStore.log(`Admin updated active origin branch to: ${globalState.storeLocation.name}.`, 'admin');
    groceryStore.pushNotification('Active Branch Set', `Current Store Origin: ${globalState.storeLocation.name}`, 'success');
    notifySubscribers();
  },

  addToCart: (product, qty = 1) => {
    if (!product.inStock) {
      groceryStore.pushNotification('Item Out of Stock', `${product.name} is currently unavailable.`, 'warning');
      return;
    }

    const existingIndex = globalState.cart.findIndex(item => item.product.id === product.id);
    let updatedCart = [...globalState.cart];

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += qty;
    } else {
      updatedCart.push({ product, quantity: qty });
    }

    globalState.cart = updatedCart;
    setStored('cart', updatedCart);
    groceryStore.pushNotification('Added to Cart', `${product.name} (x${qty}) added to your basket.`, 'success');
    notifySubscribers();
  },

  updateCartQty: (productId, qty) => {
    if (qty <= 0) {
      groceryStore.removeFromCart(productId);
      return;
    }
    const updatedCart = globalState.cart.map(item =>
      item.product.id === productId ? { ...item, quantity: qty } : item
    );
    globalState.cart = updatedCart;
    setStored('cart', updatedCart);
    notifySubscribers();
  },

  removeFromCart: (productId) => {
    const updatedCart = globalState.cart.filter(item => item.product.id !== productId);
    globalState.cart = updatedCart;
    setStored('cart', updatedCart);
    notifySubscribers();
  },

  clearCart: () => {
    globalState.cart = [];
    setStored('cart', []);
    notifySubscribers();
  },

  placeOrder: (orderData) => {
    const { customerName, nic, phone, fulfillmentType, deliveryAddress, distanceKm, paymentMethod } = orderData;
    
    const itemsSubtotal = globalState.cart.reduce((sum, item) => {
      const p = item.product.discountPrice || item.product.price;
      return sum + p * item.quantity;
    }, 0);

    const deliveryFee = fulfillmentType === 'delivery' ? groceryStore.calculateDeliveryFee(distanceKm) : 0;
    const totalAmount = itemsSubtotal + deliveryFee;

    if (totalAmount > 2500 && paymentMethod === 'cash') {
      groceryStore.pushNotification('Payment Rule Alert', 'Orders above 2,500 must be paid by Card!', 'error');
      throw new Error('Orders above 2,500 must be paid by Card!');
    }

    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    let destLat = (parseFloat(globalState.storeLocation.lat) + (Math.random() - 0.5) * 0.02).toFixed(4);
    let destLng = (parseFloat(globalState.storeLocation.lng) + (Math.random() - 0.5) * 0.02).toFixed(4);

    const newOrder = {
      id: orderId,
      customerName,
      nic,
      phone,
      fulfillmentType,
      deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress : 'Store Pickup (In-Store)',
      distanceKm: fulfillmentType === 'delivery' ? parseFloat(distanceKm) || 1 : 0,
      deliveryFee,
      itemsSubtotal,
      totalAmount,
      paymentMethod,
      status: 'placed',
      deliveryPin,
      packedItems: [],
      deliveryCoordinates: { lat: destLat, lng: destLng },
      createdAt: new Date().toISOString(),
      items: globalState.cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.discountPrice || item.product.price,
        quantity: item.quantity
      }))
    };

    globalState.orders = [newOrder, ...globalState.orders];
    setStored('orders', globalState.orders);

    globalState.cart = [];
    setStored('cart', []);

    groceryStore.log(`New Order ${orderId} placed by ${customerName} (${paymentMethod.toUpperCase()}, Total: LKR ${totalAmount}). Delivery PIN: ${deliveryPin}`, 'order');
    
    // 1. SMS Stage: Order Placed (includes 4-digit PIN for customer)
    const smsMsg = fulfillmentType === 'delivery'
      ? `UNGI KADE: Order ${orderId} Placed! Total LKR ${totalAmount}. Your Delivery Verification PIN is [${deliveryPin}]. Please give this PIN to driver on arrival.`
      : `UNGI KADE: Order ${orderId} Placed! Total LKR ${totalAmount}. We are preparing your pickup items.`;
    groceryStore.logSms(phone, smsMsg, 'Order Placed');

    groceryStore.pushNotification(
      '🎉 Order Placed Successfully!',
      `Order ${orderId} submitted! Delivery PIN [${deliveryPin}] sent via SMS to ${phone}.`,
      'success'
    );

    notifySubscribers();
    return newOrder;
  },

  verifyAndCompleteDelivery: (orderId, inputPin) => {
    const order = globalState.orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found!' };

    const expectedPin = (order.deliveryPin || '1234').toString().trim();
    const cleanInput = (inputPin || '').toString().trim();

    if (cleanInput !== expectedPin) {
      groceryStore.pushNotification('Invalid Delivery PIN', 'The PIN entered does not match customer SMS PIN!', 'error');
      return { success: false, message: `Invalid PIN! Please ask ${order.customerName} for the 4-digit PIN received via SMS.` };
    }

    groceryStore.updateOrderStatus(orderId, 'delivered');
    groceryStore.pushNotification('🎉 Delivery Verified!', `Order ${orderId} PIN [${cleanInput}] verified successfully!`, 'success');
    return { success: true };
  },

  toggleItemPacked: (orderId, productId) => {
    const updatedOrders = globalState.orders.map(order => {
      if (order.id === orderId) {
        const isPacked = order.packedItems.includes(productId);
        const packedItems = isPacked
          ? order.packedItems.filter(id => id !== productId)
          : [...order.packedItems, productId];
        return { ...order, packedItems };
      }
      return order;
    });

    globalState.orders = updatedOrders;
    setStored('orders', updatedOrders);
    notifySubscribers();
  },

  updateOrderStatus: (orderId, newStatus) => {
    let updatedOrder = null;
    const updatedOrders = globalState.orders.map(order => {
      if (order.id === orderId) {
        updatedOrder = { ...order, status: newStatus };
        return updatedOrder;
      }
      return order;
    });

    globalState.orders = updatedOrders;
    setStored('orders', updatedOrders);

    if (updatedOrder) {
      groceryStore.log(`Order ${orderId} status changed to '${newStatus.toUpperCase()}'.`, 'status');

      if (newStatus === 'packed' || newStatus === 'confirmed') {
        // 2. SMS Stage: Order Packed (includes 4-digit PIN)
        const pinText = updatedOrder.fulfillmentType === 'delivery' ? ` Delivery Verification PIN is [${updatedOrder.deliveryPin || '1234'}].` : '';
        const smsMsg = `UNGI KADE: Order ${orderId} is Packed & Ready for ${updatedOrder.fulfillmentType === 'delivery' ? 'delivery dispatch' : 'store pickup'}!${pinText}`;
        groceryStore.logSms(updatedOrder.phone, smsMsg, 'Order Packed');
        
        groceryStore.pushNotification(
          '🛍️ Order Packed!',
          `Store Staff confirmed Order ${orderId}! SMS confirmation dispatched to ${updatedOrder.phone}.`,
          'success'
        );
      } else if (newStatus === 'out_for_delivery') {
        groceryStore.pushNotification(
          '🚚 Delivery Driver En Route!',
          `Order ${orderId} is out for delivery! Driver navigating from ${globalState.storeLocation.name} to ${updatedOrder.deliveryAddress}.`,
          'info'
        );
      } else if (newStatus === 'delivered') {
        // 3. SMS Stage: Order on Door Steps (Delivered & PIN Verified)
        const smsMsg = `UNGI KADE: Order ${orderId} has arrived on your doorsteps and delivery PIN [${updatedOrder.deliveryPin || '1234'}] was verified! Thank you for shopping with UNGI KADE.`;
        groceryStore.logSms(updatedOrder.phone, smsMsg, 'On Doorsteps');

        groceryStore.pushNotification(
          '🏡 Delivered to Doorstep!',
          `Order ${orderId} delivered! SMS doorstep notification sent to ${updatedOrder.phone}.`,
          'success'
        );
      }
    }

    notifySubscribers();
  },

  addProduct: (productData) => {
    const newProduct = {
      id: 'p_' + Date.now(),
      name: productData.name,
      category: productData.category || 'General',
      price: parseFloat(productData.price) || 0,
      discountPrice: parseFloat(productData.discountPrice) || parseFloat(productData.price) || 0,
      unit: productData.unit || '1 unit',
      stock: parseInt(productData.stock) || 10,
      inStock: (parseInt(productData.stock) || 0) > 0,
      image: productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      description: productData.description || 'Fresh item added by Admin'
    };

    globalState.products = [newProduct, ...globalState.products];
    setStored('products', globalState.products);
    groceryStore.log(`Admin added new product: ${newProduct.name} (Price: LKR ${newProduct.price}).`, 'admin');
    groceryStore.pushNotification('Product Added', `${newProduct.name} is now live in store!`, 'success');

    // Sync product to database backend
    try {
      fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newProduct)
      }).catch(err => console.log('API sync status:', err));
    } catch(e){}

    notifySubscribers();
  },

  toggleStockStatus: (productId) => {
    let updatedTarget = null;
    const updatedProducts = globalState.products.map(p => {
      if (p.id === productId || p._id === productId) {
        const nextState = !p.inStock;
        updatedTarget = { ...p, inStock: nextState, stock: nextState ? (p.stock || 10) : 0 };
        return updatedTarget;
      }
      return p;
    });

    globalState.products = updatedProducts;
    setStored('products', updatedProducts);

    if (updatedTarget) {
      try {
        fetch(`${API_BASE_URL}/api/products/${productId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedTarget)
        }).catch(err => console.log('API sync status:', err));
      } catch(e){}
    }

    notifySubscribers();
  },

  addCategory: (catData) => {
    const newCat = {
      id: 'cat_' + Date.now(),
      name: catData.name || 'New Category',
      description: catData.description || '',
      image: catData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      icon: catData.icon || 'Sparkles'
    };
    globalState.categories = [...globalState.categories, newCat];
    setStored('categories', globalState.categories);
    groceryStore.log(`Admin created new category: ${newCat.name}`, 'admin');
    groceryStore.pushNotification('Category Created', `Category "${newCat.name}" created successfully!`, 'success');

    // Sync with API backend
    try {
      fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newCat)
      }).catch(err => console.log('API sync status:', err));
    } catch(e){}

    notifySubscribers();
  },

  updateCategory: (id, updatedFields) => {
    const updatedCats = globalState.categories.map(c => {
      if (c.id === id || c._id === id) {
        return { ...c, ...updatedFields };
      }
      return c;
    });
    globalState.categories = updatedCats;
    setStored('categories', updatedCats);
    groceryStore.log(`Admin updated category: ${updatedFields.name || id}`, 'admin');
    groceryStore.pushNotification('Category Updated', `Category updated successfully!`, 'info');

    try {
      fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      }).catch(err => console.log('API sync status:', err));
    } catch(e){}

    notifySubscribers();
  },

  deleteCategory: (id) => {
    const target = globalState.categories.find(c => c.id === id || c._id === id);
    const updatedCats = globalState.categories.filter(c => c.id !== id && c._id !== id);
    globalState.categories = updatedCats;
    setStored('categories', updatedCats);
    groceryStore.log(`Admin deleted category: ${target?.name || id}`, 'admin');
    groceryStore.pushNotification('Category Removed', `Category removed successfully!`, 'warning');

    try {
      fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      }).catch(err => console.log('API sync status:', err));
    } catch(e){}

    notifySubscribers();
  },

  registerUser: (userData) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      username: userData.username.trim(),
      password: userData.password.trim(),
      role: userData.role,
      name: userData.name || userData.username,
      phone: userData.phone || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    globalState.users = [newUser, ...globalState.users];
    setStored('users', globalState.users);
    groceryStore.log(`New Account Registration: ${newUser.username} (${newUser.role.toUpperCase()}) - Pending Approval.`, 'auth');
    groceryStore.pushNotification('Registration Submitted', `Account ${newUser.username} is pending approval!`, 'info');

    try {
      fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(e => {});
    } catch(e){}

    notifySubscribers();
    return newUser;
  },

  approveUser: (userId) => {
    const updatedUsers = globalState.users.map(u => {
      if (u.id === userId || u._id === userId) {
        return { ...u, status: 'approved' };
      }
      return u;
    });
    globalState.users = updatedUsers;
    setStored('users', updatedUsers);
    groceryStore.pushNotification('Account Approved', `User account approved!`, 'success');

    try {
      fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'approved' })
      }).catch(e => {});
    } catch(e){}

    notifySubscribers();
  },

  rejectUser: (userId) => {
    const updatedUsers = globalState.users.map(u => {
      if (u.id === userId || u._id === userId) {
        return { ...u, status: 'rejected' };
      }
      return u;
    });
    globalState.users = updatedUsers;
    setStored('users', updatedUsers);
    groceryStore.pushNotification('Account Rejected', `User registration rejected.`, 'warning');

    try {
      fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'rejected' })
      }).catch(e => {});
    } catch(e){}

    notifySubscribers();
  },

  setAuthToken: (token) => {
    globalState.authToken = token;
    setStored('authToken', token);
    notifySubscribers();
  },


  toggleDemoMode: () => {
    globalState.isDemoEnabled = !globalState.isDemoEnabled;
    setStored('isDemoEnabled', globalState.isDemoEnabled);
    groceryStore.log(`Master Developer toggled Demo Mode: ${globalState.isDemoEnabled ? 'ENABLED' : 'DISABLED'}.`, 'auth');
    groceryStore.pushNotification('Demo Mode', `Demo Mode is now ${globalState.isDemoEnabled ? 'ENABLED' : 'DISABLED'}`, 'info');
    notifySubscribers();
  },

  resetStoreData: () => {
    globalState.products = DEFAULT_PRODUCTS;
    globalState.cart = [];
    globalState.orders = DEFAULT_ORDERS;
    globalState.deliveryFeePerKm = 150;
    globalState.storeBranches = DEFAULT_STORE_BRANCHES;
    globalState.storeLocation = DEFAULT_STORE_BRANCHES[0];
    globalState.smsLogs = DEFAULT_SMS_LOGS;
    globalState.systemLogs = [
      { id: 'l_reset', timestamp: new Date().toLocaleTimeString(), text: 'Developer triggered database reset to factory state.', type: 'developer' }
    ];
    localStorage.removeItem('ungikade_products');
    localStorage.removeItem('ungikade_cart');
    localStorage.removeItem('ungikade_orders');
    localStorage.removeItem('ungikade_deliveryFeePerKm');
    localStorage.removeItem('ungikade_storeBranches');
    localStorage.removeItem('ungikade_storeLocation');
    localStorage.removeItem('ungikade_smsLogs');
    localStorage.removeItem('ungikade_systemLogs');
    groceryStore.pushNotification('Database Reset', 'Store reset to default mock state.', 'info');
    notifySubscribers();
  },

  syncFromDatabase: async () => {
    try {
      // 1. Sync Categories
      const catRes = await fetch(`${API_BASE_URL}/api/categories`);
      if (catRes.ok) {
        const cats = await catRes.json();
        if (Array.isArray(cats) && cats.length > 0) {
          globalState.categories = cats;
          setStored('categories', cats);
        }
      }

      // 2. Sync Store Branches
      const branchRes = await fetch(`${API_BASE_URL}/api/branches`);
      if (branchRes.ok) {
        const branches = await branchRes.json();
        if (Array.isArray(branches) && branches.length > 0) {
          globalState.storeBranches = branches;
          setStored('storeBranches', branches);

          const activeId = globalState.storeLocation.id || globalState.storeLocation._id;
          const foundActive = branches.find(b => b.id === activeId || b._id === activeId || b.name === globalState.storeLocation.name);
          if (foundActive) {
            globalState.storeLocation = foundActive;
          } else {
            globalState.storeLocation = branches[0];
          }
          setStored('storeLocation', globalState.storeLocation);
        }
      }

      // 3. Sync Products
      const prodRes = await fetch(`${API_BASE_URL}/api/products`);
      if (prodRes.ok) {
        const prods = await prodRes.json();
        if (Array.isArray(prods) && prods.length > 0) {
          globalState.products = prods;
          setStored('products', prods);
        }
      }

      notifySubscribers();
    } catch (err) {
      console.log('Database sync status:', err);
    }
  }
};

// Initial non-blocking DB sync on module load
groceryStore.syncFromDatabase();

export function useGroceryStore() {
  const [state, setState] = useState(groceryStore.getState());

  useEffect(() => {
    const unsubscribe = groceryStore.subscribe((newState) => {
      setState(newState);
    });

    // Multi-Device Realtime Polling Sync (e.g., Cloudflare Pages across 2 devices)
    const interval = setInterval(() => {
      groceryStore.syncFromDatabase();
    }, 8000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { ...state, ...groceryStore };
}

