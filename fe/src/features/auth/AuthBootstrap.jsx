import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, sessionReady } from './authSlice';
import { useRefreshSessionQuery } from './authApi';

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();
  const isReady = useSelector((state) => state.auth.isReady);
  const { data, isSuccess, isError } = useRefreshSessionQuery();

  useEffect(() => {
    if (isSuccess && data) dispatch(login(data));
    else if (isError) dispatch(sessionReady());
  }, [data, dispatch, isError, isSuccess]);

  if (!isReady) {
    return <div className="min-h-screen grid place-items-center text-on-surface-variant">Restoring your session…</div>;
  }

  return children;
}
