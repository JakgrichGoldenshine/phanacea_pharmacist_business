import { useDispatch, useSelector } from 'react-redux';
import {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  selectCartItems,
  selectCartCount,
  selectCartSubtotal,
} from '../redux/cartSlice';

export function useCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);

  return {
    items,
    count,
    subtotal,
    add: (product, quantity = 1) => dispatch(addItem({ ...product, quantity })),
    updateQty: (id, quantity) => dispatch(updateQuantity({ id, quantity })),
    remove: (id) => dispatch(removeItem(id)),
    clear: () => dispatch(clearCart()),
  };
}
