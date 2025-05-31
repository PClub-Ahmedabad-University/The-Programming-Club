import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/Components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "The Programming Club | Ahmedabad University",
  description: "Official website of The Programming Club at Ahmedabad University. Explore events, join our tech community, and stay updated with all the latest happenings.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}