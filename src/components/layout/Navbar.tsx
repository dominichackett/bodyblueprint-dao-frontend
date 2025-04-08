import React from 'react';
import Link from 'next/link';
import { useWeb3Auth } from '../../contexts/Web3AuthContext';

const Navbar: React.FC = () => {
  const { isConnected, address, login, logout, isMember, tokenBalance } = useWeb3Auth();

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
               <Link href="/" className="text-gray-700 hover:text-mycolor-600">
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
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
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
                <div className="text-sm text-gray-600 hidden md:block">
                  {address && (
                    <span>
                      {address.substring(0, 6)}...{address.substring(address.length - 4)}
                    </span>
                  )}
                </div>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
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
