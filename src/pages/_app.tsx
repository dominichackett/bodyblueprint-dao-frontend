import React from 'react';
import { AppProps } from 'next/app';
import { Web3AuthProvider } from '../contexts/Web3AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3AuthProvider>
      <Component {...pageProps} />
    </Web3AuthProvider>
  );
}

export default MyApp;
