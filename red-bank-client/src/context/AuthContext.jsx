import { auth } from '@/firebase.config';
import authService from '@/services/authService';
import { SilentLogout } from '@/lib/logout';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { createContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const provisioningRef = useRef(false);
  const [isProvisioning, setIsProvisioningState] = useState(false);

  const setIsProvisioning = (value) => {
    provisioningRef.current = value;
    setIsProvisioningState(value);
  };

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      setIsLoading(true);

      if (!user) {
        setAuthData(null);
        setIsLoading(false);
        return;
      }

      if (provisioningRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        await authService.createSession();
        const { data } = await authService.getUser();

        if (active) {
          setAuthData(data || null);
        }
      } catch {
        if (active) setAuthData(null);
        await signOut(auth).catch(() => undefined);
        await SilentLogout().catch(() => undefined);
      } finally {
        if (active) setIsLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authData,
        setAuthData,
        isLoading,
        setIsLoading,
        isProvisioning,
        setIsProvisioning,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export { AuthContext, AuthProvider, AuthProvider as AuthContextProvider };
