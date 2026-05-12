import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Shield, LogOut, Award, CalendarDays, Home, Users } from "lucide-react";
import { cn } from "../../utils/cn";

const navLinks = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/lich-dau", label: "Lịch đấu", icon: CalendarDays },
    { to: "/ket-qua", label: "Kết quả", icon: Award },
    { to: "/thanh-vien", label: "Thành viên", icon: Users },
];

export function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl">🏸</span>
                        <span className="font-bold text-xl text-gray-900">
                            MXD Badminton
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                        {isAuthenticated && (
                            <Link
                                to="/admin"
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    location.pathname.startsWith("/admin")
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                <Shield className="w-4 h-4" />
                                Admin
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <button
                                onClick={logout}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden md:inline">Đăng xuất</span>
                            </button>
                        ) : (
                            <Link
                                to="/admin"
                                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                <span className="hidden md:inline">Admin</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={cn(
                                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                                    isActive
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}