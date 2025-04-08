import React, { useEffect, useState } from 'react';
import { useWeb3Auth } from '../../contexts/Web3AuthContext';
import { Proposal } from '../../contracts/HealthDAOGovernance';
import { ethers } from 'ethers';
import Link from 'next/link';
interface ProposalDetailProps {
  proposalId: number;
}

const ProposalDetail: React.FC<ProposalDetailProps> = ({ proposalId }) => {
  const { healthDAO, isConnected, address, isMember, tokenBalance } = useWeb3Auth();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [userVotes, setUserVotes] = useState<ethers.BigNumber | null>(null);
  const [voteAmount, setVoteAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProposalData = async () => {
      if (!healthDAO || !address) return;
      
      try {
        setIsLoading(true);
        
        // Get proposal details
        const proposalData = await healthDAO.getProposal(proposalId);
        setProposal(proposalData);
        
        // Get user's votes for this proposal
        const votes = await healthDAO.getVotes(proposalId, address);
        setUserVotes(votes);
      } catch (error) {
        console.error('Error fetching proposal data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (healthDAO && address) {
      fetchProposalData();
    } else {
      setIsLoading(false);
    }
  }, [healthDAO, proposalId, address]);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!healthDAO) {
      setError('HealthDAO contract not initialized');
      return;
    }
    
    if (!voteAmount.trim() || isNaN(Number(voteAmount)) || Number(voteAmount) <= 0) {
      setError('Vote amount must be a positive number');
      return;
    }
    
    if (!tokenBalance || tokenBalance.lt(ethers.BigNumber.from(voteAmount))) {
      setError('Insufficient token balance');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert vote amount to BigNumber
      const voteTokens = ethers.utils.parseUnits(voteAmount, 0); // 0 decimals as per contract
      
      // Vote on proposal
      const tx = await healthDAO.vote(proposalId, voteTokens);
      setSuccess('Vote transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setSuccess('Vote cast successfully!');
      
      // Refresh proposal data
      const proposalData = await healthDAO.getProposal(proposalId);
      setProposal(proposalData);
      
      // Refresh user's votes
      const votes = await healthDAO.getVotes(proposalId, address as string);
      setUserVotes(votes);
      
      // Clear vote amount
      setVoteAmount('');
    } catch (err: unknown) {
      console.error('Error voting on proposal:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to vote on proposal');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecute = async () => {
    if (!healthDAO || !proposal) {
      setError('HealthDAO contract not initialized or proposal not loaded');
      return;
    }
    
    if (!proposal.approved) {
      setError('Proposal must be approved before it can be executed');
      return;
    }
    
    if (proposal.executed) {
      setError('Proposal has already been executed');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Execute proposal
      const tx = await healthDAO.setRetrievalPrice(proposalId);
      setSuccess('Execution transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setSuccess('Proposal executed successfully!');
      
      // Refresh proposal data
      const proposalData = await healthDAO.getProposal(proposalId);
      setProposal(proposalData);
    } catch (err: unknown) {
      console.error('Error executing proposal:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to execute proposal');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Proposal Details</h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect your wallet to view proposal details.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/proposals" className="text-mycolor-600 hover:text-indigo-800 mr-4">
          &larr; Back to Proposals
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Proposal #{proposalId}</h1>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading proposal data...</p>
        </div>
      ) : proposal ? (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Proposal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Proposer:</span>{' '}
                  {proposal.proposer.substring(0, 6)}...{proposal.proposer.substring(proposal.proposer.length - 4)}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Content CID:</span>{' '}
                  {proposal.contentCID}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Price:</span>{' '}
                  {proposal.price.toString()} HDT
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Status:</span>{' '}
                  {proposal.executed ? (
                    <span className="text-green-600">Executed</span>
                  ) : proposal.approved ? (
                    <span className="text-blue-600">Approved</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Total Votes:</span>{' '}
                  {proposal.totalVotes.toString()} HDT
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Your Votes:</span>{' '}
                  {userVotes?.toString() || '0'} HDT
                </p>
              </div>
            </div>
            
            {proposal.executed && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-green-700">
                  This proposal has been executed and the content is now available for retrieval at the set price.
                </p>
              </div>
            )}
          </div>
          
          {isMember && !proposal.executed && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              {!proposal.approved ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Vote on Proposal</h2>
                  <form onSubmit={handleVote}>
                    <div className="mb-4">
                      <label htmlFor="voteAmount" className="block text-sm font-medium text-gray-700 mb-2">
                        Vote Amount (HDT)
                      </label>
                      <input
                        type="number"
                        id="voteAmount"
                        value={voteAmount}
                        onChange={(e) => setVoteAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="100"
                        min="1"
                        step="1"
                        disabled={isSubmitting}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Your current token balance: {tokenBalance?.toString() || '0'} HDT
                      </p>
                    </div>
                    
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                        {success}
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-mycolor-600 hover:bg-mycolor-700 rounded-md"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Voting...' : 'Vote'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Execute Proposal</h2>
                  <p className="text-gray-600 mb-4">
                    This proposal has been approved and is ready to be executed. Executing the proposal will set the retrieval price for the content.
                  </p>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
                      {success}
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleExecute}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Executing...' : 'Execute Proposal'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-blue-800 mb-2">About IPFS Content</h2>
            <p className="text-blue-700 text-sm mb-2">
              The content for this proposal is stored on IPFS with the CID: {proposal.contentCID}
            </p>
            <p className="text-blue-700 text-sm">
              You can view the content by visiting: <a href={`https://ipfs.io/ipfs/${proposal.contentCID}`} target="_blank" rel="noopener noreferrer" className="underline">https://ipfs.io/ipfs/{proposal.contentCID}</a>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
          <p className="text-yellow-700">
            Proposal #{proposalId} not found or could not be loaded.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProposalDetail;
