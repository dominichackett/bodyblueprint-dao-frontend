import React, { useEffect, useState } from 'react';
import { useWeb3Auth } from '../../contexts/Web3AuthContext';
import { ethers } from 'ethers';
import { HealthDAOStorage } from '../../contracts/StorageContract';
import { Clock, Download } from 'lucide-react';



const storageAddress = process.env.NEXT_PUBLIC_STORAGE_ADDRESS

const SubscriptionManager = () => {
  const { isConnected, address, signer, daoToken } = useWeb3Auth();
  
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscriptionFee, setSubscriptionFee] = useState<string>('0');
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [healthDAOStorage, setHealthDAOStorage] = useState<HealthDAOStorage | null>(null);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string>('');

  useEffect(() => {
    if (signer && storageAddress) {
      // Initialize the HealthDAOStorage contract
      const storage = new HealthDAOStorage(storageAddress, signer);
      setHealthDAOStorage(storage);
    }
  }, [signer, storageAddress]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!healthDAOStorage || !address) return;

      try {
        setIsLoading(true);
        
        // Check if user is subscribed
        const subscribed = await healthDAOStorage.isUserSubscribed(address);
        setIsSubscribed(subscribed);
        
        // Get subscription fee
        const fee = await healthDAOStorage.getSubscriptionFee();
        setSubscriptionFee(fee.toString());
        
        // If subscribed, get expiration date
        if (subscribed) {
          const expiry = await healthDAOStorage.getSubscriptionExpiration(address);
          const expiryDate = new Date(expiry.toNumber() * 1000);
          setSubscriptionExpiry(expiryDate.toLocaleDateString());
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (healthDAOStorage && address) {
      fetchSubscriptionData();
    }
  }, [healthDAOStorage, address]);

  const handleSubscribe = async () => {
    if (!healthDAOStorage || !daoToken) return;

    try {
      // First approve the token transfer
      setIsApproving(true);
      const governanceAddress = await healthDAOStorage.getGovernanceAddress();
      const fee = await healthDAOStorage.getSubscriptionFee();
      
      const approveTx = await daoToken.approve(storageAddress, fee);
      await approveTx.wait();
      setIsApproving(false);
      
      // Then subscribe
      setIsSubscribing(true);
      const tx = await healthDAOStorage.subscribe();
      await tx.wait();
      setTransactionHash(tx.hash);
      
      // Update subscription status
      setIsSubscribed(true);
      const expiry = await healthDAOStorage.getSubscriptionExpiration(address);
      const expiryDate = new Date(expiry.toNumber() * 1000);
      setSubscriptionExpiry(expiryDate.toLocaleDateString());
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDownload = () => {
    // Dummy download function
    alert('Downloading content...');
    
    // Simulate download by creating a dummy text file
    const element = document.createElement('a');
    const file = new Blob(['This is your downloaded content from HealthDAO'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'healthdao-content.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Body Blue Print Subscription</h2>
        <p className="text-gray-600">Connect your wallet to view subscription details.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse flex flex-col items-center py-4">
          <div className="h-8 w-8 mb-4 rounded-full bg-blue-200"></div>
          <p className="text-gray-600 font-medium">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl p-6 mt-8">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
        <span className="inline-block w-8 h-8 bg-blue-100 rounded-full mr-3 flex items-center justify-center">
          <span className="text-blue-600">🔐</span>
        </span>
        Body Blue Print DAO Subscription
      </h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-gray-600 font-medium">Subscription Status:</span>
          {isSubscribed ? (
            <span className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-lg flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Active
            </span>
          ) : (
            <span className="bg-red-100 text-red-700 font-medium px-3 py-1 rounded-lg flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Inactive
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <span className="text-gray-600 font-medium">Subscription Fee:</span>
          <span className="font-medium bg-blue-50 py-1 px-3 rounded-lg text-blue-700">
            {subscriptionFee} HDT per month
          </span>
        </div>
        
        {isSubscribed && (
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="text-gray-600 font-medium">Expires On:</span>
            <span className="font-medium bg-blue-50 py-1 px-3 rounded-lg text-blue-700 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {subscriptionExpiry}
            </span>
          </div>
        )}
        
     
        
        {!isSubscribed && (
          <div className="mt-6">
            <button 
              onClick={handleSubscribe}
              disabled={isApproving || isSubscribing}
              className={`w-full py-3 ${isApproving || isSubscribing ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg'} text-white rounded-lg font-medium transition-all duration-300`}
            >
              {isApproving ? 'Approving Tokens...' : isSubscribing ? 'Subscribing...' : `Subscribe (${subscriptionFee} HDT)`}
            </button>
            
            {transactionHash && (
              <p className="text-xs text-center mt-2 text-gray-500">
                Transaction: {transactionHash.substring(0, 8)}...{transactionHash.substring(transactionHash.length - 8)}
              </p>
            )}
          </div>
        )}
        
        {isSubscribed && (
          <div className="mt-6">
            <button 
              onClick={handleDownload}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Premium Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;