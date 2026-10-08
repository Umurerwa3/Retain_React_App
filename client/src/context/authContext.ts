import { createContext } from 'react';
import type { Credentials, Role, SignUpData, User } from '../types';

export interface AuthContextValue {
  user: User | null;
  /** True while the stored session is being restored on first load */
  initializing: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (...roles: Role[]) => boolean;
  signIn: (credentials: Credentials) => Promise<User>;
  signUp: (data: SignUpData) => Promise<User>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
