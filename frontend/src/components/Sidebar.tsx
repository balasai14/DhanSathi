"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth as authApi } from "@/lib/api";
import {
  LayoutDashboard, DollarSign, Receipt, PieChart,
  Landmark, TrendingUp, MessageSquare, LogOut, Wallet,
  Shield, Target, Umbrella, PiggyBank, FileText, BarChart2,
  KeyRound, Eye, EyeOff, X,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: DollarSign },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/budget", label: "Budget", icon: BarChart2 },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/loans", label: "Loans", icon: Landmark },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/emergency-fund", label: "Emergency Fund", icon: Shield },
  { href: "/insurance", label: "Insurance", icon: Umbrella },
  { href: "/retirement", label: "Retirement", icon: PiggyBank },
  { href: "/tax", label: "Tax Planning", icon: FileText },
  { href: "/simulation", label: "Simulate", icon: TrendingUp },
  { href: "/ai-chat", label: "AI Advisor", icon: MessageSquare },
];

// Defined at module scope — no remount on parent re-render
function PwField({ label, value, onChange, show, onToggle }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} className="input" style={{ paddingRight: 44 }}
          placeholder="••••••••" value={value} onChange={(e) => onChange(e.target.value)} required minLength={6} />
        <button type="button" onClick={onToggle}
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (newPw !== confirmPw) { setError("New passwords do not match."); return; }
    if (newPw.length < 6) { setError("New password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await authApi.changePassword(oldPw, newPw);
      setSuccess("Password changed successfully.");
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 28, width: "100%", maxWidth: 400, margin: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <KeyRound size={18} style={{ color: "var(--indigo-light)" }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Change Password</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "var(--r-md)", marginBottom: 16, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--red)", fontSize: 13 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "10px 14px", borderRadius: "var(--r-md)", marginBottom: 16, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 13 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PwField label="Current Password" value={oldPw} onChange={setOldPw} show={showOld} onToggle={() => setShowOld(!showOld)} />
          <PwField label="New Password" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(!showNew)} />
          <PwField label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1, padding: "10px" }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "10px" }} disabled={loading}>
              {loading ? <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

interface SidebarProps { onClose?: () => void; }

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showChangePw, setShowChangePw] = useState(false);

  const initials = user?.full_name
    ?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <aside className="sidebar">
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}

      {/* Logo */}
      <div style={{ padding: "20px 20px 16px" }}>
        <Link href="/dashboard" onClick={onClose}
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--grad-primary)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.35)", flexShrink: 0 }}>
            <Wallet size={18} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }} className="gradient-text">DhanSathi</span>
        </Link>
      </div>

      <div className="divider" style={{ margin: "0 16px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 10px 6px" }}>
          Navigation
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} onClick={onClose}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--r-md)", marginBottom: 2, textDecoration: "none", color: active ? "var(--indigo-light)" : "var(--text-secondary)", background: active ? "rgba(99,102,241,0.12)" : "transparent", borderLeft: active ? "2px solid var(--indigo)" : "2px solid transparent", fontWeight: active ? 600 : 500, fontSize: 13, transition: "all 200ms var(--ease)" }}
              onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "var(--text-primary)"; } }}
              onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; } }}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="divider" style={{ margin: "0 16px" }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--grad-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.full_name}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </p>
          </div>
          <button onClick={() => setShowChangePw(true)} title="Change Password" className="btn-ghost" style={{ flexShrink: 0, padding: 6 }}>
            <KeyRound size={15} />
          </button>
          <button onClick={logout} title="Logout" className="btn-danger-ghost" style={{ flexShrink: 0 }}>
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
