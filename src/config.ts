import { createPublicClient, http, createWalletClient, custom } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { sepolia as chain } from "viem/chains";
import { 
  Implementation, 
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";

const publicClient = createPublicClient({
  chain,
  transport: http()
});

export const getSmartAccount = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  // Request account access
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  
  // Create a wallet client using MetaMask
  const walletClient = createWalletClient({
    chain,
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

export const bundlerClient = createBundlerClient({
  client: publicClient,
  transport: http("https://rpc.zerodev.app/api/v3/e3896e1e-8cf7-4dd8-8fb7-1a95d19111ef/chain/11155111") // Sepolia testnet
});

export { publicClient };
