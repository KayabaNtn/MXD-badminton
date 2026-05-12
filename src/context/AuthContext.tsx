import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    user: { username: string } | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<{ username: string } | null>(() => {
        const stored = localStorage.getItem("badminton_admin");
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem("badminton_admin", JSON.stringify(user));
        } else {
            localStorage.removeItem("badminton_admin");
        }
    }, [user]);

    const login = (username: string, password: string) => {
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            setUser({ username });
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated: !!user, user, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}