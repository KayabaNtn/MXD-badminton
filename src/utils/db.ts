import type { Member, Session, Registration, Payment, Result } from "../types";

const DB_BASE_PATH = "/database";
const STORAGE_KEY = "badminton_club";

export interface StoreData {
    members: Member[];
    sessions: Session[];
    registrations: Registration[];
    payments: Payment[];
    results: Result[];
}

async function fetchJson<T>(filename: string): Promise<T> {
    const response = await fetch(`${DB_BASE_PATH}/${filename}`);
    if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
    return response.json();
}

// -------- STORAGE INIT + HELPERS --------

function getStore(): StoreData {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return { members: [], sessions: [], registrations: [], payments: [], results: [] };
}

function saveStore(data: StoreData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let _initialized = false;

async function ensureInitialized() {
    if (_initialized) return;
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
        _initialized = true;
        return;
    }
    const [members, sessions, registrations, payments, results] = await Promise.all([
        fetchJson<Member[]>("members.json"),
        fetchJson<Session[]>("sessions.json"),
        fetchJson<Registration[]>("registrations.json"),
        fetchJson<Payment[]>("payments.json"),
        fetchJson<Result[]>("results.json"),
    ]);
    saveStore({ members, sessions, registrations, payments, results });
    _initialized = true;
}

// -------- GENERATE ID --------

