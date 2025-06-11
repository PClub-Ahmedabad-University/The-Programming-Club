"use client";
import React from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import Notice from "./Components/Notice";
import { ScrollProgress } from "@/ui-components/ScrollProgress";


export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname === '/WMC';

  return (
    <>
      {hideLayout && <Notice />}
      {!hideLayout && <Navbar />}
       <ScrollProgress />
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}