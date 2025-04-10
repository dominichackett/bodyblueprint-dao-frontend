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
  const [isDownloading,setIsDownLoading] = useState(false)
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

  const handleDownload = async () => {
    try {

      setIsDownLoading(true)
      // Create message object
      const messageObj = { message: "Body Blue Print DAO", date: new Date().toString() };
      const messageString = JSON.stringify(messageObj);
      
      // Sign the message
      const signature = await signer?.signMessage(messageString);
      
      // Verify the signature (optional, for debugging)
      const recoveredAddress = ethers.utils.verifyMessage(messageString, signature);
      console.log("Recovered Address: ", recoveredAddress);
      console.log("Signature: ", signature);
      
      // Get API URL from environment variable
      const apiUrl = process.env.NEXT_PUBLIC_AKAVE_GATEWAY || '';
      const url = `${apiUrl}/api/getzippeddata`;
      
      console.log("Posting to URL:", url);
      
      // Use fetch with POST method and body data
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageString,
          signature: signature
        })
      });
      
      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const downloadUrl = URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.href = downloadUrl;
      element.download = "bodyblueprintdao-files.zip";
      document.body.appendChild(element);
      element.click();
      
      // Clean up
      document.body.removeChild(element);
      URL.revokeObjectURL(downloadUrl);
      
      console.log("Download initiated successfully");
    } catch (error) {
      console.error("Download failed:", error);
      alert(`Download failed: ${error.message}`);
    }finally{
      setIsDownLoading(false)
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Body Blue Print Subscription</h2>
        <p className="text-gray-600">Connect your wallet to view subscription details.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
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
              disabled={isDownloading}
              className={`w-full py-3 ${isDownloading ? 'bg-gray-400': 'bg-gradient-to-r from-green-600 to-emerald-500 hover:shadow-lg'} text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center`}
            >
              <Download className="h-5 w-5 mr-2" />
             {isDownloading ?"Downloading Files": "Download Premium Content"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;