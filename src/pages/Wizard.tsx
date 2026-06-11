import { useNavigate } from "react-router-dom";
import { useWizard } from "../hooks/useWizard";
import { WizardShell } from "../components/wizard/WizardShell";
import { QuestionIntroText } from "../components/wizard/QuestionIntroText";
import { QuestionSingleChoice } from "../components/wizard/QuestionSingleChoice";
import { QuestionMultiChoice } from "../components/wizard/QuestionMultiChoice";
import { QuestionSlider } from "../components/wizard/QuestionSlider";
import { QuestionTagScale } from "../components/wizard/QuestionTagScale";
import type { SkillLevel } from "../engine/types";

export default function WizardPage() {
  const navigate = useNavigate();
  const wiz = useWizard();

  if (!wiz.currentQuestion) {
    return <div className="p-10 text-center">Caricamento...</div>;
  }

  const q = wiz.currentQuestion;

  // Validazione minima per "canProceed"
  const profileAsRecord = wiz.profile as unknown as Record<string, unknown>;
  let canProceed = true;
  if (q.type === "single_choice") {
    const v = profileAsRecord[q.writes_to];
    canProceed = typeof v === "string" && v.length > 0;
  } else if (q.type === "multi_choice" && q.writes_to === "selected_areas") {
    canProceed = wiz.profile.selected_areas.length > 0;
  }

  const handleSubmit = () => {
    navigate("/results");
  };

  return (
    <WizardShell
      currentIndex={wiz.currentIndex}
      totalQuestions={wiz.totalQuestions}
      isFirst={wiz.isFirst}
      isLast={wiz.isLast}
      onPrev={wiz.prev}
      onNext={wiz.next}
      onSubmit={handleSubmit}
      canProceed={canProceed}
    >
      {q.type === "intro_text" && <QuestionIntroText question={q} />}

      {q.type === "single_choice" && (
        <QuestionSingleChoice
          question={q}
          value={(profileAsRecord[q.writes_to] as string) ?? null}
          onChange={(v) => wiz.writeSingleChoice(q.writes_to, v)}
        />
      )}

      {q.type === "multi_choice" && (
        <QuestionMultiChoice
          question={q}
          values={
            q.writes_to === "selected_areas"
              ? wiz.profile.selected_areas
              : q.writes_to === "certifications"
              ? wiz.profile.certifications
              : []
          }
          onChange={(values) => wiz.writeMultiChoice(q.writes_to, values)}
        />
      )}

      {q.type === "slider" && (
        <QuestionSlider
          question={q}
          value={wiz.profile.experience_years}
          onChange={(v) => wiz.writeSlider(q.writes_to, v)}
        />
      )}

      {q.type === "tag_scale" && (
        <QuestionTagScale
          question={q}
          values={wiz.profile.tags}
          onChange={(tag, lvl) => wiz.writeTagScale(tag, lvl as SkillLevel)}
        />
      )}
    </WizardShell>
  );
}
