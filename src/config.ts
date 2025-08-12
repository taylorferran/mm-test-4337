import { createPublicClient, http, createWalletClient, custom } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia, baseSepolia } from "viem/chains";
import { 
  Implementation, 
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";

// Sepolia clients
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

// Base Sepolia clients
const baseSepoliaPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

export const getSmartAccount = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  // Create a wallet client using MetaMask for Sepolia
  const walletClient = createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum)
  });

  // Get the account from the wallet client
  const [account] = await walletClient.getAddresses();

  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [account, [], [], []],
    deploySalt: "0x",
    signatory: { 
      account: {
        address: account,
        signMessage: async ({ message }: { message: string | Uint8Array }) => {
          return await walletClient.signMessage({
            account,
            message: typeof message === 'string' ? message : { raw: message }
          });
        },
        signTypedData: async (typedData: any) => {
          return await walletClient.signTypedData({
            account,
            ...typedData
          });
        }
      }
    },
  });

  return smartAccount;
};

export const getBaseSepoliaSmartAccount = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  // Create a wallet client using MetaMask for Base Sepolia
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(window.ethereum)
  });

  // Get the account from the wallet client
  const [account] = await walletClient.getAddresses();

  const smartAccount = await toMetaMaskSmartAccount({
    client: baseSepoliaPublicClient,
    implementation: Implementation.Hybrid,
    deployParams: [account, [], [], []],
    deploySalt: "0x",
    signatory: { 
      account: {
        address: account,
        signMessage: async ({ message }: { message: string | Uint8Array }) => {
          return await walletClient.signMessage({
            account,
            message: typeof message === 'string' ? message : { raw: message }
          });
        },
        signTypedData: async (typedData: any) => {
          return await walletClient.signTypedData({
            account,
            ...typedData
          });
        }
      }
    },
  });

  return smartAccount;
};

export const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http("https://rpc.zerodev.app/api/v3/e3896e1e-8cf7-4dd8-8fb7-1a95d19111ef/chain/11155111") // Sepolia testnet
});

export const baseSepoliaBundlerClient = createBundlerClient({
  client: baseSepoliaPublicClient,
  transport: http("https://rpc.zerodev.app/api/v3/e3896e1e-8cf7-4dd8-8fb7-1a95d19111ef/chain/84532") // Base Sepolia testnet
});

// Function to request chain switch
export const switchToBaseSepolia = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Try to switch to Base Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x14A34' }], // Base Sepolia chain ID (84532 in hex)
    });
  } catch (switchError: any) {
    // If the chain hasn't been added to MetaMask, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x14A34',
          chainName: 'Base Sepolia',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia-explorer.base.org'],
        }],
      });
    } else {
      throw switchError;
    }
  }
};

export const switchToSepolia = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xAA36A7' }], // Sepolia chain ID (11155111 in hex)
    });
  } catch (error) {
    console.error('Failed to switch to Sepolia:', error);
    throw error;
  }
};

export { publicClient, baseSepoliaPublicClient };
