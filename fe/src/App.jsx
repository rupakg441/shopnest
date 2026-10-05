import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AppRoutes from './routes/AppRoutes';
import AuthBootstrap from './features/auth/AuthBootstrap';
import CustomerDataSync from './features/cart/CustomerDataSync';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthBootstrap>
          <CustomerDataSync />
          <AppRoutes />
        </AuthBootstrap>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
