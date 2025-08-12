import { 
  bundlerClient, 
  publicClient, 
  baseSepoliaBundlerClient, 
  baseSepoliaPublicClient, 
  getBaseSepoliaSmartAccount,
  switchToBaseSepolia,
  switchToSepolia
} from "./config";
import { parseEther } from "viem";

export const sendUserOperation = async (smartAccount: any) => {
  // Appropriate fee per gas must be determined for the specific bundler being used.
  const maxFeePerGas = 1000000000n; // 1 gwei
  const maxPriorityFeePerGas = 1000000000n; // 1 gwei

  console.log("Sending cross-chain user operations...");
  
  // Send first user operation on Sepolia
  console.log("Sending User Operation #1 on Sepolia...");
  const userOp1Promise = bundlerClient.sendUserOperation({
    account: smartAccount,
    calls: [
      {
        to: "0x1111111111111111111111111111111111111111",
        value: parseEther("0.001"),
        data: "0x"
      },
      {
        to: "0x2222222222222222222222222222222222222222",
        value: parseEther("0.001"),
        data: "0x"
      },
      {
        to: "0x3333333333333333333333333333333333333333",
        value: parseEther("0.001"),
        data: "0x"
      }
    ],
    maxFeePerGas,
    maxPriorityFeePerGas
  });

  // Get the first user operation hash
  const userOpHash1 = await userOp1Promise;
  console.log("User Operation 1 sent on Sepolia:", userOpHash1);

  // Automatically switch to Base Sepolia for the second operation
  console.log("Automatically switching to Base Sepolia...");
  await switchToBaseSepolia();
  console.log("Switched to Base Sepolia");

  // Get Base Sepolia smart account
  console.log("Creating Base Sepolia smart account...");
  const baseSmartAccount = await getBaseSepoliaSmartAccount();
  console.log("Base Sepolia smart account created:", baseSmartAccount.address);

  // Send second user operation on Base Sepolia
  console.log("Sending User Operation #2 on Base Sepolia...");
  const userOp2Promise = baseSepoliaBundlerClient.sendUserOperation({
    account: baseSmartAccount,
    calls: [
      {
        to: "0x4444444444444444444444444444444444444444",
        value: parseEther("0.002"),
        data: "0x"
      },
      {
        to: "0x5555555555555555555555555555555555555555",
        value: parseEther("0.002"),
        data: "0x"
      },
      {
        to: "0x6666666666666666666666666666666666666666",
        value: parseEther("0.002"),
        data: "0x"
      }
    ],
    maxFeePerGas,
    maxPriorityFeePerGas
  });

  // Get the second user operation hash
  const userOpHash2 = await userOp2Promise;
  console.log("User Operation 2 sent on Base Sepolia:", userOpHash2);
  
  console.log("Both cross-chain user operations sent!");
  console.log("User Operation 1 Hash (Sepolia):", userOpHash1);
  console.log("User Operation 2 Hash (Base Sepolia):", userOpHash2);
  console.log("Now waiting for both receipts...");

  // Wait for both receipts simultaneously
  const [receipt1, receipt2] = await Promise.all([
    bundlerClient.waitForUserOperationReceipt({ hash: userOpHash1 }),
    baseSepoliaBundlerClient.waitForUserOperationReceipt({ hash: userOpHash2 })
  ]);

  console.log("Both cross-chain user operation receipts received!");
  console.log("Receipt 1 (Sepolia):", receipt1);
  console.log("Receipt 2 (Base Sepolia):", receipt2);

  // Get transaction receipts for both chains
  const [txReceipt1, txReceipt2] = await Promise.all([
    publicClient.getTransactionReceipt({ hash: receipt1.receipt.transactionHash }),
    baseSepoliaPublicClient.getTransactionReceipt({ hash: receipt2.receipt.transactionHash })
  ]);

  // Switch back to Sepolia for consistency
  console.log("Switching back to Sepolia...");
  await switchToSepolia();

  return {
    userOperation1: {
      userOperationHash: userOpHash1,
      transactionHash: receipt1.receipt.transactionHash,
      userOperationReceipt: receipt1,
      transactionReceipt: txReceipt1,
      gasUsed: receipt1.receipt.gasUsed,
      blockNumber: receipt1.receipt.blockNumber,
      blockHash: receipt1.receipt.blockHash,
      success: receipt1.success,
      chain: "Sepolia",
      explorer: "https://sepolia.etherscan.io"
    },
    userOperation2: {
      userOperationHash: userOpHash2,
      transactionHash: receipt2.receipt.transactionHash,
      userOperationReceipt: receipt2,
      transactionReceipt: txReceipt2,
      gasUsed: receipt2.receipt.gasUsed,
      blockNumber: receipt2.receipt.blockNumber,
      blockHash: receipt2.receipt.blockHash,
      success: receipt2.success,
      chain: "Base Sepolia",
      explorer: "https://sepolia-explorer.base.org"
    },
    totalOperations: 2,
    crossChain: true
  };
};
