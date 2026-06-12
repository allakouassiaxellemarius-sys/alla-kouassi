import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Compete.gg
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            La plateforme ultime pour organiser et participer à des compétitions eSport.
            Créez des tournois, formez des équipes, et dominez le classement !
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition"
            >
              Commencer
            </Link>
            <Link
              to="/tournaments"
              className="border border-gray-700 hover:border-purple-500 text-gray-300 px-8 py-3 rounded-lg text-lg font-semibold transition"
            >
              Voir les tournois
            </Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Tournois</h3>
            <p className="text-gray-400">
              Créez et gérez des tournois avec bracketing automatique, rounds et élimination directe.
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Équipes</h3>
            <p className="text-gray-400">
              Formez votre équipe, invitez des membres et participez ensemble aux compétitions.
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Classement</h3>
            <p className="text-gray-400">
              Suivez les scores en direct et grimpez dans le classement général.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
