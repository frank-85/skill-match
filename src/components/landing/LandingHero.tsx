import { Link } from "react-router-dom";
import { ResultsMockup } from "../results/ResultsMockup";
import { Button } from "../ui/Button";

export function LandingHero() {
  return (
    <section className="px-6 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy-deep leading-tight">
            Scopri per quali aziende sei <span className="text-gold">davvero</span> in linea
          </h2>
          <p className="text-xl text-ink/70 mt-4">
            Bilancio competenze in 6 minuti. 12 aziende italiane reali. Zero account, zero costi.
          </p>
          <ul className="mt-6 space-y-1 text-ink/80 text-sm">
            <li>✓ 70 competenze mappate su 7 macro-aree</li>
            <li>✓ Mix dipendenti e P.IVA / freelance</li>
            <li>✓ Allenati al colloquio dopo il match</li>
          </ul>
          <div className="mt-8">
            <Link to="/wizard">
              <Button variant="primary" className="text-lg">
                Inizia il bilancio →
              </Button>
            </Link>
          </div>
          <p className="text-xs text-ink/50 mt-6">Sviluppato per Ready Player One Verona</p>
        </div>

        <div>
          <ResultsMockup />
        </div>
      </div>
    </section>
  );
}
