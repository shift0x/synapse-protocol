import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { useAccount, useWriteContract } from 'wagmi';
import { mintTestUSDC } from '../../lib/chain/mintTestnetUsdc.ts';
import { createContributorPool } from '../../lib/chain/createContributorPool.ts';
import { useUserState } from '../../providers/UserStateProvider';
import { useToast } from '../../providers/ToastProvider';
import { USDC } from '../../lib/chain/contracts.js';
import { formatCurrency, parseCurrency } from '../../lib/utils/currency';
import './ContributorRegistrationModal.css'
import { getEtherscanLink } from '../../lib/chain/chain.ts';

const ContributorRegistrationModal = ({ isOpen, onClose, onSuccess, knowledgeTopic }) => {
  const [amount, setAmount] = useState(''); 
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [registrationMessageType, setRegistrationMessageType] = useState(''); // 'success' or 'error'
  
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { tokenBalances, isLoadingBalances, updateTokenBalances, updateContributorPoolInfo } = useUserState();
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
      setDisplayName('');
      setStatusMessage('');
      setStatusType('');
      setRegistrationMessage('');
      setRegistrationMessageType('');
    }
  }, [isOpen]);

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!amount || numericAmount <= 0 || exceedsBalance || !displayName.trim()) return;
    
    if (!address) {
      setRegistrationMessage('Please connect your wallet first');
      setRegistrationMessageType('error');
      return;
    }
    
    setIsLoading(true);
    setRegistrationMessage('');
    setRegistrationMessageType('');
    
    try {
      // Create the contributor pool using the new function
      const result = await createContributorPool(
        address,
        writeContractAsync,
        displayName.trim(),
        numericAmount
      );

      if (result.success) {
        // Update token balances and contributor pool info after successful registration
        await updateTokenBalances();
        await updateContributorPoolInfo();
        
        // Show success message
        showSuccess(
          <>
            Successfully created contributor pool "{displayName}" with {formatCurrency(numericAmount.toString())} USDC deposit! <br />
            <a 
              href={getEtherscanLink(result.txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View transaction
            </a>
          </>
        );
        
        // Call success callback or close modal
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } else {
        setRegistrationMessage(result.error || 'Failed to create contributor pool');
        setRegistrationMessageType('error');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setRegistrationMessage('An unexpected error occurred during registration');
      setRegistrationMessageType('error');
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
            Successfully minted {mintAmount} test USDC! <br />
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
        form="registration-form"
        disabled={isLoading || !amount || numericAmount <= 0 || exceedsBalance || !displayName.trim()}
      >
        {isLoading ? 'Creating Pool...' : 'Create Pool'}
      </button>
    </>
  );

  return (
    <div className="contributor-registration-modal">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Create Contributor Account"
        actions={actions}
        maxWidth="520px"
      >
        <div className="registration-modal-content">
          <p className="registration-description">
            To contribute knowledge, you first need to create a contributor account by depositing USDC to create your token pool. Deposit more USDC to increase swapping liquidity and earn more fees.
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

          <form id="registration-form" onSubmit={handleRegistration} className="registration-form">
            <div className="form-group">
              <label htmlFor="display-name" className="form-label">
                Pool Display Name
              </label>
              <input
                id="display-name"
                type="text"
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter a name for your contributor pool"
                disabled={isLoading}
                maxLength={50}
              />
              <div className="form-help">
                Choose a name that represents your expertise or contribution focus
              </div>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="deposit-amount" className="form-label">
                Initial Pool Deposit (USDC)
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
                  'This will be your initial pool deposit. You can add more later to increase your earnings.'
                }
              </div>
            </div>
          </form>

          {/* Registration Status Message */}
          {registrationMessage && (
            <div className={`status-message ${registrationMessageType}`}>
              {registrationMessage}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ContributorRegistrationModal;
