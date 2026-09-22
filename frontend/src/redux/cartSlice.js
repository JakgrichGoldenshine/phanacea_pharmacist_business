import { createSlice } from '@reduxjs/toolkit';

// Cart is stored per account, not globally — each user id (or 'guest' for
// anonymous browsing) gets its own storage bucket. This is what guarantees
// that logging into a different account always starts from an empty
// basket instead of inheriting whatever the previous session had in it.
const storageKey = (ownerId) => `phanacea_cart:${ownerId || 'guest'}`;

function loadCartFor(ownerId) {
  try {
    const raw = localStorage.getItem(storageKey(ownerId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(state) {
  localStorage.setItem(storageKey(state.ownerId), JSON.stringify(state.items));
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { ownerId: null, items: loadCartFor(null) },
  reducers: {
    // Called on login (ownerId = user.id), logout (ownerId = null), and on
    // initial app load once we know whether a session already exists.
    setOwner: (state, action) => {
      const nextOwner = action.payload ?? null;
      if (nextOwner === state.ownerId) return;
      state.ownerId = nextOwner;
      state.items = loadCartFor(nextOwner); // fresh bucket — empty for a brand-new account
    },
    addItem: (state, action) => {
      const { id, name, price, unit, stock_qty, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.id === id);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, stock_qty ?? 999);
      } else {
        state.items.push({ id, name, price, unit, stock_qty, quantity });
      }
      persist(state);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) item.quantity = Math.max(1, Math.min(quantity, item.stock_qty ?? 999));
      persist(state);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      persist(state);
    },
    clearCart: (state) => {
      state.items = [];
      persist(state);
    },
  },
});

export const { setOwner, addItem, updateQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
