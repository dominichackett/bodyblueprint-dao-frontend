import React from 'react';
import Layout from '../components/layout/Layout';
import Dashboard from '../components/dashboard/Dashboard';
import { NextPage } from 'next';

const HomePage: NextPage = () => {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default HomePage;
