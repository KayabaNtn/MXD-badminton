import { useEffect, useState } from "react";
import { Award, Search } from "lucide-react";
import { getResults, getSessions, getMembers, getSessionWithDetails } from "../utils/db";
import { formatDate } from "../utils/db";
import type { Result, Session } from "../types";

export function ResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [members, setMembers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            const [r, s, m] = await Promise.all([
                getResults(),
                getSessions(),
                getMembers(),
            ]);
            setResults(r);
            setSessions(s);
            setMembers(
                Object.fromEntries(m.map((mem) => [mem.id, mem.name]))
            );
            setLoading(false);
        }
        load();
    }, []);

    const getSessionTitle = (sessionId: string) =>
        sessions.find((s) => s.id === sessionId)?.title || "N/A";

    const getSessionDate = (sessionId: string) => {
        const session = sessions.find((s) => s.id === sessionId);
        return session ? formatDate(session.date) : "";
    };

    const filteredResults = results.filter((r) => {
        const session = sessions.find((s) => s.id === r.sessionId);
        const searchStr = [
            session?.title || "",
            ...(r.type === "single"
                ? [members[r.player1 || ""] || "", members[r.player2 || ""] || ""]
                : []),
        ]
            .join(" ")
            .toLowerCase();
        return searchStr.includes(search.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Kết quả trận đấu</h1>
                <p className="text-gray-500 mt-1">
                    Kết quả các trận đấu đã diễn ra
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm kết quả..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="space-y-4">
                {filteredResults.map((result) => (
                    <div
                        key={result.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium text-gray-900">
                                    {getSessionTitle(result.sessionId)}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {getSessionDate(result.sessionId)}
                                </span>
                            </div>

                            {result.type === "single" ? (
                                <div className="flex items-center justify-center gap-6 py-4">
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-900">
                                            {members[result.player1 || ""] ||
                                                "N/A"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-2xl font-bold ${result.winner === result.player1
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                                }`}
                                        >
                                            {result.score1}
                                        </span>
                                        <span className="text-gray-300 text-xl font-light">
                                            -
                                        </span>
                                        <span
                                            className={`text-2xl font-bold ${result.winner === result.player2
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                                }`}
                                        >
                                            {result.score2}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-900">
                                            {members[result.player2 || ""] ||
                                                "N/A"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 py-2">
                                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            Đội 1:{" "}
                                            {result.team1
                                                ?.map(
                                                    (id) =>
                                                        members[id] || "N/A"
                                                )
                                                .join(" & ")}
                                        </span>
                                        <span
                                            className={`text-lg font-bold ${result.winner === "team1"
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                                }`}
                                        >
                                            {result.score1}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            Đội 2:{" "}
                                            {result.team2
                                                ?.map(
                                                    (id) =>
                                                        members[id] || "N/A"
                                                )
                                                .join(" & ")}
                                        </span>
                                        <span
                                            className={`text-lg font-bold ${result.winner === "team2"
                                                    ? "text-green-600"
                                                    : "text-gray-400"
                                                }`}
                                        >
                                            {result.score2}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {result.notes && (
                                <p className="text-sm text-gray-500 mt-3 italic">
                                    {result.notes}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {filteredResults.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                        <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Không có kết quả nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}