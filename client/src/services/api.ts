const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erreur serveur");
  }
  return data;
}

export const api = {
  auth: {
    register: (data: { email: string; username: string; password: string }) =>
      request<{ user: import("../types").User; token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ user: import("../types").User; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<import("../types").User>("/auth/me"),
  },
  tournaments: {
    list: () => request<import("../types").Tournament[]>("/tournaments"),
    get: (id: string) => request<import("../types").Tournament>(`/tournaments/${id}`),
    create: (data: Partial<import("../types").Tournament>) =>
      request<import("../types").Tournament>("/tournaments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    register: (tournamentId: string, teamId: string) =>
      request<import("../types").TournamentTeam>(`/tournaments/${tournamentId}/register`, {
        method: "POST",
        body: JSON.stringify({ teamId }),
      }),
    generateBrackets: (tournamentId: string) =>
      request<{ message: string; matches: number }>(`/tournaments/${tournamentId}/generate-brackets`, {
        method: "POST",
      }),
    unregister: (tournamentId: string, teamId: string) =>
      request<{ message: string }>(`/tournaments/${tournamentId}/unregister`, {
        method: "POST",
        body: JSON.stringify({ teamId }),
      }),
    sendInstructions: (tournamentId: string, subject: string, message: string) =>
      request<{ message: string }>(`/tournaments/${tournamentId}/send-instructions`, {
        method: "POST",
        body: JSON.stringify({ subject, message }),
      }),
    close: (tournamentId: string) =>
      request<{ message: string }>(`/tournaments/${tournamentId}/close`, { method: "POST" }),
    delete: (id: string) =>
      request<{ message: string }>(`/tournaments/${id}`, { method: "DELETE" }),
  },
  teams: {
    list: () => request<import("../types").Team[]>("/teams"),
    get: (id: string) => request<import("../types").Team>(`/teams/${id}`),
    create: (data: { name: string; tag: string; description?: string }) =>
      request<import("../types").Team>("/teams", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    join: (teamId: string) =>
      request<import("../types").TeamMember>(`/teams/${teamId}/join`, { method: "POST" }),
  },
  matches: {
    updateScore: (matchId: string, score1: number, score2: number) =>
      request<import("../types").Match>(`/matches/${matchId}/score`, {
        method: "PATCH",
        body: JSON.stringify({ score1, score2 }),
      }),
    approveScore: (matchId: string) =>
      request<import("../types").Match>(`/matches/${matchId}/approve-score`, { method: "POST" }),
    forfeit: (matchId: string) =>
      request<import("../types").Match>(`/matches/${matchId}/forfeit`, { method: "POST" }),
    delay: (matchId: string, reason?: string) =>
      request<import("../types").Match>(`/matches/${matchId}/delay`, { method: "POST", body: JSON.stringify({ reason }) }),
    contactOrganizer: (matchId: string, message: string) =>
      request<{ message: string }>(`/matches/${matchId}/contact-organizer`, { method: "POST", body: JSON.stringify({ message }) }),
    remindScore: (matchId: string) =>
      request<{ message: string }>(`/matches/${matchId}/remind-score`, { method: "POST" }),
  },
  users: {
    leaderboard: () =>
      request<{ id: string; username: string; avatar?: string; tournamentsPlayed: number }[]>("/users/leaderboard"),
    get: (id: string) =>
      request<import("../types").User & { teams: import("../types").TeamMember[] }>(`/users/${id}`),
  },
  notifications: {
    list: () =>
      request<{ id: string; userId: string; type: string; title: string; message: string; link?: string; read: boolean; createdAt: string }[]>("/notifications"),
    unreadCount: () =>
      request<{ count: number }>("/notifications/unread-count"),
    markRead: (id: string) =>
      request<{ message: string }>(`/notifications/${id}/read`, { method: "PATCH" }),
    seed: () =>
      request<{ created: number }>("/notifications/seed", { method: "POST" }),
  },
  password: {
    forgot: (email: string) =>
      request<{ message: string }>("/password/forgot", { method: "POST", body: JSON.stringify({ email }) }),
    reset: (token: string, password: string) =>
      request<{ message: string }>("/password/reset", { method: "POST", body: JSON.stringify({ token, password }) }),
  },
  disputes: {
    create: (data: { matchId: string; tournamentId: string; reason: string; details?: string }) =>
      request<any>("/disputes", { method: "POST", body: JSON.stringify(data) }),
    list: (tournamentId?: string) =>
      request<any[]>(`/disputes${tournamentId ? `?tournamentId=${tournamentId}` : ""}`),
    resolve: (id: string, status: string, resolution?: string) =>
      request<any>(`/disputes/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status, resolution }),
      }),
  },
};
