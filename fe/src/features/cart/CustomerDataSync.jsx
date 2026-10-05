import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCartQuery } from './cartApi';
import { setCart } from './cartSlice';
import { useGetWishlistQuery } from '../wishlist/wishlistApi';
import { setWishlist } from '../ui/uiSlice';

export default function CustomerDataSync() {
  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const { data: cart } = useGetCartQuery(undefined, { skip: !authenticated });
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !authenticated });

  useEffect(() => {
    if (cart) dispatch(setCart(cart));
  }, [cart, dispatch]);

  useEffect(() => {
    if (wishlist) dispatch(setWishlist(wishlist.items.map((item) => item.id)));
  }, [dispatch, wishlist]);

  return null;
}
