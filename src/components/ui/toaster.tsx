"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      dir="rtl"
      toastOptions={{
        style: {
          background: "#1A1A1A",
          border: "1px solid rgba(255,255,255,0.05)",
          color: "#fff",
          fontSize: "14px",
        },
        className: "font-hebrew",
      }}
      theme="dark"
    />
  );
}
