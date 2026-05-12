export interface Member {
    id: string;
    name: string;
    phone: string;
    email: string;
    joinDate: string;
    avatar: string;
}

export interface Session {
    id: string;
    date: string;
    time: string;
    location: string;
    title: string;
    description: string;
    maxParticipants: number;
    fee: number;
    status: "upcoming" | "completed";
    createdAt: string;
}

export interface Registration {
    sessionId: string;
    memberId: string;
    registeredAt: string;
}

export interface Payment {
    sessionId: string;
    memberId: string;
    paid: boolean;
    paidAt: string;
}

export interface Result {
    id: string;
    sessionId: string;
    type: "single" | "double";
    player1?: string;
    player2?: string;
    team1?: string[];
    team2?: string[];
    score1: number;
    score2: number;
    winner: string;
    notes: string;
}

export interface EventLog {
    id: string;
    sessionId: string;
    type: "info" | "result" | "payment";
    message: string;
    createdAt: string;
}

export interface SessionWithDetails extends Session {
    registrations: Registration[];
    payments: Payment[];
    results: Result[];
    registeredMembers: Member[];
    paidMembers: Member[];
    unpaidMembers: Member[];
    registrationCount: number;
    paidCount: number;
    unpaidCount: number;
    totalCollection: number;
}