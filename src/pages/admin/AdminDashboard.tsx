import { useEffect, useState, useCallback } from "react";
import {
    Users, CalendarDays, DollarSign, Activity, Plus, X, Trash2, Edit, LogOut, Check
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    getMembers, getRegistrations, getPayments,
    addMember, deleteMember, updateMember,
    addSession, updateSession, deleteSession,
    addRegistration, removeRegistration,
    togglePayment,
    formatCurrency, formatDate
} from "../../utils/db";
import { cn } from "../../utils/cn";
import type { Member, Session, Registration, Payment } from "../../types";

export function AdminDashboard() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) navigate("/admin/login");
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) return null;

    return <DashboardContent />;
}

function DashboardContent() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "members" | "registrations">("overview");

    const loadData = useCallback(async () => {
        const [s, m, r, p] = await Promise.all([
            import("../../utils/db").then(mod => mod.getSessions()),
            getMembers(),
            getRegistrations(),
            getPayments(),
        ]);
        setSessions(s);
        setMembers(m);
        setRegistrations(r);
        setPayments(p);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
    const totalRegistrations = registrations.length;
    const totalRevenue = sessions.reduce((sum, s) => {
        const paid = payments.filter((p) => p.sessionId === s.id && p.paid).length;
        return sum + paid * s.fee;
    }, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1">Quản lý câu lạc bộ cầu lông</p>
                </div>
                <button
                    onClick={() => { logout(); navigate("/"); }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg"><CalendarDays className="w-5 h-5 text-blue-600" /></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
                            <p className="text-xs text-gray-500">Buổi sắp tới</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                            <p className="text-xs text-gray-500">Thành viên</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg"><Activity className="w-5 h-5 text-purple-600" /></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{totalRegistrations}</p>
                            <p className="text-xs text-gray-500">Đăng ký</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg"><DollarSign className="w-5 h-5 text-orange-600" /></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                            <p className="text-xs text-gray-500">Tổng thu</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                {(["overview", "sessions", "members", "registrations"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={cn("flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                            activeTab === tab ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}>
                        {tab === "overview" && "Tổng quan"}
                        {tab === "sessions" && "Quản lý buổi tập"}
                        {tab === "members" && "Thành viên"}
                        {tab === "registrations" && "Đăng ký & Thanh toán"}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
                <OverviewTab sessions={sessions} members={members} registrations={registrations} payments={payments} />
            )}
            {activeTab === "sessions" && (
                <SessionsTab sessions={sessions} onUpdate={loadData} />
            )}
            {activeTab === "members" && (
                <MembersTab members={members} onUpdate={loadData} />
            )}
            {activeTab === "registrations" && (
                <RegistrationsTab sessions={sessions} members={members} registrations={registrations} payments={payments} onUpdate={loadData} />
            )}
        </div>
    );
}

