import React, { useState, useEffect } from 'react';
import { getKnowledgeTokenPools } from '../lib/chain/getKnowledgeTokenPools.ts';
import './Swap.css';
import { formatCurrency } from '../lib/utils/currency.js';
import { useUserState } from '../providers/UserStateProvider.js';
import { USDC } from '../lib/chain/contracts.js';
import { getAmountOut } from '../lib/chain/getAmountOut.ts';
import { useWriteContract, useAccount } from 'wagmi';
import { useToast } from '../providers/ToastProvider.js';
import { swap } from '../lib/chain/swap.ts';
import { getEtherscanLink } from '../lib/chain/chain.ts';

const Swap = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSwapping, setIsSwapping] = useState('Buy');
  const [payAmount, setPayAmount] = useState(null);
  const [receiveAmount, setReceiveAmount] = useState(null);

  const handlePayAmountChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid numbers (including decimals)
    if (value === '' || !isNaN(parseFloat(value))) {
      setPayAmount(value);
    }
  };
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  
  const { getTokenBalance, updateTokenBalances } = useUserState();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const poolData = await getKnowledgeTokenPools();
        
        // Transform pool data for table display
        const transformedTokens = poolData.map(pool => {
          const quoteDecimals = pool.quote > .1 ? 2 : 6;
          const model = {
            ...pool
          }

          
          model.name = pool.name || `Knowledge Pool #${pool.id}`
          model.quote = parseFloat(pool.quote).toFixed(quoteDecimals)
          model.marketcap = parseFloat(pool.marketcap).toFixed(2)
          model.earnings = parseFloat(pool.earnings).toFixed(2)
          model.totalSwapFeesUsd = parseFloat(pool.totalSwapFeesUsd).toFixed(2)
          model.shortName = pool.name.length > 10 ? `${pool.name.substring(0,10)}...` : pool.name
          model.longName = pool.name.length > 30 ? `${pool.name.substring(0,30)}...` : pool.name

          return model;
            
        });
        
        setTokens(transformedTokens);
      } catch (err) {
        console.error('Error fetching knowledge token pools:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  useEffect(() => {
    if(!payAmount || !selectedToken || payAmount == 0 || isNaN(payAmount)){ 
      setReceiveAmount(null);
      return;
    }

    const tokenIn = isSwapping ? USDC.address : selectedToken.pool;
    const tokenOut = isSwapping ? selectedToken.pool : USDC.address;
    const amountIn = payAmount;

    const fetchAmountOut = async() => {
      if(!payAmount || !selectedToken){ return ; }

      const amountOut = await getAmountOut(selectedToken.pool, tokenIn, tokenOut, amountIn)
      const amountOutFixed = amountOut > 1 ? amountOut.toFixed(2) : amountOut.toFixed(6);

      setReceiveAmount(amountOutFixed);
    }

    fetchAmountOut();
  }, [payAmount, selectedToken])

  // Filter tokens based on search query
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.id.toString().includes(searchQuery)
  );

  // Handle token selection for trading
  const handleSelectToken = (token) => {
    setSelectedToken(token);
    setPayAmount(null);
    setReceiveAmount(null);
  };

  // Handle swap execution
  const handleSwap = async () => {
    if (!selectedToken || !payAmount || !address || !writeContractAsync) {
      showError('Please select a token and enter an amount');
      return;
    }

    if (parseFloat(payAmount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    setIsSwapLoading(true);

    try {
      const tokenIn = isSwapping === 'Buy' ? USDC.address : selectedToken.pool;
      const result = await swap(
        address,
        writeContractAsync,
        selectedToken.pool,
        tokenIn,
        parseFloat(payAmount)
      );

      if (result.success) {
        showSuccess(
          <div>
            Swap completed successfully! <br />
            <a 
              href={getEtherscanLink(result.txHash)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View Transaction
            </a>
          </div>,
          10000
        );
        
        // Reset form
        setPayAmount(null);
        setReceiveAmount(null);
        
        // Update balances
        await updateTokenBalances();
      } else {
        showError(`Swap failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Swap error:', error);
      showError(`Swap failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsSwapLoading(false);
    }
  };

  return (
    <div className="swap-page">
      <div className="page-header">
        <div className="page-content">
          <div className="section-header-left">
            <h2 className="section-header">Swap Knowledge Tokens</h2>
          </div>
          <p className="page-subtitle mt-2">
             Discover and trade tokens representing contributor earnings.<br />
            Low fees | Instant settlement on Sei.
          </p>
        </div>
      </div>

      <div className="swap-content">
        <div className="swap-left-panel">
          <div className="search-section">
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="21 21l-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search contributors, tokens, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="pools-table-container">
            {loading && <div className="loading-message">Loading knowledge token pools...</div>}
            {error && <div className="error-message">Error: {error}</div>}
            {!loading && !error && (
              <table className="pools-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Quote Price</th>
                    <th>Market Cap</th>
                    <th>Earnings</th>
                    <th>Total Fees</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {filteredTokens.map(token => (
                    <tr key={token.id} className="pool-row">
                      <td className="pool-name">
                        <div className="name-container">
                          <span>{token.name}</span>
                        </div>
                      </td>
                      <td className="quote-price">
                        <span className="price-value">{token.quote < 100 ? `$${token.quote}` : formatCurrency(token.quote.toString())}</span>
                        <span className="price-unit">USDC</span>
                      </td>
                      <td className="market-cap">
                        <span className="cap-value">{ token.marketcap < 100 ? `$${token.marketcap}` : formatCurrency(token.marketcap.toString())}</span>
                      </td>
                      <td className="earnings">
                        <span className="earnings-value">{token.earnings < 100 ? `$${token.earnings}` : formatCurrency(token.earnings.toString())}</span>
                      </td>
                      <td className="total-fees">
                        <span className="total-fees-value">{token.totalSwapFeesUsd < 100 ? `$${token.totalSwapFeesUsd}` : formatCurrency(token.totalSwapFeesUsd.toString())}</span>
                      </td>
                      <td className="actions">
                      <button 
                          className="trade-btn-small"
                           onClick={() => handleSelectToken(token)}
                         >
                           Trade
                         </button>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="swap-right-panel">
          <div className="swap-widget">
            <div className="swap-widget-header">
              <h3 className="widget-title">Swap {selectedToken ? selectedToken.longName : ""}</h3>
            </div>

            <div className="swap-toggle">
              <button 
                className={`toggle-btn ${isSwapping === 'Buy' ? 'active' : ''}`}
                onClick={() => setIsSwapping('Buy')}
              >
                Buy
              </button>
              <button 
                className={`toggle-btn ${isSwapping === 'Sell' ? 'active' : ''}`}
                onClick={() => setIsSwapping('Sell')}
              >
                Sell
              </button>
            </div>

            <div className="swap-inputs">
              <div className="input-section">
                <div className="input-header">
                  <span className="input-label">Send</span>
                  <span className="input-balance">
                    Balance {isSwapping === 'Buy' ? getTokenBalance(USDC.address.toString()) : (selectedToken ? getTokenBalance(selectedToken.pool) : '0')}
                  </span>
                </div>
                <div className="input-container">
                  <input
                    type="text"
                    className="amount-input"
                    value={payAmount}
                    onChange={handlePayAmountChange}
                    placeholder="0.00"
                  />
                  <div className="currency-selector">
                    {isSwapping === 'Buy' ? 'USDC' : (selectedToken ? selectedToken.shortName : 'Select Token')}
                  </div>
                </div>
              </div>

              <div className="swap-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19,12 12,19 5,12"></polyline>
                </svg>
              </div>

              <div className="input-section">
              <div className="input-header">
              <span className="input-label">Receive</span>
              <span className="input-balance">
              Balance {isSwapping === 'Buy' ? (selectedToken ? getTokenBalance(selectedToken.pool) : '0') : getTokenBalance(USDC.address).toString()}
              </span>
              </div>
              <div className="input-container">
                <span className="receive-amount">≈ {receiveAmount}</span>
                  <div className="currency-selector">
                     {isSwapping === 'Buy' ? (selectedToken ? selectedToken.shortName : 'Select Token') : 'USDC'}
                   </div>
                 </div>
               </div>
            </div>

            <div className="trade-details">
            <div className="detail-row">
            <span>Price </span>
            <span>{selectedToken ? `${selectedToken.quote} USDC` : '0 USDC'}</span>
            </div>
              <div className="detail-row">
                <span>Fees</span>
                <span>0.1%</span>
              </div>
            </div>

            <button 
              className="swap-execute-btn"
              onClick={handleSwap}
              disabled={!selectedToken || !payAmount || isSwapLoading}
            >
              {isSwapLoading ? 'Swapping...' : 'Swap'}
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;
