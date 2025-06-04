import Hero from "./Components/Hero";
import ClubHighlights from "./Components/ClubHighlights";
import OurEvents from "./Components/OurEvents";
import UpcomingEventBox from "./Components/UpcomingEventBox";
import ContactUs from "./Components/ContactUs";

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