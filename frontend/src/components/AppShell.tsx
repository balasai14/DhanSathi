"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/Sidebar";
import { Menu, Wallet } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [user, loading, router]);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "var(--indigo)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Overlay — shown when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 45,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* Sidebar drawer — slides in from left on all screen sizes */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: "var(--sidebar-w)",
        zIndex: 50,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 280ms var(--ease)",
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Top bar — always visible */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: "68px",
        background: "rgba(13,17,23,0.95)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 40,
        flexShrink: 0,
      }}>
        <button
          className="btn-ghost"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ padding: 8 }}
        >
          <Menu size={22} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wallet size={20} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 24 }} className="gradient-text">DhanSathi</span>
        </div>

        {/* Spacer to keep title centered */}
        <div style={{ width: 36 }} />
      </header>

      {/* Page content */}
      <main style={{ flex: 1, padding: "28px 32px", maxWidth: 1280, width: "100%", margin: "0 auto" }}
        className="page-wrapper-main">
        {children}
      </main>

      <style>{`
        @media (max-width: 640px) {
          .page-wrapper-main { padding: 16px 14px !important; }
        }
      `}</style>
    </div>
  );
}
