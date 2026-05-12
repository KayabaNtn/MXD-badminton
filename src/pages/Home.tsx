import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Users, Award, TrendingUp, ArrowRight } from "lucide-react";
import { getSessions, getMembers, getRegistrations, formatDate, formatCurrency } from "../utils/db";
import type { Session } from "../types";

export function Home() {
    const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState({ members: 0, sessions: 0, registrations: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [sessions, members, registrations] = await Promise.all([
                getSessions(),
                getMembers(),
                getRegistrations(),
            ]);
            const upcoming = sessions
                .filter((s) => s.status === "upcoming")
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3);
            setUpcomingSessions(upcoming);
            setStats({
                members: members.length,
                sessions: sessions.length,
                registrations: registrations.length,
            });
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white">
                <div className="max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        🏸 Câu lạc bộ Cầu lông MXD Badminton
                    </h1>
                    <p className="text-blue-100 text-lg mb-6">
                        Nơi giao lưu, rèn luyện sức khỏe và thi đấu cầu lông dành cho mọi người.
                        Cùng tham gia và trở thành một phần của cộng đồng chúng tôi!
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/lich-dau"
                            className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                        >
                            <CalendarDays className="w-4 h-4" />
                            Xem lịch đấu
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/thanh-vien"
                            className="inline-flex items-center gap-2 bg-white/20 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/30 transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            Thành viên
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.members}</p>
                            <p className="text-sm text-gray-500">Thành viên</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CalendarDays className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.sessions}</p>
                            <p className="text-sm text-gray-500">Buổi tập</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.registrations}</p>
                            <p className="text-sm text-gray-500">Lượt đăng ký</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Sessions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        Buổi tập sắp tới
                    </h2>
                    <Link
                        to="/lich-dau"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Xem tất cả →
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingSessions.map((session) => (
                        <Link
                            key={session.id}
                            to={`/lich-dau`}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Sắp diễn ra
                                </span>
                                <Award className="w-5 h-5 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">
                                {session.title}
                            </h3>
                            <div className="space-y-1.5 text-sm text-gray-600">
                                <p>📅 {formatDate(session.date)}</p>
                                <p>⏰ {session.time}</p>
                                <p>📍 {session.location}</p>
                                <p>💰 {formatCurrency(session.fee)}</p>
                            </div>
                        </Link>
                    ))}
                    {upcomingSessions.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-gray-500">
                            <p className="text-lg">Chưa có buổi tập nào sắp tới</p>
                            <p className="text-sm mt-1">Vui lòng quay lại sau</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent results preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Kết quả gần đây
                    </h2>
                </div>
                <p className="text-gray-500 mb-4">
                    Xem kết quả các trận đấu, giải đấu nội bộ và giao hữu gần đây.
                </p>
                <Link
                    to="/ket-qua"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    Xem tất cả kết quả <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}