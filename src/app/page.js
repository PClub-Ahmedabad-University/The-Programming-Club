import Hero from "./Components/Hero";
import ClubHighlights from "./Components/ClubHighlights";

export default function Home() {
  return (
    <div className="app w-screen relative">
      <Hero/>
      <ClubHighlights/>
    </div>
  );
}
