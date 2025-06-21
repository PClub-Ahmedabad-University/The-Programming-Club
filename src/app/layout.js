import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import Notice from "./Components/Notice";
import { ScrollProgress } from "@/ui-components/ScrollProgress";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import PageTransition from "@/ui-components/PageTransition";
import Script from "next/script";
import {AnalyticsProvider} from "@/app/providers.js";
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
 <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-HV84PVFRBD`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HV84PVFRBD', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <Script
          async
          defer
          data-website-id="b33365bd-4d56-4118-8aaf-400a9e14757a"
          src="https://cloud.umami.is/script.js"
          strategy="afterInteractive"
        />     
      </head>
      <body className={`${inter.variable} antialiased !scroll-smooth `}>
        <ClientLayoutWrapper>
          <AnalyticsProvider />
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}