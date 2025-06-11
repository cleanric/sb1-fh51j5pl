import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';
import { BrowserProvider, Contract } from 'ethers';
import { getContract } from '@/lib/contracts';
import LocationService from '@/lib/services/location';
import { setRegion } from '@/lib/insights';

// Define Web3Modal state interface
interface Web3ModalState {
  selectedNetworkId: number | undefined;
  open: boolean;
  address?: string;
}

// Configure Web3Modal
const projectId = '7535fb278e68baeb775891c72efa61cb';

const metadata = {
  name: 'Earn Hire',
  description: 'Earn crypto rewards while job hunting',
  url: 'https://earnhire.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Define chains configuration
const mainnet = {
  chainId: 137,
  name: 'Polygon',
  currency: 'MATIC',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: 'https://polygon-rpc.com'
};

// Create Web3Modal instance
const web3modal = createWeb3Modal({
  ethersConfig: defaultConfig({ 
    metadata,
    defaultChainId: 137,
    enableCoinbase: true,
    rpcUrl: mainnet.rpcUrl
  }),
  chains: [mainnet],
  projectId,
  defaultChain: mainnet,
  metadata,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#00BFFF'
  },
  tokens: {
    137: {
      address: '0x0000000000000000000000000000000000001010',
      image: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png'
    }
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'  // Coinbase
  ]
});

interface Web3ContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  contract: Contract | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const initializeContract = async () => {
      try {
        const ethersProvider = await web3modal.getEthersProvider();
        if (!ethersProvider) return;
        
        const signer = await ethersProvider.getSigner();
        const contract = await getContract(ethersProvider, signer);
        setContract(contract);
      } catch (error) {
        console.error('Error initializing contract:', error);
        setContract(null);
      }
    };

    const unsubscribe = web3modal.subscribeState(async (newState: Web3ModalState) => {
      setIsConnected(!!newState.selectedNetworkId);
      
      if (newState.address) {
        setAddress(newState.address);
        await initializeContract();
      } else {
        setAddress(null);
        setContract(null);
      }
    });

    // Check initial state
    const currentState = web3modal.getState();
    setIsConnected(!!currentState.selectedNetworkId);
    setAddress((currentState as Web3ModalState).address || null);
    
    if ((currentState as Web3ModalState).address) {
      initializeContract();
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const connect = async () => {
    try {
      // Check location before connecting wallet
      const location = await LocationService.getLocation();
      setRegion(location.countryCode || 'UNKNOWN');
      
      await web3modal.open();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = async () => {
    try {
      await web3modal.disconnect();
      // Clean up state
      setIsConnected(false);
      setAddress(null);
      setContract(null);
      // Clear any stored wallet data
      localStorage.removeItem('wc@2:core:0.3//keychain');
      localStorage.removeItem('wc@2:client:0.3//session');
      localStorage.removeItem('wc@2:ethereum_provider://session');
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.wallet');
      localStorage.removeItem('wagmi.network');
      localStorage.removeItem('walletconnect');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <Web3Context.Provider value={{
      isConnected,
      address,
      connect,
      disconnect,
      contract
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}