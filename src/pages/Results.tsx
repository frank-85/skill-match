import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../hooks/useWizard";
import { useMatch } from "../hooks/useMatch";
import { JobMatchCard } from "../components/results/JobMatchCard";
import { ProfileSummary } from "../components/results/ProfileSummary";
import { JobDetailDrawer } from "../components/results/JobDetailDrawer";
import { Button } from "../components/ui/Button";
import type { JobMatch } from "../engine/types";

export default function ResultsPage() {
  const navigate = useNavigate();
  const { profile, reset } = useWizard();
  const { results, tagLabels } = useMatch(profile, 3);
  const [openMatch, setOpenMatch] = useState<JobMatch | null>(null);

  const handleTrainWithRoleplay = (match: JobMatch) => {
    navigate(`/coach/${match.job.id}`);
  };

  const handleReset = () => {
    reset();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-navy-deep text-bg px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-bold text-xl">Skill-Match — Il tuo match</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <ProfileSummary profile={profile} />

        {results.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-navy-medium/10">
            <p className="text-navy-deep font-semibold mb-2">Nessun ruolo compatibile trovato.</p>
            <p className="text-ink/70">Prova ad ampliare i criteri (disponibilità, lingua) o ricomincia il bilancio.</p>
          </div>
        ) : (
          <section>
            <h2 className="text-2xl font-bold text-navy-deep mb-4">Top 3 ruoli per te</h2>
            <div className="space-y-4">
              {results.map((m) => (
                <JobMatchCard
                  key={m.job.id}
                  match={m}
                  onOpenDetail={() => setOpenMatch(m)}
                  onTrainWithRoleplay={() => handleTrainWithRoleplay(m)}
                />
              ))}
            </div>
          </section>
        )}

        <div className="flex gap-3 justify-center pt-4">
          <Button variant="ghost" onClick={handleReset}>Ricomincia il bilancio</Button>
        </div>
      </main>

      {openMatch && (
        <JobDetailDrawer
          match={openMatch}
          tagLabels={tagLabels}
          onClose={() => setOpenMatch(null)}
          onTrainWithRoleplay={() => handleTrainWithRoleplay(openMatch)}
        />
      )}
    </div>
  );
}
