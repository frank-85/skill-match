import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing";
import WizardPage from "./pages/Wizard";
import ResultsPage from "./pages/Results";
import AboutPage from "./pages/About";
import CoachPage from "./pages/Coach";
import CoachScorecardPage from "./pages/CoachScorecard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/wizard" element={<WizardPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/coach/:jobId" element={<CoachPage />} />
      <Route path="/coach/:jobId/scorecard" element={<CoachScorecardPage />} />
    </Routes>
  );
}
