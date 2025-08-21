import { createContext, useContext, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { getAccountTokenBalances } from '../lib/chain/getAccountTokenBalances.ts';
import { getSynapseAPIUser } from '../lib/chain/getSynapseAPIUser.ts';
import { getAccountApiKeys } from '../lib/api/getAccountApiKeys.ts'

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
      const apiUser = await getSynapseAPIUser(address);
      
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

  // Load balances, API user, and access keys when address changes
  useMemo(() => { 
    updateTokenBalances(); 
    updateSynapseApiUser();
    refreshAccountApiKeys();
  }, [address]);

  const value = {
    tokenBalances,
    isLoadingBalances,
    balancesError,
    updateTokenBalances,
    synapseApiUser,
    isLoadingApiUser,
    apiUserError,
    updateSynapseApiUser,
    accessKeys,
    isLoadingAccessKeys,
    accessKeysError,
    refreshAccountApiKeys,
    address
  };

  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  );
};



export default UserStateProvider;
