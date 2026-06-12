import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = id || "me";
    api.users
      .get(userId)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-16 text-gray-400">Chargement...</div>;
  if (!profile) return <div className="text-center py-16 text-gray-400">Utilisateur non trouvé</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-purple-700 flex items-center justify-center text-3xl font-bold">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            <p className="text-gray-400">{profile.teams?.length || 0} équipes</p>
          </div>
        </div>
      </div>

      {profile.teams && profile.teams.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">Équipes</h2>
          <div className="space-y-3">
            {profile.teams.map((tm: any) => (
              <div
                key={tm.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4"
              >
                <div className="font-medium">{tm.team.name}</div>
                <div className="text-sm text-gray-500">[{tm.team.tag}]</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
