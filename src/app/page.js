import Image from "next/image";
import Navbar from "./Components/Navbar";
import Hero from "./Components/Hero";

export default function Home() {
  return (
    <div className="app h-screen w-screen relative">
      <Navbar/>
      <Hero/>
    </div>
  );
}
