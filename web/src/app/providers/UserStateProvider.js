import { createContext, useContext, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { getAccountTokenBalances } from '../lib/chain/getAccountTokenBalances.ts';
import { getSynapseApiUserAccount } from '../lib/chain/getSynapseApiUserAccount.ts';
import { getAccountApiKeys } from '../lib/api/getAccountApiKeys.ts';
import { getContributorPoolInfo } from '../lib/chain/getContributorPoolInfo.ts';

// Create the context
const UserStateContext = createContext();

// Custom hook to use the context
export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (!context) {
    throw new Error('useUserState must be used within a UserStateProvider');
  }
  return context;
};

// Provider component
export const UserStateProvider = ({ children }) => {
  const [tokenBalances, setTokenBalances] = useState({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [balancesError, setBalancesError] = useState(null);
  
  const [synapseApiUser, setSynapseApiUser] = useState(null);
  const [isLoadingApiUser, setIsLoadingApiUser] = useState(false);
  const [apiUserError, setApiUserError] = useState(null);
  
  const [accessKeys, setAccessKeys] = useState([]);
  const [isLoadingAccessKeys, setIsLoadingAccessKeys] = useState(false);
  const [accessKeysError, setAccessKeysError] = useState(null);
  
  const [contributorPoolInfo, setContributorPoolInfo] = useState(null);
  const [isLoadingPoolInfo, setIsLoadingPoolInfo] = useState(false);
  const [poolInfoError, setPoolInfoError] = useState(null);
  
  const { address } = useAccount();

  // Function to update balances that can be called by consumers
  const updateTokenBalances = async () => {
    if (!address) {
      setTokenBalances({});
      return;
    }

    setIsLoadingBalances(true);
    setBalancesError(null);

    try {
      const balances = await getAccountTokenBalances(address);

      setTokenBalances(balances);
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
      setBalancesError(error.message);
      setTokenBalances({});
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Function to update Synapse API user that can be called by consumers
  const updateSynapseApiUser = async () => {
    if (!address) {
      setSynapseApiUser(null);
      return;
    }

    setIsLoadingApiUser(true);
    setApiUserError(null);

    try {
      const apiUser = await getSynapseApiUserAccount(address);
      
      setSynapseApiUser(apiUser);
    } catch (error) {
      console.error('Failed to fetch Synapse API user:', error);
      setApiUserError(error.message);
      setSynapseApiUser(null);
    } finally {
      setIsLoadingApiUser(false);
    }
  };

  // Function to update access keys that can be called by consumers
  const refreshAccountApiKeys = async () => {
    if (!address) {
      setAccessKeys([]);
      setIsLoadingAccessKeys(false);
      setAccessKeysError(null);
      return;
    }

    setIsLoadingAccessKeys(true);
    setAccessKeysError(null);

    try {
      const keys = await getAccountApiKeys(address);
      
      setAccessKeys(keys);
    } catch (error) {
      console.error('Failed to fetch access keys:', error);
      setAccessKeysError(error.message);
      setAccessKeys([]);
    } finally {
      setIsLoadingAccessKeys(false);
    }
  };

  // Function to update contributor pool info that can be called by consumers
  const updateContributorPoolInfo = async () => {
    console.log(`updateContributorPoolInfo`)
    if (!address) {
      setContributorPoolInfo(null);
      return;
    }

    setIsLoadingPoolInfo(true);
    setPoolInfoError(null);

    try {
      const poolInfo = await getContributorPoolInfo(address);
      
      setContributorPoolInfo(poolInfo);
    } catch (error) {
      console.error('Failed to fetch contributor pool info:', error);
      setPoolInfoError(error.message);
      setContributorPoolInfo(null);
    } finally {
      setIsLoadingPoolInfo(false);
    }
  };

  // Function to get token balance by address
  const getTokenBalance = (tokenAddress) => {
    if (!tokenAddress || !tokenBalances) return '0';
    return tokenBalances[tokenAddress] || '0';
  };

  // Load balances, API user, access keys, and pool info when address changes
  useMemo(() => { 
    updateTokenBalances(); 
    updateSynapseApiUser();
    refreshAccountApiKeys();
    updateContributorPoolInfo();
  }, [address]);

  const value = {
    tokenBalances,
    isLoadingBalances,
    balancesError,
    updateTokenBalances,
    getTokenBalance,
    synapseApiUser,
    isLoadingApiUser,
    apiUserError,
    updateSynapseApiUser,
    accessKeys,
    isLoadingAccessKeys,
    accessKeysError,
    refreshAccountApiKeys,
    contributorPoolInfo,
    isLoadingPoolInfo,
    poolInfoError,
    updateContributorPoolInfo,
    address
  };

  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  );
};



export default UserStateProvider;
