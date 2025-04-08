import React, { useState } from 'react';
import { useWeb3Auth } from '../../contexts/Web3AuthContext';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

const CreateProposal: React.FC = () => {
  const { healthDAO, isConnected, isMember } = useWeb3Auth();
  const router = useRouter();
  
  const [contentCID, setContentCID] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!healthDAO) {
      setError('HealthDAO contract not initialized');
      return;
    }
    
    if (!contentCID.trim()) {
      setError('Content CID is required');
      return;
    }
    
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      setError('Price must be a positive number');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert price to BigNumber
      const priceInTokens = ethers.utils.parseUnits(price, 0); // 0 decimals as per contract
      
      // Create proposal
      const tx = await healthDAO.createProposal(contentCID, priceInTokens);
      setSuccess('Proposal creation transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setSuccess('Proposal created successfully!');
      
      // Redirect to proposals list after a short delay
      setTimeout(() => {
        router.push('/proposals');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error creating proposal:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create proposal');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Proposal</h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect your wallet to create a proposal.
        </p>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Proposal</h1>
        <div className="bg-yellow-50 p-4 rounded-md max-w-2xl mx-auto">
          <p className="text-yellow-700 mb-4">
            You need to be a member to create proposals.
          </p>
          <p className="text-yellow-600">
            To become a member, you need to hold at least 100 HDT tokens in your wallet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Proposal</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="contentCID" className="block text-sm font-medium text-gray-700 mb-2">
              Content CID (IPFS)
            </label>
            <input
              type="text"
              id="contentCID"
              value={contentCID}
              onChange={(e) => setContentCID(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              The IPFS Content Identifier (CID) for your health content.
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Retrieval Price (HDT)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="100"
              min="1"
              step="1"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-sm text-gray-500">
              The price in HDT tokens that users will pay to access this content.
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/proposals')}
              className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-mycolor-600 hover:bg-mycolor-700 rounded-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md">
        <h2 className="text-lg font-medium text-blue-800 mb-2">About IPFS Content IDs</h2>
        <p className="text-blue-700 text-sm mb-2">
          Before creating a proposal, you should upload your health content to IPFS and get a Content Identifier (CID).
        </p>
        <p className="text-blue-700 text-sm">
          You can use services like Pinata, Infura IPFS, or Filebase to upload your content to IPFS.
        </p>
      </div>
    </div>
  );
};

export default CreateProposal;
