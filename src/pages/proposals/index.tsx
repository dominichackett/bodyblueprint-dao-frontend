import React from 'react';
import Layout from '../../components/layout/Layout';
import ProposalsList from '../../components/proposals/ProposalsList';
import { NextPage } from 'next';

const ProposalsPage: NextPage = () => {
  return (
    <Layout>
      <ProposalsList />
    </Layout>
  );
};

export default ProposalsPage;
