import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "foodrescue_token";
const USER_KEY = "foodrescue_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY)) || null;
    } catch {
      return null;
    }
  });

  // =========================
  // LOGIN
  // =========================

  const login = async (email, password) => {
    const response = await api.post("/users/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setUser(user);

    return user;
  };

  // =========================
  // REGISTER
  // =========================

  const register = async (data) => {
    const response = await api.post("/users/register", data);

    return response.data;
  };

  // =========================
  // GET PROFILE
  // =========================

  const refreshProfile = async () => {
    if (!user?.user_id) {
      return;
    }

    const response = await api.get(`/users/${user.user_id}`);

    const updatedUser = response.data.user || response.data;

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);

    return updatedUser;
  };

  // =========================
  // UPDATE PROFILE
  // =========================

  const updateProfile = async (data) => {
    const response = await api.put(
      `/users/${user.user_id}`,
      data
    );

    const updatedUser =
      response.data.user || response.data;

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);

    return updatedUser;
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setUser(null);
  };

  useEffect(() => {
    if (user) {
      refreshProfile().catch(() => {});
    }

    // Only run when application loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}