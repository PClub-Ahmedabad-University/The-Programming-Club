import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-pclubBg text-white pt-16 pb-10 px-4 md:px-8 lg:px-16 relative overflow-hidden w-full">

      <div className="absolute top-0 left-0 w-full z-0">
        <svg
          className="w-full h-24 md:h-32"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="#0C1224"
            d="M0,96L60,112C120,128,240,160,360,160C480,160,600,128,720,128C840,128,960,160,1080,176C1200,192,1320,192,1380,192L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          ></path>
        </svg>
      </div>


      <section className="bg-[#004457] backdrop-blur-md bg-opacity-70 rounded-xl shadow-2xl p-8 md:p-14 max-w-[95rem] w-[95%] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

        <h3 className="text-xl md:text-2xl font-semibold whitespace-nowrap">
          Become Community Member
        </h3>
        <form className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full md:w-96 px-5 py-4 rounded-md text-gray-800 outline-none bg-blue-50 focus:ring-2 focus:ring-teal-400"
          />
          <button className="bg-[#00252F] opacity-85 hover:opacity-100 transition-all px-6 py-4 rounded-md text-white font-semibold shadow-md hover:scale-105 duration-300">
            JOIN US
          </button>
        </form>
      </section>

      <nav className="mt-20 mb-10 text-center flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm md:text-base z-10 relative max-w-[95rem] mx-auto w-[95%]">
        {["Home", "About Us", "Past Events", "Contact Us"].map((item, i) => (
          <Link
            key={i}
            href={item === "Home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:underline transition duration-200 text-base md:text-lg"
          >
            {item}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative z-10 max-w-[95rem] mx-auto w-[95%]">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="PClub Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <div>
            <p className="text-lg font-semibold">The Programming Club</p>
            <p className="text-sm text-gray-400">Powered by PClub, Ahmedabad University</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          &copy; 2025 All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
