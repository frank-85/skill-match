import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-navy-deep text-bg px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">Skill-Match</Link>
          <Link to="/wizard" className="text-gold-soft hover:text-gold text-sm">
            Inizia il bilancio →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-navy-deep">Cos'è Skill-Match</h1>

        <section>
          <h2 className="text-xl font-semibold text-navy-deep mt-6 mb-2">Cosa fa</h2>
          <p className="text-ink/80">
            Skill-Match è un bilancio competenze guidato che porta un candidato dal "non so cosa sono"
            al "ecco le 3 aziende a cui posso candidarmi" in 6 minuti. È il passo prima del colloquio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-deep mt-6 mb-2">Come funziona il matching</h2>
          <p className="text-ink/80">
            Algoritmo vettoriale trasparente: ogni ruolo richiede tag con livello 0-5, ogni risposta
            popola il profilo del candidato sui medesimi tag. Il match è calcolato come somma pesata
            delle competenze richieste (peso pieno) e dei nice-to-have (peso 0.3), con penalità
            progressive sui gap. Filtri hard su lingua, contratto, esperienza. Modificatori per
            seniority. Zero black box, zero API.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-deep mt-6 mb-2">Limiti dell'MVP</h2>
          <ul className="list-disc pl-5 text-ink/80 space-y-1">
            <li>Catalogo limitato a 12 ruoli (versione di test)</li>
            <li>Solo questionario testuale: niente upload CV/audio/certificati</li>
            <li>Nessun account: i risultati non sono salvati lato server</li>
            <li>Solo italiano</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-navy-deep mt-6 mb-2">Open source & dintorni</h2>
          <p className="text-ink/80">
            Sviluppato per il corso Vibe Coding Verona. Codice React + TypeScript, zero backend,
            deploy statico. Per allenare il colloquio dopo il match, link a Role-plAI.
          </p>
        </section>
      </main>
    </div>
  );
}
