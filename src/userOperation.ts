import { bundlerClient, publicClient } from "./config";
import { parseEther, zeroAddress } from "viem";

export const sendUserOperation = async (smartAccount: any) => {
  // Appropriate fee per gas must be determined for the specific bundler being used.
  const maxFeePerGas = 1000000000n; // 1 gwei
  const maxPriorityFeePerGas = 1000000000n; // 1 gwei

  console.log("Encoding calls with chain IDs...");
  
  const callData = await smartAccount.encodeCalls([
    {
      chain: "11155111",
      to: "0x1234567890123456789012345678901234567890", // Sepolia destination
      value: parseEther("0.00001"),
      data: "0x"
    },
    {
      chain: "11155111",
      to: "0x5678901234567890123456789012345678901234",
      value: parseEther("0.00002"),
      data: "0x"
    },
    {
      to: zeroAddress, 
      value: BigInt(0),
      data: "0x"
    }
  ]);

  console.log("Encoded call data:", callData);
  console.log("Sending user operation with encoded data...");
  
  const userOperationHash = await bundlerClient.sendUserOperation({
    account: smartAccount,
    calls: [
      {
        to: smartAccount.address,
        data: callData,
        value: BigInt(0)
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
