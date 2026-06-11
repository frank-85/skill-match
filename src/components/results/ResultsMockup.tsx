const MOCKUP_ITEMS = [
  { role: "Formatore AI per aziende", company: "Freelance · P.IVA", score: 87, why: "Hai 4/4 competenze chiave", gap: "Sviluppa prospecting B2B (+2)" },
  { role: "AI Consultant per PMI", company: "Freelance · P.IVA", score: 74, why: "Hai 3/4 competenze chiave", gap: "Sviluppa vendita campo (+1)" },
  { role: "Project Manager Digital", company: "H-FARM", score: 58, why: "Hai 2/4 competenze chiave", gap: "Project management (+2)" },
];

export function ResultsMockup() {
  return (
    <div className="bg-white rounded-xl border-2 border-navy-medium/10 p-5 shadow-lg">
      <p className="text-xs uppercase tracking-wider text-navy-medium mb-3">🎯 Esempio risultato</p>
      <div className="space-y-3">
        {MOCKUP_ITEMS.map((m) => (
          <div key={m.role} className="border border-navy-medium/10 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-navy-deep text-sm">{m.role}</h4>
                <p className="text-xs text-navy-medium">{m.company}</p>
              </div>
              <span className="text-2xl font-bold text-gold">{m.score}%</span>
            </div>
            <p className="text-xs text-navy-deep mt-1">✓ {m.why}</p>
            <p className="text-xs text-warn">→ {m.gap}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