function OverviewTab({ sessions, members, registrations, payments }: {
    sessions: Session[]; members: Member[]; registrations: Registration[]; payments: Payment[];
}) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Các buổi tập</h3>
                <div className="space-y-2">
                    {sessions.slice(0, 5).map((s) => {
                        const regCount = registrations.filter((r) => r.sessionId === s.id).length;
                        const paidCount = payments.filter((p) => p.sessionId === s.id && p.paid).length;
                        return (
                            <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn("w-2 h-2 rounded-full", s.status === "upcoming" ? "bg-green-500" : "bg-gray-400")} />
                                    <span className="font-medium text-gray-900">{s.title}</span>
                                    <span className="text-gray-400">- {formatDate(s.date)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <span>{regCount} ĐK</span>
                                    <span className={paidCount > 0 ? "text-green-600" : "text-red-500"}>{paidCount} ĐT</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Thành viên mới nhất</h3>
                    <div className="space-y-2">
                        {members.slice(0, 5).map((m) => (
                            <div key={m.id} className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">{m.name.charAt(0)}</div>
                                <span>{m.name}</span>
                                <span className="text-gray-400 ml-auto">{m.phone}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Thanh toán gần đây</h3>
                    <div className="space-y-2">
                        {payments.filter((p) => p.paid).slice(0, 5).map((p, i) => {
                            const member = members.find((m) => m.id === p.memberId);
                            const session = sessions.find((s) => s.id === p.sessionId);
                            return (
                                <div key={i} className="flex items-center justify-between text-sm text-gray-600">
                                    <span>{member?.name || p.memberId}</span>
                                    <span className="text-green-600">{session?.title || p.sessionId}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SessionsTab({ sessions, onUpdate }: { sessions: Session[]; onUpdate: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<{ title: string; date: string; time: string; location: string; description: string; maxParticipants: number; fee: number; status: "upcoming" | "completed" }>({ title: "", date: "", time: "", location: "", description: "", maxParticipants: 20, fee: 50000, status: "upcoming" });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!form.title || !form.date) return;
        setSaving(true);
        try {
            if (editingId) {
                await updateSession(editingId, form);
            } else {
                await addSession(form);
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ title: "", date: "", time: "", location: "", description: "", maxParticipants: 20, fee: 50000, status: "upcoming" });
            onUpdate();
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (session: Session) => {
        setForm({
            title: session.title, date: session.date, time: session.time, location: session.location,
            description: session.description, maxParticipants: session.maxParticipants, fee: session.fee, status: session.status,
        });
        setEditingId(session.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Xóa buổi tập này?")) return;
        await deleteSession(id);
        onUpdate();
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Danh sách buổi tập ({sessions.length})</h3>
                <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: "", date: "", time: "", location: "", description: "", maxParticipants: 20, fee: 50000, status: "upcoming" }); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Thêm buổi
                </button>
            </div>

            {showForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{editingId ? "Sửa buổi tập" : "Thêm buổi tập mới"}</h4>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="block text-xs text-gray-600 mb-1">Tiêu đề</label>
                            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Ngày</label>
                            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Thời gian</label>
                            <input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="18:00 - 20:00" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Địa điểm</label>
                            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                        <div className="md:col-span-2"><label className="block text-xs text-gray-600 mb-1">Mô tả</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Số người tối đa</label>
                            <input type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Phí tham gia (VND)</label>
                            <input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Trạng thái</label>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "upcoming" | "completed" })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                <option value="upcoming">Sắp diễn ra</option>
                                <option value="completed">Đã diễn ra</option>
                            </select></div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Hủy</button>
                        <button onClick={handleSave} disabled={saving}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 font-medium text-gray-600">Buổi tập</th>
                            <th className="text-left py-3 font-medium text-gray-600">Ngày</th>
                            <th className="text-left py-3 font-medium text-gray-600">Giờ</th>
                            <th className="text-left py-3 font-medium text-gray-600">Địa điểm</th>
                            <th className="text-left py-3 font-medium text-gray-600">Phí</th>
                            <th className="text-left py-3 font-medium text-gray-600">Trạng thái</th>
                            <th className="text-right py-3 font-medium text-gray-600">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((s) => (
                            <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 font-medium text-gray-900">{s.title}</td>
                                <td className="py-3 text-gray-600">{formatDate(s.date)}</td>
                                <td className="py-3 text-gray-600">{s.time}</td>
                                <td className="py-3 text-gray-600 max-w-[200px] truncate">{s.location}</td>
                                <td className="py-3 text-gray-600">{formatCurrency(s.fee)}</td>
                                <td className="py-3">
                                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium",
                                        s.status === "upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800")}>
                                        {s.status === "upcoming" ? "Sắp tới" : "Đã xong"}
                                    </span>
                                </td>
                                <td className="py-3 text-right">
                                    <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-700 mr-2"><Edit className="w-4 h-4 inline" /></button>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4 inline" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MembersTab({ members, onUpdate }: { members: Member[]; onUpdate: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: "", phone: "", email: "" });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!form.name || !form.phone) return;
        setSaving(true);
        try {
            if (editingId) {
                await updateMember(editingId, form);
            } else {
                await addMember(form);
            }
            setShowForm(false);
            setEditingId(null);
            setForm({ name: "", phone: "", email: "" });
            onUpdate();
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (m: Member) => {
        setForm({ name: m.name, phone: m.phone, email: m.email });
        setEditingId(m.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Xóa thành viên này? Dữ liệu đăng ký và thanh toán liên quan cũng sẽ bị xóa.")) return;
        await deleteMember(id);
        onUpdate();
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Danh sách thành viên ({members.length})</h3>
                <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", phone: "", email: "" }); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Thêm thành viên
                </button>
            </div>

            {showForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{editingId ? "Sửa thành viên" : "Thêm thành viên mới"}</h4>
                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div><label className="block text-xs text-gray-600 mb-1">Họ tên *</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Số điện thoại *</label>
                            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                        <div><label className="block text-xs text-gray-600 mb-1">Email</label>
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" /></div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Hủy</button>
                        <button onClick={handleSave} disabled={saving}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm"}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {m.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{m.name}</p>
                            <p className="text-xs text-gray-500">{m.phone}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(m)} className="p-1 text-blue-600 hover:text-blue-700"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDelete(m.id)} className="p-1 text-red-600 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <span className="text-xs text-gray-400">{m.id}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RegistrationsTab({ sessions, members, registrations, payments, onUpdate }: {
    sessions: Session[]; members: Member[]; registrations: Registration[]; payments: Payment[]; onUpdate: () => void;
}) {
    const [selectedSession, setSelectedSession] = useState<string>("");
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedSession && sessions.length > 0) {
            const upcoming = sessions.filter((s) => s.status === "upcoming");
            setSelectedSession(upcoming[0]?.id || sessions[0].id);
        }
    }, [sessions, selectedSession]);

    const sessionRegs = registrations.filter((r) => r.sessionId === selectedSession);
    const sessionPays = payments.filter((p) => p.sessionId === selectedSession);

    const handleToggleRegistration = async (memberId: string) => {
        if (!selectedSession) return;
        setProcessing(memberId);
        const isRegistered = sessionRegs.some((r) => r.memberId === memberId);
        try {
            if (isRegistered) {
                await removeRegistration(selectedSession, memberId);
            } else {
                await addRegistration(selectedSession, memberId);
            }
            onUpdate();
        } finally {
            setProcessing(null);
        }
    };

    const handleTogglePayment = async (memberId: string) => {
        if (!selectedSession) return;
        setProcessing(memberId);
        try {
            await togglePayment(selectedSession, memberId);
            onUpdate();
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
                <label className="text-sm font-medium text-gray-700">Chọn buổi tập:</label>
                <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm flex-1 max-w-md">
                    {sessions.map((s) => (
                        <option key={s.id} value={s.id}>{s.title} - {formatDate(s.date)} ({s.status === "upcoming" ? "Sắp tới" : "Đã xong"})</option>
                    ))}
                </select>
            </div>

            {selectedSession && (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-blue-700">{sessionRegs.length}</p>
                            <p className="text-xs text-blue-600">Đã đăng ký</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-green-700">{sessionPays.filter((p) => p.paid).length}</p>
                            <p className="text-xs text-green-600">Đã đóng tiền</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-red-700">{sessionPays.filter((p) => !p.paid).length}</p>
                            <p className="text-xs text-red-600">Chưa đóng</p>
                        </div>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-3">Quản lý đăng ký & thanh toán</h4>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {members.map((m) => {
                            const isRegistered = sessionRegs.some((r) => r.memberId === m.id);
                            const isPaid = sessionPays.some((p) => p.memberId === m.id && p.paid);
                            const isLoading = processing === m.id;
                            return (
                                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold">
                                            {m.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{m.name}</p>
                                            <p className="text-xs text-gray-500">{m.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggleRegistration(m.id)}
                                            disabled={isLoading}
                                            className={cn("px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-50",
                                                isRegistered ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            )}>
                                            {isLoading ? "..." : isRegistered ? "Hủy ĐK" : "Đăng ký"}
                                        </button>
                                        {isRegistered && (
                                            <button onClick={() => handleTogglePayment(m.id)}
                                                disabled={isLoading}
                                                className={cn("px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1",
                                                    isPaid ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                )}>
                                                {isLoading ? "..." : isPaid ? <><Check className="w-3 h-3" /> Đã đóng</> : "Chưa đóng"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}