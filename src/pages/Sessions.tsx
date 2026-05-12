import { useEffect, useState } from "react";
import { CalendarDays, MapPin, Clock, Users, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { getSessionWithDetails, formatDate, formatCurrency } from "../utils/db";
import { cn } from "../utils/cn";
import type { SessionWithDetails } from "../types";

export function Sessions() {
    const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const sessionsList = await import("../utils/db").then(mod => mod.getSessions());
            const all = await Promise.all(
                sessionsList.map((s) => getSessionWithDetails(s.id))
            );
            setSessions(all.filter(Boolean) as SessionWithDetails[]);
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

    const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
    const pastSessions = sessions.filter((s) => s.status === "completed");

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Lịch tập & Đấu</h1>
                <p className="text-gray-500 mt-1">
                    Thông tin các buổi tập, giải đấu sắp tới và đã diễn ra
                </p>
            </div>

            {/* Upcoming */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Buổi sắp tới
                </h2>
                <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            isExpanded={expandedId === session.id}
                            onToggle={() =>
                                setExpandedId(
                                    expandedId === session.id ? null : session.id
                                )
                            }
                        />
                    ))}
                    {upcomingSessions.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                            <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Chưa có buổi tập nào sắp tới</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Past */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Buổi đã diễn ra
                </h2>
                <div className="space-y-4">
                    {pastSessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            isExpanded={expandedId === session.id}
                            onToggle={() =>
                                setExpandedId(
                                    expandedId === session.id ? null : session.id
                                )
                            }
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function SessionCard({
    session,
    isExpanded,
    onToggle,
}: {
    session: SessionWithDetails;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full text-left p-5 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                    session.status === "upcoming"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                )}
                            >
                                {session.status === "upcoming"
                                    ? "Sắp diễn ra"
                                    : "Đã diễn ra"}
                            </span>
                            <span className="text-sm text-gray-500">
                                {formatDate(session.date)}
                            </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">
                            {session.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {session.time}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {session.location.split(",")[0]}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                {session.registrationCount}/{session.maxParticipants}
                            </span>
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-3.5 h-3.5" />
                                {formatCurrency(session.fee)}
                            </span>
                        </div>
                    </div>
                    <div className="text-gray-400 mt-1">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </div>
                </div>
            </button>

            {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100">
                    {/* Description */}
                    {session.description && (
                        <p className="text-gray-600 text-sm mt-4 mb-4">
                            {session.description}
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Registered members */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                Đã đăng ký ({session.registrationCount})
                            </h4>
                            <div className="space-y-2">
                                {session.registeredMembers.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="text-gray-700">
                                            {m.name}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs font-medium px-2 py-0.5 rounded-full",
                                                session.payments.some(
                                                    (p) =>
                                                        p.memberId === m.id &&
                                                        p.paid
                                                )
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            )}
                                        >
                                            {session.payments.some(
                                                (p) =>
                                                    p.memberId === m.id && p.paid
                                            )
                                                ? "Đã đóng"
                                                : "Chưa đóng"}
                                        </span>
                                    </div>
                                ))}
                                {session.registeredMembers.length === 0 && (
                                    <p className="text-gray-400 text-sm">
                                        Chưa có ai đăng ký
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Payment summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                Tình trạng đóng tiền
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        Đã đóng
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        {session.paidCount} người
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                        Chưa đóng
                                    </span>
                                    <span className="font-semibold text-red-600">
                                        {session.unpaidCount} người
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 pt-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Tổng thu
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(
                                                session.totalCollection
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results if any */}
                    {session.results.length > 0 && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                📊 Kết quả trận đấu
                            </h4>
                            <div className="space-y-2">
                                {session.results.map((result) => (
                                    <div
                                        key={result.id}
                                        className="bg-white rounded-lg p-3 text-sm"
                                    >
                                        {result.type === "single" ? (
                                            <p>
                                                {result.player1} vs{" "}
                                                {result.player2}: {result.score1}-
                                                {result.score2}
                                                {result.notes && (
                                                    <span className="text-gray-400 ml-2">
                                                        - {result.notes}
                                                    </span>
                                                )}
                                            </p>
                                        ) : (
                                            <p>
                                                Đội 1 vs Đội 2: {result.score1}-
                                                {result.score2}
                                                {result.notes && (
                                                    <span className="text-gray-400 ml-2">
                                                        - {result.notes}
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}