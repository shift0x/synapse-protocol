import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { useWriteContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { withdrawApiCredits } from '../../lib/chain/withdrawApiCredits.ts';
import { useUserState } from '../../providers/UserStateProvider';
import { useToast } from '../../providers/ToastProvider';
import { formatCurrency, parseCurrency } from '../../lib/utils/currency';
import './WithdrawModal.css';
import { getEtherscanLink } from '../../lib/chain/chain.js';

const WithdrawModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState('');
  const [withdrawMessageType, setWithdrawMessageType] = useState(''); // 'success' or 'error'
  
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { synapseApiUser, isLoadingSynapseApiUser, updateSynapseApiUser } = useUserState();
  const { showSuccess, showError } = useToast();
  
  // Get API Credit balance from synapseApiUser
  const apiCreditBalance = synapseApiUser?.balance || 0;
  
  // Check if amount exceeds balance
  const numericAmount = parseFloat(parseCurrency(amount));
  const exceedsBalance = numericAmount > apiCreditBalance;

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setWithdrawMessage('');
      setWithdrawMessageType('');
    }
  }, [isOpen]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || numericAmount <= 0 || exceedsBalance) return;
    
    if (!address) {
      setWithdrawMessage('Please connect your wallet first');
      setWithdrawMessageType('error');
      return;
    }
    
    setIsLoading(true);
    setWithdrawMessage('');
    setWithdrawMessageType('');
    
    try {
      const result = await withdrawApiCredits(
        writeContractAsync,
        numericAmount
      );

      if (result.success) {
        // Update API user balance on success
        await updateSynapseApiUser();
        
        // Show success toast with transaction link
        showSuccess(
          <>
            Successfully withdrew {formatCurrency(numericAmount.toString())} API credits! <br />
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
        
        console.log('Withdraw transaction hash:', result.txHash);
      } else {
        setWithdrawMessage(result.error || 'Failed to withdraw API credits');
        setWithdrawMessageType('error');
      }
    } catch (error) {
      console.error('Withdraw failed:', error);
      setWithdrawMessage('An unexpected error occurred during withdrawal');
      setWithdrawMessageType('error');
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
    setAmount(formatCurrency(apiCreditBalance.toString()));
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
        form="withdraw-form"
        disabled={isLoading || !amount || numericAmount <= 0 || exceedsBalance}
      >
        {isLoading ? 'Processing...' : 'Withdraw'}
      </button>
    </>
  );

  return (
    <div class="withdraw-modal">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Withdraw API Credits"
        actions={actions}
        maxWidth="480px"
      >
        <div className="withdraw-modal-content">
          <p className="withdraw-description">
            Withdraw API credits from your account. Your available balance will be converted back to USDC.
          </p>

          {/* API Credit Balance Display */}
          <div className="balance-display">
            <div className="balance-label">Available API Credits</div>
            <div className="balance-amount">
              {isLoadingSynapseApiUser ? 'Loading...' : formatCurrency(apiCreditBalance.toString())}
            </div>
          </div>

          <form id="withdraw-form" onSubmit={handleWithdraw} className="withdraw-form">
            <div className="form-group mb-0">
              <label htmlFor="withdraw-amount" className="form-label">
                Withdrawal Amount (API Credits)
              </label>
              <div className="amount-input-container">
                <input
                  id="withdraw-amount"
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
                  <span className="error-text">Amount exceeds your API credit balance</span> : 
                  'Enter the amount of API credits you want to withdraw'
                }
              </div>
            </div>
          </form>

          {/* Withdraw Status Message */}
          {withdrawMessage && (
            <div className={`status-message ${withdrawMessageType}`}>
              {withdrawMessage}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default WithdrawModal;
