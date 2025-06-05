import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-pclubBg text-white pt-16 pb-10 px-4 relative overflow-hidden w-full">
      {/* Wave Top Divider */}
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

      {/* CTA Section */}
      <section className="bg-[#004457] backdrop-blur-md bg-opacity-70 rounded-xl shadow-2xl p-6 md:p-10 max-w-7xl w-full mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        <h3 className="text-xl md:text-2xl font-semibold whitespace-nowrap">
          Become Community Member
        </h3>
        <form className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 min-w-0 sm:w-96 px-4 py-3 rounded-md text-gray-800 outline-none bg-blue-50 focus:ring-2 focus:ring-teal-400"
          />
          <button className="bg-[#00252F] opacity-85 hover:opacity-100 transition-all px-6 py-3 rounded-md text-white font-semibold shadow-md hover:scale-105 duration-300">
            JOIN US
          </button>
        </form>
      </section>

      {/* Navigation Links */}
      <nav className="mt-20 mb-10 text-center flex flex-wrap justify-center gap-x-6 gap-y-4 text-sm md:text-base max-w-7xl mx-auto w-full z-10 relative">
        {["Home", "About Us", "Events", "Contact Us", "Admin Login"].map((item, i) => (
          <Link
            key={i}
            href={item === "Home" ? "/" : item === "Admin Login" ? "/admin/login" : `/${item.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:underline transition duration-200 text-base md:text-lg"
          >
            {item}
          </Link>
        ))}
      </nav>

      {/* Bottom Info */}
      <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-4">
          <Image
            src="/logo1.png"
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
