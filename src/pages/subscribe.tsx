import React from 'react';
import Layout from '../components/layout/Layout';
import SubscriptionManager from '../components/subscription/subscribe'
import { NextPage } from 'next';

const HomePage: NextPage = () => {
  return (
    <Layout>
      <SubscriptionManager />
    </Layout>
  );
};

export default HomePage;
