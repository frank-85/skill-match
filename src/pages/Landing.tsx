import { Link } from "react-router-dom";
import { LandingHero } from "../components/landing/LandingHero";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-navy-deep text-bg px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl">Skill-Match</h1>
          <Link to="/about" className="text-gold-soft hover:text-gold text-sm">
            About →
          </Link>
        </div>
      </header>
      <LandingHero />
    </div>
  );
}
