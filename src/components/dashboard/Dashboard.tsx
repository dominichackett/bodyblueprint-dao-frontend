import React, { useEffect, useState } from 'react';
import { useWeb3Auth } from '../../contexts/Web3AuthContext';
import { ethers } from 'ethers';
import Link from 'next/link';
import { Proposal } from '../../contracts/HealthDAOGovernance';
import { ArrowRight, ShieldCheck, Users, Award } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isConnected, address, isMember, tokenBalance, healthDAO } = useWeb3Auth();
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [minTokensForMembership, setMinTokensForMembership] = useState<ethers.BigNumber | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!healthDAO) return;
      
      try {
        setIsLoading(true);
        
        // Get minimum tokens required for membership
        const minTokens = await healthDAO.getMinTokensForMembership();
        setMinTokensForMembership(minTokens);
        
        // Get recent proposals
        const proposalCount = await healthDAO.getProposalCount();
        const recentProposalsData: Proposal[] = [];
        
        // Get the 5 most recent proposals or all if less than 5
        const startIdx = Math.max(1, proposalCount - 4);
        for (let i = startIdx; i <= proposalCount; i++) {
          const proposal = await healthDAO.getProposal(i);
          recentProposalsData.push(proposal);
        }
        
        setRecentProposals(recentProposalsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (healthDAO) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [healthDAO]);

  if (!isConnected) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-cyan-50 flex flex-col items-center justify-center p-4">
        {/* Hero Section */}
        <div className="w-full max-w-5xl mx-auto mb-12 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="Body Blue Print DAO Logo" 
              className="h-32 w-auto" 
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            Welcome to <span className="text-cyan-600">Body Blue Print DAO</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Your decentralized gateway to health optimization and wellness mastery
          </p>
          
         
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">About Body Blue Print DAO</h2>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Body Blue Print is a decentralized autonomous organization dedicated to revolutionizing health and wellness
              content through community governance. Our platform empowers members to propose, curate, and vote on premium
              health resources including personalized meal plans, scientifically-backed workout routines, and holistic
              wellness guides.
            </p>
            
            {/* Feature Boxes */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <ShieldCheck className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="font-bold text-blue-800 text-lg mb-2">Verified Content</h3>
                <p className="text-gray-700">Expert-reviewed health protocols validated by our community</p>
              </div>
              
              <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100">
                <Users className="h-10 w-10 text-cyan-600 mb-3" />
                <h3 className="font-bold text-cyan-800 text-lg mb-2">Community Driven</h3>
                <p className="text-gray-700">Decentralized governance by members for transparent decision making</p>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <Award className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="font-bold text-blue-800 text-lg mb-2">Exclusive Benefits</h3>
                <p className="text-gray-700">Token holders gain access to premium wellness resources</p>
              </div>
            </div>
            
            {/* Membership Info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-xl font-bold text-blue-800 mb-3">Become a Member</h3>
              <p className="text-gray-700 mb-2">
                To join our community and access exclusive content, you need to hold at least <span className="font-bold text-cyan-700">100 HDT tokens</span> in your connected wallet.
              </p>
              <p className="text-gray-700">
                Members can vote on proposals, submit new content ideas, and earn rewards for valuable contributions.
              </p>
            </div>
          </div>
        </div>
        
      
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">
                    {address?.substring(0, 8)}...{address?.substring(address.length - 6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membership Status:</span>
                  {isMember ? (
                    <span className="text-green-600 font-medium">Member</span>
                  ) : (
                    <span className="text-red-600 font-medium">Not a Member</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Balance:</span>
                  <span className="font-medium">{tokenBalance?.toString() || '0'} HDT</span>
                </div>
                {!isMember && minTokensForMembership && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                    <p className="text-yellow-700 text-sm">
                      You need at least {minTokensForMembership.toString()} HDT tokens to become a member.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">DAO Overview</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Proposals:</span>
                  <span className="font-medium">{recentProposals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membership Requirement:</span>
                  <span className="font-medium">{minTokensForMembership?.toString() || '0'} HDT</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Proposals</h2>
              <Link href="/proposals" className="text-mycolor-600 hover:text-indigo-800 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {recentProposals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content CID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Votes
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentProposals.map((proposal, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link href={`/proposals/${index + 1}`} className="text-mycolor-600 hover:text-indigo-900">
                            #{index + 1}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proposal.contentCID.substring(0, 10)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {proposal.executed ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Executed
                            </span>
                          ) : proposal.approved ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Approved
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proposal.totalVotes.toString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {proposal.price.toString()} HDT
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No proposals found.</p>
            )}
          </div>
          
          {isMember && (
            <div className="flex justify-center">
              <Link href="/proposals/create" className="bg-mycolor-600 hover:bg-mycolor-700 text-white px-6 py-3 rounded-md font-medium">
                Create New Proposal
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;