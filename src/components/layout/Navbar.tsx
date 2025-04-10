import React, { useState } from 'react';
import Link from 'next/link';
import { useWeb3Auth } from '../../contexts/Web3AuthContext';
import { Copy } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isConnected, address, login, logout, isMember, tokenBalance } = useWeb3Auth();
  const [copyStatus, setCopyStatus] = useState('');
  const [showFullAddress, setShowFullAddress] = useState(false);

  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address)
        .then(() => {
          setCopyStatus('Copied!');
          setShowFullAddress(true);
          setTimeout(() => {
            setCopyStatus('');
            setShowFullAddress(false);
          }, 3000); // Clear the status and hide full address after 3 seconds
        })
        .catch(err => {
          console.error('Failed to copy address: ', err);
          setCopyStatus('Failed to copy');
          setTimeout(() => setCopyStatus(''), 3000);
        });
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-mycolor-600">
              Body Blue Print DAO
            </Link>
            <div className="ml-10 hidden md:flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-mycolor-600">
                Dashboard
              </Link>
              
              <Link href="/proposals" className="text-gray-700 hover:text-mycolor-600">
                Proposals
              </Link>
              {isMember && (
                <Link href="/proposals/create" className="text-gray-700 hover:text-mycolor-600">
                  Create Proposal
                </Link>
              )}
               <Link href="/subscribe" className="text-gray-700 hover:text-mycolor-600">
                Data Subscription
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <div className="hidden md:block">
                  <div className="text-sm text-gray-600">
                    {isMember ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Member
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        Not a Member
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm text-gray-600">
                    {tokenBalance && (
                      <span className="font-medium">
                        {tokenBalance.toString()} HDT
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden md:block relative">
                  <div 
                    onClick={copyAddressToClipboard}
                    className="text-sm font-medium text-gray-700 flex items-center bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-lg border border-blue-100 shadow-sm cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 gap-2"
                    title="Click to copy address"
                  >
                    {address && (
                      <>
                        <span>
                          {address.substring(0, 6)}...{address.substring(address.length - 4)}
                        </span>
                        <Copy size={16} className="text-gray-500" />
                      </>
                    )}
                  </div>
                  
                  {/* Notification for copy status */}
                  {copyStatus && (
                    <div className="absolute top-1  left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                      {copyStatus}
                    </div>
                  )}
                  
                  {/* Full address display when copied */}
                  {showFullAddress && address && (
                    <div className="absolute top-12 right-0 bg-white border border-gray-200 shadow-lg rounded-md p-3 z-10 w-64">
                      <div className="text-xs text-gray-500 mb-1">Full Address:</div>
                      <div className="text-sm font-mono break-all text-gray-800 bg-gray-50 p-2 rounded">
                        {address}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={login}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center mx-auto"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;