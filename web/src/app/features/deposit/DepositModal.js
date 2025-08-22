import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { useWriteContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { mintTestUSDC } from '../../lib/chain/mintTestnetUsdc.ts';
import { depositApiCredits } from '../../lib/chain/depositApiCredits.ts';
import { useUserState } from '../../providers/UserStateProvider';
import { useToast } from '../../providers/ToastProvider';
import { USDC } from '../../lib/chain/contracts.js';
import { formatCurrency, parseCurrency } from '../../lib/utils/currency';
import './DepositModal.css'
import { getEtherscanLink } from '../../lib/chain/chain.ts';

const DepositModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'
  const [depositMessage, setDepositMessage] = useState('');
  const [depositMessageType, setDepositMessageType] = useState(''); // 'success' or 'error'
  
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { tokenBalances, isLoadingBalances, updateTokenBalances, updateSynapseApiUser } = useUserState();
  const { showSuccess, showError } = useToast();
  
  // Get USDC balance from tokenBalances
  const usdcBalance = tokenBalances[USDC.address] || 0;
  
  // Check if amount exceeds balance
  const numericAmount = parseFloat(parseCurrency(amount));
  const exceedsBalance = numericAmount > usdcBalance;

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setStatusMessage('');
      setStatusType('');
      setDepositMessage('');
      setDepositMessageType('');
    }
  }, [isOpen]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || numericAmount <= 0 || exceedsBalance) return;
    
    if (!address) {
      setDepositMessage('Please connect your wallet first');
      setDepositMessageType('error');
      return;
    }
    
    setIsLoading(true);
    setDepositMessage('');
    setDepositMessageType('');
    
    try {
      const result = await depositApiCredits(
        address,
        writeContractAsync,
        numericAmount
      );

      if (result.success) {
        // Update token balances and API user on success
        await updateTokenBalances();
        await updateSynapseApiUser();
        
        // Show success toast with transaction link
        showSuccess(
          <>
            Successfully deposited {formatCurrency(numericAmount.toString())} API credits!  <br />
            <a 
              href={getEtherscanLink(result.txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View transaction
            </a>
          </>
        );
        
        // Close the modal
        onClose();
        
        console.log('Deposit transaction hash:', result.txHash);
      } else {
        setDepositMessage(result.error || 'Failed to deposit API credits');
        setDepositMessageType('error');
      }
    } catch (error) {
      console.error('Deposit failed:', error);
      setDepositMessage('An unexpected error occurred during deposit');
      setDepositMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintTestUSDC = async () => {
    if (!address) {
      setStatusMessage('Please connect your wallet first');
      setStatusType('error');
      return;
    }

    setIsLoading(true);
    setStatusMessage('');
    setStatusType('');
    
    try {
      const mintAmount = 1000; // Default mint amount of 1000 USDC
      
      const result = await mintTestUSDC(
        writeContractAsync,
        mintAmount,
        address
      );

      if (result.success) {
        // Update token balances to show the new USDC balance
        await updateTokenBalances();
        
        // Show success toast
        showSuccess(
          <>
            Successfully minted {mintAmount} test USDC! 
            <a 
              href={getEtherscanLink(result.txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View transaction
            </a>
          </>
        );
        
        console.log('Mint transaction hash:', result.txHash);
      } else {
        setStatusMessage(result.error || 'Failed to mint test USDC');
        setStatusType('error');
      }
    } catch (error) {
      console.error('Minting failed:', error);
      setStatusMessage('An unexpected error occurred while minting');
      setStatusType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Parse the input to get clean numeric value
    const cleanValue = parseCurrency(value);
    // Only allow positive numbers with up to 2 decimal places
    if (cleanValue === '' || /^\d*\.?\d{0,2}$/.test(cleanValue)) {
      // Format the value as currency for display
      setAmount(cleanValue ? formatCurrency(cleanValue) : '');
    }
  };

  const handleMaxClick = () => {
    // Set the full balance formatted as currency
    setAmount(formatCurrency(usdcBalance.toString()));
  };

  const actions = (
    <>
        <button 
        type="button" 
        className="btn-secondary"
        onClick={onClose}
        disabled={isLoading}
      >
        Cancel
      </button>
      <button 
        type="submit" 
        className="btn-primary"
        form="deposit-form"
        disabled={isLoading || !amount || numericAmount <= 0 || exceedsBalance}
      >
        {isLoading ? 'Processing...' : 'Deposit'}
      </button>
    </>
  );

  return (
    <div className="deposit-modal">
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deposit API Credits"
      actions={actions}
      maxWidth="480px"
    >
      <div className="deposit-modal-content">
        <p className="deposit-description">
          Deposit USDC to add API credits to your account. Credits are used when your agents make calls to the MCP server.
        </p>

        {/* USDC Balance Display */}
        <div className="balance-display">
          <div className="balance-label">Your USDC Balance</div>
          <div className="balance-amount">
            {isLoadingBalances ? 'Loading...' : formatCurrency(usdcBalance.toString())}
          </div>
          <button 
            type="button" 
            className="mint-usdc-btn"
            onClick={handleMintTestUSDC}
            disabled={isLoading}
          >
            {isLoading ? 'Minting...' : 'Mint Test USDC'}
          </button>
          
          {/* Status Message */}
          {statusMessage && (
            <div className={`status-message ${statusType}`}>
              {statusMessage}
            </div>
          )}
        </div>

        <form id="deposit-form" onSubmit={handleDeposit} className="deposit-form">
          <div className="form-group mb-0">
            <label htmlFor="deposit-amount" className="form-label">
              Deposit Amount (USDC)
            </label>
            <div className="amount-input-container">
              <input
                id="deposit-amount"
                type="text"
                className={`form-input amount-input ${exceedsBalance ? 'error' : ''}`}
                value={amount}
                onChange={handleAmountChange}
                placeholder="$0.00"
                disabled={isLoading}
              />
              <button
                type="button"
                className="max-btn"
                onClick={handleMaxClick}
                disabled={isLoading}
              >
                MAX
              </button>
            </div>
            <div className="form-help">
              {exceedsBalance ? 
                <span className="error-text">Amount exceeds your USDC balance</span> : 
                'Enter the amount of USDC you want to deposit for API credits'
              }
            </div>
          </div>
        </form>

        {/* Deposit Status Message */}
      {depositMessage && (
            <div className={`status-message ${depositMessageType}`}>
              {depositMessage}
            </div>
          )}
      </div>
    </Modal>
    </div>
  );
};

export default DepositModal;