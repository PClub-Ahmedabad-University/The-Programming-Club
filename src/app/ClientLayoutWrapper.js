"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import Notice from "./Components/Notice";
import { ScrollProgress } from "@/ui-components/ScrollProgress";
import { Toaster, toast } from "react-hot-toast";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname === '/WMC';

  // Set up toast styles on mount
  useEffect(() => {
    // This ensures toast styles respect the dark theme
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --toast-bg: rgba(12, 18, 36, 0.9);
        --toast-text: #ffffff;
        --toast-border: rgba(255, 255, 255, 0.1);
      }
      
      .toast {
        background: var(--toast-bg) !important;
        color: var(--toast-text) !important;
        border: 1px solid var(--toast-border) !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .toast-success {
        border-left: 4px solid #10B981 !important;
      }
      
      .toast-error {
        border-left: 4px solid #EF4444 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'toast',
          duration: 4000,
          style: {
            background: 'rgba(12, 18, 36, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
            fontSize: '14px',
            maxWidth: '100%',
            width: 'auto',
            minWidth: '300px',
          },
          success: {
            className: 'toast-success',
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            className: 'toast-error',
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
            duration: 5000,
          },
          loading: {
            className: 'toast-loading',
            iconTheme: {
              primary: '#3B82F6',
              secondary: 'white',
            },
          },
        }}
      />
      {!hideLayout && <Notice />}
      {!hideLayout && <Navbar />}
      <ScrollProgress />
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}