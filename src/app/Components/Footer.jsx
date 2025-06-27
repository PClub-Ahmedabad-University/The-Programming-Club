import Image from "next/image";
import { Linkedin } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const developers=[
    {"name":"Deep Patel","linkedin":"https://www.linkedin.com/in/deeppateldw1611/"},
    {"name":"Drumil Bhati","linkedin":"https://www.linkedin.com/in/drumil-bhati/"},
    {"name":"Jay Shah","linkedin":"https://www.linkedin.com/in/jay-shah-dev/"},
    {"name":"Kushal Rathod","linkedin":"https://www.linkedin.com/in/kushal-rathod-90b800297/"},
    {"name":"Meet Gandhi","linkedin":"https://www.linkedin.com/in/meet-gandhi-ab6743308/"},
    {"name":"Subrat Jain","linkedin":"https://www.linkedin.com/in/subrat-jain-70078b267/"},
  ]
  return (
    <footer className="bg-pclubBg font-content text-white pt-16 pb-10 px-4 relative overflow-hidden w-full">
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

      <section className="bg-[#004457] backdrop-blur-md bg-opacity-70 rounded-xl shadow-2xl p-6 md:p-10 max-w-7xl w-full mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          {/* Newsletter */}
          <div className="flex-1 mb-8 lg:mb-0">
            <h3 className="font-heading text-xl md:text-2xl font-semibold whitespace-nowrap mb-4">
              Become Community Member
            </h3>
            <form className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 sm:w-64 px-4 py-3 rounded-md text-gray-800 outline-none bg-blue-50 focus:ring-2 focus:ring-teal-400"
              />
              <button className="bg-[#00252F] opacity-85 hover:opacity-100 transition-all px-6 py-3 rounded-md text-white font-semibold shadow-md hover:scale-105 duration-300">
                JOIN US
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="flex-1 mb-8 lg:mb-0">
            <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
            <nav>
              <div className="grid grid-cols-2 gap-2">
                {["Home", "Events", "Gallery", "Our Team", "Join Us", "Contact Us"].map((item, i) => (
                  <Link
                    key={i}
                    href={item === "Home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="hover:underline transition duration-200 text-base"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          {/* External Links */}
          <div className="flex-1 mb-8 lg:mb-0">
            <h4 className="font-heading text-lg font-semibold mb-4">More Links</h4>
            <nav>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href="https://us.umami.is/share/yHksizt9jHbjwH8t/the-programming-club.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline transition duration-200 text-base"
                  >
                    Analytics
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/PClub-Ahmedabad-University"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline transition duration-200 text-base"
                  >
                    GitHub
                  </a>
                </li>
                {/* Add more external links here if needed */}
              </ul>
            </nav>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col items-center lg:items-end">
            <div className="flex items-center gap-4 mb-2">
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
        </div>
      </section>
      <div className="border-t border-gray-600/30 pt-10 mb-4">
          <h4 className="text-2xl font-heading mb-3 text-center text-white">Designed and Developed by</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {developers.map((dev, i) => (
              <a
                key={i}
                href={dev.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#004457] hover:bg-[#003a47] transition-all border border-teal-500/20 hover:border-teal-400/40"
              >
                <div className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {dev.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="text-lg text-gray-300 hover:text-white transition-colors">
                  {dev.name}
                </span>
                <Linkedin className="w-4 h-4 text-teal-400" />
              </a>
            ))}
          </div>
        </div>
    </footer>
  );
};

export default Footer;