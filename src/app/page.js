import Image from "next/image";
import Navbar from "./Components/Navbar";
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
