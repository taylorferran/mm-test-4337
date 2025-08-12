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
  const [userOpHash, setUserOpHash] = useState<string>('');
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
      setUserOpHash('');

      if (!smartAccount) {
        throw new Error('Smart account not initialized');
      }

      const hash = await sendUserOperation(smartAccount);
      setUserOpHash(hash);
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
            {isLoading ? 'Sending...' : 'Send User Operation (3 Dummy Transactions)'}
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

      {userOpHash && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          <strong>User Operation Hash:</strong>
          <code style={{ 
            backgroundColor: '#c3e6cb', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontSize: '12px',
            wordBreak: 'break-all',
            display: 'block',
            marginTop: '8px'
          }}>
            {userOpHash}
          </code>
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
          <li>Click "Send User Operation" to send a bundled transaction with 3 dummy transfers</li>
        </ol>
        <p><strong>Note:</strong> Make sure you're connected to the Sepolia testnet and have some test ETH in your SCW for gas fees.</p>
      </div>
    </div>
  );
};

export default App;