function genId(prefix: string, existing: { id: string }[]): string {
    const max = existing.reduce((max, item) => {
        const num = parseInt(item.id.replace(prefix, ""), 10);
        return num > max ? num : max;
    }, 0);
    return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function genResultId(existing: Result[]): string {
    const max = existing.reduce((max, item) => {
        const num = parseInt(item.id.replace("R", ""), 10);
        return num > max ? num : max;
    }, 0);
    return `R${String(max + 1).padStart(3, "0")}`;
}

// -------- PUBLIC API --------

export async function initDB() {
    await ensureInitialized();
}

// -------- MEMBERS --------

export async function getMembers(): Promise<Member[]> {
    await ensureInitialized();
    return getStore().members;
}

export async function getMemberById(id: string): Promise<Member | undefined> {
    const members = await getMembers();
    return members.find((m) => m.id === id);
}

export async function addMember(data: { name: string; phone: string; email: string }): Promise<Member> {
    await ensureInitialized();
    const store = getStore();
    const member: Member = {
        id: genId("M", store.members),
        name: data.name,
        phone: data.phone,
        email: data.email,
        joinDate: new Date().toISOString().split("T")[0],
        avatar: "",
    };
    store.members.push(member);
    saveStore(store);
    return member;
}

export async function updateMember(id: string, data: Partial<Member>): Promise<Member | undefined> {
    const store = getStore();
    const idx = store.members.findIndex((m) => m.id === id);
    if (idx === -1) return undefined;
    store.members[idx] = { ...store.members[idx], ...data };
    saveStore(store);
    return store.members[idx];
}

export async function deleteMember(id: string): Promise<boolean> {
    const store = getStore();
    const idx = store.members.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    store.members.splice(idx, 1);
    // Also clean up related registrations and payments
    store.registrations = store.registrations.filter((r) => r.memberId !== id);
    store.payments = store.payments.filter((p) => p.memberId !== id);
    saveStore(store);
    return true;
}

// -------- SESSIONS --------

export async function getSessions(): Promise<Session[]> {
    await ensureInitialized();
    return getStore().sessions;
}

export async function getSessionById(id: string): Promise<Session | undefined> {
    const sessions = await getSessions();
    return sessions.find((s) => s.id === id);
}

export async function addSession(data: {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    maxParticipants: number;
    fee: number;
    status: "upcoming" | "completed";
}): Promise<Session> {
    await ensureInitialized();
    const store = getStore();
    const session: Session = {
        id: genId("S", store.sessions),
        ...data,
        createdAt: new Date().toISOString(),
    };
    store.sessions.push(session);
    saveStore(store);
    return session;
}

export async function updateSession(id: string, data: Partial<Session>): Promise<Session | undefined> {
    const store = getStore();
    const idx = store.sessions.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    store.sessions[idx] = { ...store.sessions[idx], ...data };
    saveStore(store);
    return store.sessions[idx];
}

export async function deleteSession(id: string): Promise<boolean> {
    const store = getStore();
    const idx = store.sessions.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    store.sessions.splice(idx, 1);
    // Clean up related data
    store.registrations = store.registrations.filter((r) => r.sessionId !== id);
    store.payments = store.payments.filter((p) => p.sessionId !== id);
    store.results = store.results.filter((r) => r.sessionId !== id);
    saveStore(store);
    return true;
}

// -------- REGISTRATIONS --------

export async function getRegistrations(): Promise<Registration[]> {
    await ensureInitialized();
    return getStore().registrations;
}

export async function getRegistrationsBySession(sessionId: string): Promise<Registration[]> {
    const regs = await getRegistrations();
    return regs.filter((r) => r.sessionId === sessionId);
}

export async function addRegistration(sessionId: string, memberId: string): Promise<Registration> {
    const store = getStore();
    // Check if already registered
    const exists = store.registrations.find((r) => r.sessionId === sessionId && r.memberId === memberId);
    if (exists) return exists;
    const registration: Registration = {
        sessionId,
        memberId,
        registeredAt: new Date().toISOString(),
    };
    store.registrations.push(registration);
    // Also auto-add a payment record
    const payExists = store.payments.find((p) => p.sessionId === sessionId && p.memberId === memberId);
    if (!payExists) {
        store.payments.push({
            sessionId,
            memberId,
            paid: false,
            paidAt: "",
        });
    }
    saveStore(store);
    return registration;
}

export async function removeRegistration(sessionId: string, memberId: string): Promise<boolean> {
    const store = getStore();
    const idx = store.registrations.findIndex((r) => r.sessionId === sessionId && r.memberId === memberId);
    if (idx === -1) return false;
    store.registrations.splice(idx, 1);
    // Also remove payment record
    const payIdx = store.payments.findIndex((p) => p.sessionId === sessionId && p.memberId === memberId);
    if (payIdx !== -1) store.payments.splice(payIdx, 1);
    saveStore(store);
    return true;
}

// -------- PAYMENTS --------

export async function getPayments(): Promise<Payment[]> {
    await ensureInitialized();
    return getStore().payments;
}

export async function getPaymentsBySession(sessionId: string): Promise<Payment[]> {
    const pays = await getPayments();
    return pays.filter((p) => p.sessionId === sessionId);
}

export async function togglePayment(sessionId: string, memberId: string): Promise<Payment> {
    const store = getStore();
    let pay = store.payments.find((p) => p.sessionId === sessionId && p.memberId === memberId);
    if (!pay) {
        pay = { sessionId, memberId, paid: true, paidAt: new Date().toISOString() };
        store.payments.push(pay);
    } else {
        pay.paid = !pay.paid;
        pay.paidAt = pay.paid ? new Date().toISOString() : "";
    }
    saveStore(store);
    return pay;
}

// -------- RESULTS --------

export async function getResults(): Promise<Result[]> {
    await ensureInitialized();
    return getStore().results;
}

export async function getResultsBySession(sessionId: string): Promise<Result[]> {
    const results = await getResults();
    return results.filter((r) => r.sessionId === sessionId);
}

export async function addResult(data: Omit<Result, "id">): Promise<Result> {
    const store = getStore();
    const result: Result = { id: genResultId(store.results), ...data };
    store.results.push(result);
    saveStore(store);
    return result;
}

export async function deleteResult(id: string): Promise<boolean> {
    const store = getStore();
    const idx = store.results.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    store.results.splice(idx, 1);
    saveStore(store);
    return true;
}

// -------- COMBINED --------

export async function getSessionWithDetails(sessionId: string) {
    const [session, registrations, payments, results, members] = await Promise.all([
        getSessionById(sessionId),
        getRegistrationsBySession(sessionId),
        getPaymentsBySession(sessionId),
        getResultsBySession(sessionId),
        getMembers(),
    ]);
    if (!session) return null;
    const registeredMembers = members.filter((m) =>
        registrations.some((r) => r.memberId === m.id)
    );
    const paidMembers = registeredMembers.filter((m) =>
        payments.some((p) => p.memberId === m.id && p.paid)
    );
    const unpaidMembers = registeredMembers.filter(
        (m) => !payments.some((p) => p.memberId === m.id && p.paid)
    );
    const paidCount = paidMembers.length;
    const unpaidCount = unpaidMembers.length;
    return {
        ...session,
        registrations,
        payments,
        results,
        registeredMembers,
        paidMembers,
        unpaidMembers,
        registrationCount: registrations.length,
        paidCount,
        unpaidCount,
        totalCollection: paidCount * session.fee,
    };
}

// -------- UTILS --------

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function formatDateTime(dateStr: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}