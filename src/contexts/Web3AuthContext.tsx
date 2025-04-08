import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { ethers } from 'ethers';
import { HealthDAOGovernance, DAOToken } from '../contracts/HealthDAOGovernance';

// Define the context type
interface Web3AuthContextType {
  web3auth: Web3Auth | null;
  provider: IProvider | null;
  ethersProvider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  healthDAO: HealthDAOGovernance | null;
  daoToken: DAOToken | null;
  isMember: boolean;
  tokenBalance: ethers.BigNumber | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with default values
const Web3AuthContext = createContext<Web3AuthContextType>({
  web3auth: null,
  provider: null,
  ethersProvider: null,
  signer: null,
  address: null,
  isConnected: false,
  isLoading: true,
  healthDAO: null,
  daoToken: null,
  isMember: false,
  tokenBalance: null,
  login: async () => {},
  logout: async () => {},
});

// Contract addresses - these would be set based on the deployed contracts
const HEALTH_DAO_CONTRACT_ADDRESS =process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS; // Replace with actual address
console.log(HEALTH_DAO_CONTRACT_ADDRESS)
// Web3Auth configuration
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID; // Replace with your Web3Auth client ID
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID, // Ethereum mainnet (use appropriate chain ID for your deployment)
  rpcTarget: process.env.NEXT_PUBLIC_RPC_URL, // RPC endpoint
  displayName: "Akave Testnet",
  blockExplorerUrl: "http://explorer.akave.ai/",
  ticker: "AKVT",
  tickerName: "AKAVE",
  decimals: 18,
  logo: "http://explorer.akave.ai/assets/configs/network_icon.svg",
};

// Provider component
export const Web3AuthProvider = ({ children }: { children: ReactNode }) => {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [ethersProvider, setEthersProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [healthDAO, setHealthDAO] = useState<HealthDAOGovernance | null>(null);
  const [daoToken, setDaoToken] = useState<DAOToken | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<ethers.BigNumber | null>(null);

  // Initialize Web3Auth
  useEffect(() => {
    const init = async () => {
      try {
        // Create Web3Auth instance
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3authInstance = new Web3Auth({
          clientId:clientId,
          web3AuthNetwork:  WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, 
          chainConfig,
          privateKeyProvider,
        });

        setWeb3auth(web3authInstance);

        // Initialize Web3Auth
        await web3authInstance.initModal();

        // Check if user is already logged in
        if (web3authInstance.connected) {
          const web3authProvider = web3authInstance.provider;
          setProvider(web3authProvider);
          
          // Set up ethers provider and signer
          if (web3authProvider) {
            const ethProvider = new ethers.providers.Web3Provider(web3authProvider as ethers.providers.ExternalProvider);
            setEthersProvider(ethProvider);
            
            const ethSigner = ethProvider.getSigner();
            setSigner(ethSigner);
            
            const userAddress = await ethSigner.getAddress();
            setAddress(userAddress);
            setIsConnected(true);
            
            // Initialize contract instances
            const healthDAOInstance = new HealthDAOGovernance(HEALTH_DAO_CONTRACT_ADDRESS, ethSigner);
            setHealthDAO(healthDAOInstance);
            
            // Get DAO token address and create token instance
            const daoTokenAddress = await healthDAOInstance.getDaoToken();
            const daoTokenInstance = new DAOToken(daoTokenAddress, ethSigner);
            setDaoToken(daoTokenInstance);
            
            // Check if user is a member
            const memberStatus = await healthDAOInstance.isMember(userAddress);
            setIsMember(memberStatus);
            
            // Get token balance
            const balance = await daoTokenInstance.balanceOf(userAddress);
            setTokenBalance(balance);
          }
        }
      } catch (error) {
        console.error('Error initializing Web3Auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Login function
  const login = async () => {
    if (!web3auth) {
      console.error('Web3Auth not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      const web3authProvider = await web3auth.connect();
       console.log("web3authProvider")
      setProvider(web3authProvider);
      
      if (web3authProvider) {
        console.log("Provider")
        const ethProvider = new ethers.providers.Web3Provider(web3authProvider as ethers.providers.ExternalProvider);
        setEthersProvider(ethProvider);
        
        const ethSigner = ethProvider.getSigner();
        setSigner(ethSigner);
        
        const userAddress = await ethSigner.getAddress();
        setAddress(userAddress);
        setIsConnected(true);
        
        // Initialize contract instances
        const healthDAOInstance = new HealthDAOGovernance(HEALTH_DAO_CONTRACT_ADDRESS, ethSigner);
        setHealthDAO(healthDAOInstance);
        
        // Get DAO token address and create token instance
        const daoTokenAddress = await healthDAOInstance.getDaoToken();
        const daoTokenInstance = new DAOToken(daoTokenAddress, ethSigner);
        setDaoToken(daoTokenInstance);
        
        // Check if user is a member
        const memberStatus = await healthDAOInstance.isMember(userAddress);
        setIsMember(memberStatus);
        
        // Get token balance
        const balance = await daoTokenInstance.balanceOf(userAddress);
        setTokenBalance(balance);
      }
    } catch (error) {
      console.error('Error logging in with Web3Auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    if (!web3auth) {
      console.error('Web3Auth not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      await web3auth.logout();
      setProvider(null);
      setEthersProvider(null);
      setSigner(null);
      setAddress(null);
      setIsConnected(false);
      setHealthDAO(null);
      setDaoToken(null);
      setIsMember(false);
      setTokenBalance(null);
    } catch (error) {
      console.error('Error logging out from Web3Auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    web3auth,
    provider,
    ethersProvider,
    signer,
    address,
    isConnected,
    isLoading,
    healthDAO,
    daoToken,
    isMember,
    tokenBalance,
    login,
    logout,
  };

  return (
    <Web3AuthContext.Provider value={value}>
      {children}
    </Web3AuthContext.Provider>
  );
};

// Custom hook to use the Web3Auth context
export const useWeb3Auth = () => useContext(Web3AuthContext);
