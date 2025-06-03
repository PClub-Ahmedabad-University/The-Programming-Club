import Hero from "./Components/Hero";
import ClubHighlights from "./Components/ClubHighlights";
import OurEvents from "./Components/OurEvents";

export default function Home() {
  return (
    <div className="app w-screen relative">
      <Hero/>
      <ClubHighlights/>
      <OurEvents/>
    </div>
  );
}
