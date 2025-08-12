import { bundlerClient, publicClient } from "./config";
import { parseEther } from "viem";

export const sendUserOperation = async (smartAccount: any) => {
  // Appropriate fee per gas must be determined for the specific bundler being used.
  const maxFeePerGas = 1000000000n; // 1 gwei
  const maxPriorityFeePerGas = 1000000000n; // 1 gwei

  console.log("Sending user operation...");
  
  const userOperationHash = await bundlerClient.sendUserOperation({
    account: smartAccount,
    calls: [
      {
        to: "0x1234567890123456789012345678901234567890",
        value: parseEther("0.001"), // Small amount for testing
        data: "0x"
      },
      {
        to: "0x9876543210987654321098765432109876543210",
        value: parseEther("0.001"), // Another dummy transaction
        data: "0x"
      },
      {
        to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        value: parseEther("0.001"), // Third dummy transaction
        data: "0x"
      }
    ],
    maxFeePerGas,
    maxPriorityFeePerGas
  });

  console.log("User operation sent, hash:", userOperationHash);
  console.log("Waiting for user operation receipt...");

  // Wait for the user operation to be included in a block
  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOperationHash,
  });

  console.log("User operation receipt received:", receipt);

  // Get the transaction hash from the receipt
  const transactionHash = receipt.receipt.transactionHash;
  
  // Get the full transaction receipt
  const transactionReceipt = await publicClient.getTransactionReceipt({
    hash: transactionHash,
  });

  console.log("Transaction receipt:", transactionReceipt);

  return {
    userOperationHash,
    transactionHash,
    userOperationReceipt: receipt,
    transactionReceipt,
    gasUsed: receipt.receipt.gasUsed,
    blockNumber: receipt.receipt.blockNumber,
    blockHash: receipt.receipt.blockHash,
    success: receipt.success,
  };
};
