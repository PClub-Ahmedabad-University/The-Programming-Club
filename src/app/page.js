import Hero from "./Components/Hero.jsx";
import ClubHighlights from "./Components/ClubHighlights.jsx";
import OurEvents from "./Components/OurEvents.jsx";
import UpcomingEventBox from "./Components/UpcomingEventBox.jsx";
import ContactUs from "./Components/ContactUs.jsx";


export default function Home() {
  return (
    <div className="app w-screen relative">

      <Hero/>
      <ClubHighlights/>
      <OurEvents/>
      <UpcomingEventBox/>
      <ContactUs/>
  </div>
  );
}