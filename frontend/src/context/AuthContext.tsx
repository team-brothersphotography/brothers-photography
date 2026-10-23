
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";
import type { User } from "../types";
import type { SecurityAnswer } from "../api/auth";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (payload: {
    full_name: string;
    phone_number: string;
    password: string;
    confirm_password: string;
    security_answers: SecurityAnswer[];
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signInWithGoogle: (credential: string) => Promise<authApi.GooglePrepareResponse>;
  completeGoogleSignUp: (
    credential: string,
    phone_number: string
  ) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("bp_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .fetchProfile()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("bp_token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(identifier: string, password: string) {
    const { token, user: loggedInUser } = await authApi.login({
      identifier,
      password,
    });

    localStorage.setItem("bp_token", token);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(payload: {
    full_name: string;
    phone_number: string;
    password: string;
    confirm_password: string;
    security_answers: SecurityAnswer[];
  }) {
    const { token, user: newUser } =
      await authApi.registerCustomer(payload);

    localStorage.setItem("bp_token", token);
    setUser(newUser);
    return newUser;
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Clear the local session even if the server request fails.
    }

    localStorage.removeItem("bp_token");
    setUser(null);
  }

  async function refreshProfile() {
    const profile = await authApi.fetchProfile();
    setUser(profile);
  }

  async function signInWithGoogle(credential: string) {
    const result = await authApi.prepareGoogleSignIn(credential);

    if (result.needs_phone) {
      return result;
    }

    if (!result.token || !result.user) {
      throw new Error("Google sign-in returned an incomplete response.");
    }

    localStorage.setItem("bp_token", result.token);
    setUser(result.user);

    return result;
  }

  async function completeGoogleSignUp(
    credential: string,
    phone_number: string
  ) {
    const result = await authApi.completeGoogleSignUp({
      credential,
      phone_number,
    });

    localStorage.setItem("bp_token", result.token);
    setUser(result.user);

    return result.user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        signInWithGoogle,
        completeGoogleSignUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
