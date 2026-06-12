export default function GuideSteps({ tournament, user, userTeamInTournament, matches }: {
  tournament: any;
  user: any;
  userTeamInTournament: any;
  matches: any[];
}) {
  const steps = [
    {
      num: 1,
      title: "Créez ou rejoignez une équipe",
      desc: "Vous devez faire partie d'une équipe pour participer. Créez la vôtre ou rejoignez une équipe existante.",
      done: userTeamInTournament !== null,
      link: "/teams/create",
      linkLabel: "Créer une équipe",
    },
    {
      num: 2,
      title: "Inscrivez-vous au tournoi",
      desc: "Une fois votre équipe prête, inscrivez-vous avec le bouton ci-contre. Les places sont limitées.",
      done: userTeamInTournament !== null,
      link: null,
      linkLabel: null,
    },
    {
      num: 3,
      title: "Attendez le début du tournoi",
      desc: "L'organisateur générera les brackets et le tournoi commencera. Vous serez notifié.",
      done: tournament.status !== "upcoming",
      link: null,
      linkLabel: null,
    },
    {
      num: 4,
      title: "Jouez vos matchs",
      desc: "Quand votre match est programmé, lancez eFootball, jouez et rapportez votre score.",
      done: matches.some((m: any) => m.status === "completed" || m.status === "ongoing"),
      link: null,
      linkLabel: null,
    },
    {
      num: 5,
      title: "Suivez le classement",
      desc: "Consultez les résultats, les statistiques et votre prochain adversaire en temps réel.",
      done: tournament.status === "completed",
      link: null,
      linkLabel: null,
    },
  ];

  if (!user) return null;

  const currentStepIdx = steps.findIndex((s) => !s.done);
  const currentStep = currentStepIdx === -1 ? steps.length : currentStepIdx;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-purple-500 rounded-full inline-block" />
        Guide étape par étape
      </h3>
      <div className="space-y-3">
        {steps.map((s, i) => {
          const isActive = i === currentStep && !s.done;
          const isPast = s.done;
          return (
            <div key={s.num} className={`flex gap-3 p-3 rounded-lg transition ${
              isActive ? "bg-purple-900/20 border border-purple-800/30" : "bg-transparent"
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
                isPast
                  ? "bg-green-900/40 border-green-700 text-green-400"
                  : isActive
                  ? "bg-purple-900/40 border-purple-700 text-purple-400 animate-pulse"
                  : "bg-gray-800 border-gray-700 text-gray-500"
              }`}>
                {isPast ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${isPast ? "text-gray-500" : isActive ? "text-white" : "text-gray-400"}`}>
                  {s.title}
                </div>
                <div className={`text-xs mt-0.5 ${isPast ? "text-gray-600" : "text-gray-500"}`}>
                  {s.desc}
                </div>
                {isActive && s.link && (
                  <a
                    href={s.link}
                    className="inline-block mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    {s.linkLabel}
                  </a>
                )}
              </div>
              {isPast && (
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
