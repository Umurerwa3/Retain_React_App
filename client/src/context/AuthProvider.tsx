import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { onUnauthorized, tokenStorage } from '../api/client';
import type { AuthResponse, Credentials, Role, SignUpData, User } from '../types';
import { AuthContext, type AuthContextValue } from './authContext';
import { useAppDispatch } from '../store/hooks';
import { resetFilters } from '../store/slices/filtersSlice';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(() => Boolean(tokenStorage.get()));

  const dispatch = useAppDispatch();

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    // Don't carry one user's expense filters over to the next account
    dispatch(resetFilters());
  }, [dispatch]);

  // Restore the session from a stored token
  useEffect(() => {
    if (!tokenStorage.get()) return;
    let cancelled = false;
    authApi
      .me()
      .then((me) => !cancelled && setUser(me))
      .catch(() => !cancelled && signOut())
      .finally(() => !cancelled && setInitializing(false));
    return () => {
      cancelled = true;
    };
  }, [signOut]);

  // Any 401 from the API (expired token, deleted user) ends the session
  useEffect(() => {
    onUnauthorized(signOut);
    return () => onUnauthorized(null);
  }, [signOut]);

  const startSession = useCallback(({ token, user }: AuthResponse) => {
    tokenStorage.set(token);
    setUser(user);
    return user;
  }, []);

  const signIn = useCallback(
    async (credentials: Credentials) => startSession(await authApi.signIn(credentials)),
    [startSession]
  );

  const signUp = useCallback(async (data: SignUpData) => startSession(await authApi.signUp(data)), [startSession]);

  const hasRole = useCallback((...roles: Role[]) => Boolean(user && roles.includes(user.role)), [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      hasRole,
      signIn,
      signUp,
      signOut,
    }),
    [user, initializing, hasRole, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
