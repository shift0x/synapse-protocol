import { createContext, useContext, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { getAccountTokenBalances } from '../lib/chain/getAccountTokenBalances.ts';
import { getSynapseAPIUser } from '../lib/chain/getSynapseApiUser.ts'

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

  // Load balances and API user when address changes
  useMemo(() => { 
    updateTokenBalances(); 
    updateSynapseApiUser();
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
    address
  };

  return (
    <UserStateContext.Provider value={value}>
      {children}
    </UserStateContext.Provider>
  );
};



export default UserStateProvider;
