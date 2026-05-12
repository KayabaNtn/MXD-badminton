import { useEffect, useState } from "react";
import { Users, Phone, Mail, Calendar, Search } from "lucide-react";
import { getMembers } from "../utils/db";
import type { Member } from "../types";

export function Members() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            const m = await getMembers();
            setMembers(m);
            setLoading(false);
        }
        load();
    }, []);

    const filteredMembers = members.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
    );

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
                <h1 className="text-2xl font-bold text-gray-900">Thành viên</h1>
                <p className="text-gray-500 mt-1">
                    Danh sách thành viên câu lạc bộ ({members.length} người)
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm thành viên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                    <div
                        key={member.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                {member.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {member.name}
                                </h3>
                                <span className="text-xs text-gray-400">
                                    {member.id}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                {member.phone}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                {member.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                Tham gia: {member.joinDate}
                            </div>
                        </div>
                    </div>
                ))}
                {filteredMembers.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Không tìm thấy thành viên</p>
                    </div>
                )}
            </div>
        </div>
    );
}