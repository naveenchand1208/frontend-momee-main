'use client';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../common/store/store';
import BootstrapProvider from './BootstrapProvider';
import ThemeProviderWrapper from './ThemeProviderWrapper';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/page';
import ClientSocketProvider from './ClientSocketProvider';

export default function ClientLayoutWrapper({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>

        <BootstrapProvider />
        <ClientSocketProvider />
        <Layout>
          <Toaster
            toastOptions={{
              style: {
                fontSize: '16px',
                padding: '12px 20px',
                background: '#333',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                style: {
                  background: '#4BB543',
                },
              },
              error: {
                style: {
                  background: '#FF3333',
                },
              },
            }}
          />
          <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
        </Layout>
      </PersistGate>
    </Provider>
  );
}
