import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { authApi } from "../services/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

interface User {
  id: number;
  email: string;
  role: "admin" | "patient";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    data: z.infer<typeof loginSchema>,
    role: "admin" | "patient"
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString && token) {
      const storedUser = JSON.parse(userString);
      setUser(storedUser);
    }
    setLoading(false);
  }, [token]);

  const login = async (data: z.infer<typeof loginSchema>) => {
    const response = await authApi.login(data);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
