export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  role: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo?: string;
  description?: string;
  members: TeamMember[];
  _count?: { members: number };
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  user: { id: string; username: string; avatar?: string };
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  game?: string;
  maxTeams: number;
  minTeams: number;
  prizePool?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  format: string;
  rules?: string;
  organizers: { user: { id: string; username: string } }[];
  teams?: TournamentTeam[];
  matches?: Match[];
  _count?: { teams: number; matches: number };
}

export interface TournamentTeam {
  id: string;
  teamId: string;
  tournamentId: string;
  seed?: number;
  status: string;
  team: Team;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchIndex: number;
  team1Id?: string;
  team2Id?: string;
  winnerId?: string;
  score1?: number;
  score2?: number;
  status: string;
  scheduledAt?: string;
  playedAt?: string;
}
