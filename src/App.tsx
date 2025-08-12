import React, { useState } from 'react';
import { getSmartAccount } from './config';
import { sendUserOperation } from './userOperation';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const account = await getSmartAccount();
      setSmartAccount(account);
      setSmartAccountAddress(account.address);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTransaction = async () => {
    try {
      setIsLoading(true);
      setError('');
      setTransactionResult(null);

      if (!smartAccount) {
        throw new Error('Smart account not initialized');
      }

      const result = await sendUserOperation(smartAccount);
      setTransactionResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to send user operation');
      console.error('Error sending transaction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        MetaMask Smart Account Demo
      </h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Connection Status</h2>
        <p><strong>Status:</strong> {isConnected ? 'Connected' : 'Not Connected'}</p>
        {smartAccountAddress && (
          <p><strong>Smart Account Address:</strong> 
            <code style={{ 
              backgroundColor: '#e8e8e8', 
              padding: '2px 6px', 
              borderRadius: '4px',
              fontSize: '12px',
              wordBreak: 'break-all'
            }}>
              {smartAccountAddress}
            </code>
          </p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        {!isConnected ? (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            style={{
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Connecting...' : 'Connect MetaMask Wallet'}
          </button>
        ) : (
          <button
            onClick={sendTransaction}
            disabled={isLoading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
{isLoading ? 'Sending Cross-Chain User Operations...' : 'Send Automatic Cross-Chain User Operations (Sepolia → Base Sepolia)'}
          </button>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {transactionResult && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>
            {transactionResult.crossChain ? '🌐 Cross-Chain' : ''} Transaction Results: {transactionResult.totalOperations} User Operations
            {transactionResult.crossChain && <span style={{ fontSize: '14px', fontWeight: 'normal' }}> (Sepolia + Base Sepolia)</span>}
          </h3>
          
          {/* First User Operation */}
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            border: '1px solid #b8d4b8'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>🚀 User Operation #1 - {transactionResult.userOperation1?.chain || 'Sepolia'}</h4>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Status:</strong> {transactionResult.userOperation1.success ? '✅ Success' : '❌ Failed'}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>User Op Hash:</strong>
              <code style={{ 
                backgroundColor: '#c3e6cb', 
                padding: '2px 4px', 
                borderRadius: '3px',
                fontSize: '10px',
                wordBreak: 'break-all',
                display: 'block',
                marginTop: '4px'
              }}>
                {transactionResult.userOperation1.userOperationHash}
              </code>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <strong>Transaction Hash:</strong>
              <code style={{ 
                backgroundColor: '#c3e6cb', 
                padding: '2px 4px', 
                borderRadius: '3px',
                fontSize: '10px',
                wordBreak: 'break-all',
                display: 'block',
                marginTop: '4px'
              }}>
                {transactionResult.userOperation1.transactionHash}
              </code>
            </div>

            <div style={{ display: 'flex', gap: '15px', fontSize: '14px', marginBottom: '8px' }}>
              <span><strong>Block:</strong> {transactionResult.userOperation1.blockNumber?.toString()}</span>
              <span><strong>Gas:</strong> {transactionResult.userOperation1.gasUsed?.toString()}</span>
            </div>

            <a 
              href={`${transactionResult.userOperation1?.explorer || 'https://sepolia.etherscan.io'}/tx/${transactionResult.userOperation1.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline', fontSize: '14px' }}
            >
              View on {transactionResult.userOperation1?.chain === 'Base Sepolia' ? 'Base Explorer' : 'Etherscan'} →
            </a>
          </div>

          {/* Second User Operation */}
          {transactionResult.userOperation2 ? (
            <div style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '15px',
              border: '1px solid #b8d4b8'
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>🚀 User Operation #2 - {transactionResult.userOperation2.chain}</h4>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>Status:</strong> {transactionResult.userOperation2.success ? '✅ Success' : '❌ Failed'}
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>User Op Hash:</strong>
                <code style={{ 
                  backgroundColor: '#c3e6cb', 
                  padding: '2px 4px', 
                  borderRadius: '3px',
                  fontSize: '10px',
                  wordBreak: 'break-all',
                  display: 'block',
                  marginTop: '4px'
                }}>
                  {transactionResult.userOperation2.userOperationHash}
                </code>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <strong>Transaction Hash:</strong>
                <code style={{ 
                  backgroundColor: '#c3e6cb', 
                  padding: '2px 4px', 
                  borderRadius: '3px',
                  fontSize: '10px',
                  wordBreak: 'break-all',
                  display: 'block',
                  marginTop: '4px'
                }}>
                  {transactionResult.userOperation2.transactionHash}
                </code>
              </div>

              <div style={{ display: 'flex', gap: '15px', fontSize: '14px', marginBottom: '8px' }}>
                <span><strong>Block:</strong> {transactionResult.userOperation2.blockNumber?.toString()}</span>
                <span><strong>Gas:</strong> {transactionResult.userOperation2.gasUsed?.toString()}</span>
              </div>

              <a 
                href={`${transactionResult.userOperation2.explorer}/tx/${transactionResult.userOperation2.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'underline', fontSize: '14px' }}
              >
                View on {transactionResult.userOperation2.chain === 'Base Sepolia' ? 'Base Explorer' : 'Etherscan'} →
              </a>
            </div>
          ) : null}

          <div style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404',
            padding: '10px', 
            borderRadius: '4px',
            border: '1px solid #ffeaa7',
            fontSize: '14px'
          }}>
            <strong>📊 Summary:</strong> {transactionResult.crossChain ? 
              'Automatic cross-chain user operations successfully executed! The first operation was sent on Sepolia, then MetaMask automatically switched to Base Sepolia for the second operation. This demonstrates seamless multi-chain account abstraction!' :
              'Both user operations were sent simultaneously without waiting for the first to complete. This demonstrates the parallel processing capability of account abstraction!'
            }
          </div>
        </div>
      )}

      <div style={{ 
        backgroundColor: '#e9ecef', 
        padding: '15px', 
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <h3>How it works:</h3>
        <ol>
          <li>Click "Connect MetaMask Wallet" to connect your wallet and generate a smart account</li>
          <li>The smart account address will be displayed above</li>
          <li>Click "Send Automatic Cross-Chain User Operations" to:</li>
          <ul style={{ marginTop: '8px', marginBottom: '8px' }}>
            <li>Send the first user operation on Sepolia (3 transactions of 0.001 ETH each)</li>
            <li>Automatically switch MetaMask to Base Sepolia</li>
            <li>Create a Base Sepolia smart account</li>
            <li>Send the second user operation on Base Sepolia (3 transactions of 0.002 ETH each)</li>
            <li>Switch back to Sepolia when complete</li>
          </ul>
          <li>View both transaction results with links to their respective block explorers</li>
        </ol>
        <p><strong>Note:</strong> Make sure you have test ETH on both Sepolia and Base Sepolia testnets. The app will automatically add Base Sepolia network to MetaMask if needed.</p>
      </div>
    </div>
  );
};

export default App;
