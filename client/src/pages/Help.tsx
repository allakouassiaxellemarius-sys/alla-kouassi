import { Link } from "react-router-dom";

const faqs = [
  {
    q: "Comment créer un tournoi ?",
    a: "Rendez-vous dans votre Espace organisateur et cliquez sur 'Créer un tournoi'. Remplissez les informations (nom, jeu, format, date) et validez.",
  },
  {
    q: "Comment inscrire mon équipe à un tournoi ?",
    a: "Ouvrez la page du tournoi, cliquez sur 'S'inscrire' et sélectionnez votre équipe. Vérifiez que votre équipe a au moins 1 membre.",
  },
  {
    q: "Comment signaler un score ?",
    a: "Dans le détail du tournoi, trouvez votre match et cliquez sur 'Signaler le score'. Entrez les scores des deux équipes.",
  },
  {
    q: "Que faire en cas de match nul ?",
    a: "Les matchs peuvent utiliser les prolongations et tirs au but selon les règles du tournoi. Utilisez l'option 'Signalement spécial' si nécessaire.",
  },
  {
    q: "Comment déclarer forfait ?",
    a: "Dans le détail du match, cliquez sur 'Déclarer forfait'. Votre équipe perdra le match par défaut.",
  },
  {
    q: "Comment contester un résultat ?",
    a: "Utilisez le bouton 'Contester' sur le match concerné. Un organisateur examinera votre litige.",
  },
  {
    q: "Comment sont générés les brackets ?",
    a: "Les brackets sont générés automatiquement une fois le nombre d'équipes requis atteint. Le système crée un arbre à élimination directe.",
  },
  {
    q: "Puis-je modifier mon équipe après inscription ?",
    a: "Vous pouvez ajouter ou retirer des membres depuis la page de votre équipe. L'inscription au tournoi reste valide.",
  },
  {
    q: "Le thème eFootball est-il disponible ?",
    a: "Oui ! Les tournois avec le jeu 'eFootball' bénéficient d'un thème spécial avec le logo officiel, les modes de jeu et un bouton de lancement rapide.",
  },
  {
    q: "Comment contacter le support ?",
    a: "Envoyez un email à support@compete.gg ou utilisez le canal Discord. Nous répondons sous 24h.",
  },
];

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Centre d'Aide</h1>
      <p className="text-gray-400 mb-8">Trouvez des réponses à vos questions sur la plateforme</p>
      <div className="grid gap-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
            <summary className="px-5 py-4 cursor-pointer text-sm font-medium hover:text-purple-400 transition flex items-center justify-between">
              <span>{faq.q}</span>
              <svg className="w-4 h-4 text-gray-600 group-open:rotate-180 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
      <div className="mt-8 p-5 bg-gray-900/60 border border-purple-900/30 rounded-xl">
        <h2 className="font-semibold mb-1">Besoin d'aide supplémentaire ?</h2>
        <p className="text-sm text-gray-400 mb-3">Notre équipe de support est là pour vous aider.</p>
        <a href="mailto:support@compete.gg" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          support@compete.gg
        </a>
      </div>
    </div>
  );
}
