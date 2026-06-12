import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function RegistrationWizard({
  tournament,
  user,
  onRegister,
  onUnregister,
  userTeamInTournament,
}: {
  tournament: any;
  user: any;
  onRegister: (teamId: string) => void;
  onUnregister: (teamId: string) => void;
  userTeamInTournament: any;
}) {
  const isOrganizer = user && tournament.organizers?.some((o: any) => o.user?.id === user.id || o.userId === user.id);
  const [step, setStep] = useState<"choose" | "confirm" | "done">("choose");
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && step === "choose") {
      api.users.get(user.id).then((u: any) => {
        setUserTeams(u.teams || []);
      }).catch(() => {});
    }
  }, [user, step]);

  if (!user) {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">Connectez-vous pour rejoindre ce tournoi</p>
          <Link
            to="/login"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-lg transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (isOrganizer) {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-purple-900/40 border border-purple-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <p className="text-purple-400 font-medium text-sm">Vous êtes organisateur</p>
          <p className="text-gray-500 text-xs mt-1">Les organisateurs ne peuvent pas participer à leur propre tournoi</p>
        </div>
      </div>
    );
  }

  if (userTeamInTournament) {
    return (
      <div className="bg-gradient-to-r from-green-900/30 to-gray-800 border border-green-800/40 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-green-900/50 border border-green-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-green-400">Inscrit !</div>
            <div className="text-xs text-gray-400">{userTeamInTournament.team.name}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/teams/${userTeamInTournament.teamId}`}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition"
          >
            Voir mon équipe
          </Link>
          {tournament.status === "upcoming" && (
            <button
              onClick={() => onUnregister(userTeamInTournament.teamId)}
              className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg transition border border-red-800/40"
            >
              Se désinscrire
            </button>
          )}
        </div>
        <div className="mt-3 bg-gray-800/50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Statut de l'inscription</div>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Confirmée
          </div>
          {(tournament.teams || []).findIndex((tt: any) => tt.teamId === userTeamInTournament.teamId) >= 0 && (
            <div className="text-[10px] text-gray-600 mt-1">
              Position #{((tournament.teams || []).findIndex((tt: any) => tt.teamId === userTeamInTournament.teamId) + 1)} sur {tournament.teams?.length || 0} équipes
            </div>
          )}
        </div>
      </div>
    );
  }

  if (tournament.status !== "upcoming") {
    return (
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 text-center">
        <p className="text-gray-500 text-sm">Inscriptions fermées</p>
      </div>
    );
  }

  const teamsCount = tournament.teams?.length || 0;
  if (teamsCount >= tournament.maxTeams) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-5 text-center">
        <p className="text-yellow-400 text-sm font-medium">Complet</p>
        <p className="text-gray-500 text-xs mt-1">Toutes les places sont prises</p>
      </div>
    );
  }

  const handleSelect = (team: any) => {
    setSelectedTeam(team);
    setStep("confirm");
    setError("");
  };

  const handleConfirm = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    setError("");
    try {
      await onRegister(selectedTeam.team.id);
      setStep("done");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-purple-500 rounded-full inline-block" />
        Inscription
      </h3>

      <div className="flex items-center gap-2 mb-5">
        {[{ n: 1, l: "Choisir" }, { n: 2, l: "Confirmer" }, { n: 3, l: "Finalisé" }].map((s) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-1 ${
              step === "choose" && s.n === 1 ? "text-purple-400" :
              step === "confirm" && s.n <= 2 || step === "done" ? "text-green-400" :
              "text-gray-600"
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                step === "done" && s.n <= 2 || (step === "confirm" && s.n === 1)
                  ? "bg-green-900/40 border-green-700"
                  : step === "choose" && s.n === 1
                  ? "bg-purple-900/40 border-purple-700"
                  : step === "confirm" && s.n === 2
                  ? "bg-purple-900/40 border-purple-700 animate-pulse"
                  : "bg-gray-800 border-gray-700"
              }`}>
                {step === "done" && s.n <= 2 ? "✓" : s.n}
              </div>
              <span className="text-[10px] hidden sm:inline">{s.l}</span>
            </div>
            {s.n < 3 && <div className={`h-px flex-1 ${
              step === "done" && s.n === 1 ? "bg-green-700/50" : "bg-gray-800"
            }`} />}
          </div>
        ))}
      </div>

      {step === "choose" && (
        <div>
          {userTeams.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-4">Vous n'avez pas encore d'équipe</p>
              <Link
                to="/teams/create"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
              >
                Créer une équipe
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {userTeams.map((ut: any) => {
                const alreadyIn = (tournament.teams || []).some((tt: any) => tt.teamId === ut.team.id);
                return (
                  <button
                    key={ut.id}
                    disabled={alreadyIn}
                    onClick={() => handleSelect(ut)}
                    className={`w-full text-left flex items-center justify-between p-3 rounded-lg border transition ${
                      alreadyIn
                        ? "bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed"
                        : "bg-gray-800/50 border-gray-800 hover:border-purple-700 hover:bg-gray-800 cursor-pointer"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{ut.team.name}</div>
                      <div className="text-[10px] text-gray-500">[{ut.team.tag}] · {ut.team.members?.length || 0} membres</div>
                    </div>
                    {alreadyIn ? (
                      <span className="text-xs text-gray-600 shrink-0">Déjà inscrite</span>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-purple-400 shrink-0">
                        <span>Sélectionner</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <Link
            to="/teams/create"
            className="mt-3 block text-center text-xs text-gray-500 hover:text-purple-400 transition py-2"
          >
            + Créer une nouvelle équipe
          </Link>
        </div>
      )}

      {step === "confirm" && selectedTeam && (
        <div>
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4 border border-gray-700">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Récapitulatif</div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Équipe</span>
              <span className="text-sm font-bold text-gray-200">{selectedTeam.team.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Tag</span>
              <span className="text-sm text-gray-400">[{selectedTeam.team.tag}]</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Membres</span>
              <span className="text-sm text-gray-400">{selectedTeam.team.members?.length || 1}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Tournoi</span>
              <span className="text-sm text-gray-400">{tournament.name}</span>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setStep("choose"); setSelectedTeam(null); setError(""); }}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm transition"
            >
              Modifier
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-[2] bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-2 rounded-lg text-sm font-semibold transition"
            >
              {loading ? "Inscription..." : "Confirmer l'inscription"}
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-400 font-bold mb-1">Inscription réussie !</p>
          <p className="text-gray-500 text-xs">Vous êtes maintenant inscrit au tournoi avec {selectedTeam?.team.name}</p>
        </div>
      )}
    </div>
  );
}
