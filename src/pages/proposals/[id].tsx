import React from 'react';
import Layout from '../../components/layout/Layout';
import ProposalDetail from '../../components/proposals/ProposalDetail';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const ProposalDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // Convert id to number, default to 1 if not available
  const proposalId = id ? parseInt(id as string, 10) : 1;
  
  return (
    <Layout>
      <ProposalDetail proposalId={proposalId} />
    </Layout>
  );
};

export default ProposalDetailPage;
