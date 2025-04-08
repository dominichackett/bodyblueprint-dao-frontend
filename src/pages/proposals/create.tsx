import React from 'react';
import Layout from '../../components/layout/Layout';
import CreateProposal from '../../components/proposals/CreateProposal';
import { NextPage } from 'next';

const CreateProposalPage: NextPage = () => {
  return (
    <Layout>
      <CreateProposal />
    </Layout>
  );
};

export default CreateProposalPage;
