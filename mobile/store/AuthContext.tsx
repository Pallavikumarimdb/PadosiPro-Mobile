import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type Profile, type User } from '../services/padosi';
import { getToken, setToken } from '../services/api';

interface AuthState {
  status: 'loading' | 'signedOut' | 'needsOnboarding' | 'signedIn';
  user: User | null;
  profile: Profile | null;
  bootstrapError: string | null;
  refresh: () => Promise<void>;
  signInWithToken: (token: string, user: User, profile: Profile | null) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setStatus('signedOut');
      return;
    }
    try {
      const res = await authService.me();
      setUser(res.user);
      setProfile(res.profile);
      setBootstrapError(null);
      setStatus(res.user.profileComplete ? 'signedIn' : 'needsOnboarding');
    } catch {
      // Expired/invalid token or backend down with a stale token: stay signed out but keep the message.
      setUser(null);
      setProfile(null);
      setBootstrapError('Session expired or server unreachable. Please log in again.');
      setStatus('signedOut');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signInWithToken = useCallback(async (token: string, nextUser: User, nextProfile: Profile | null) => {
    await setToken(token);
    setUser(nextUser);
    setProfile(nextProfile);
    setBootstrapError(null);
    setStatus(nextUser.profileComplete ? 'signedIn' : 'needsOnboarding');
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Best effort - still clear local state.
    }
    await setToken(null);
    setUser(null);
    setProfile(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo(
    () => ({ status, user, profile, bootstrapError, refresh, signInWithToken, signOut }),
    [status, user, profile, bootstrapError, refresh, signInWithToken, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
