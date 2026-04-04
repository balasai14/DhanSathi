"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function OAuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const code = params.get("code");
    if (!code) { router.replace("/auth"); return; }

    fetch(`${API_BASE}/auth/google/callback?code=${encodeURIComponent(code)}`)
      .then((r) => {
        if (!r.ok) throw new Error("OAuth failed");
        return r.json();
      })
      .then(async (data) => {
        if (data.access_token) {
          setToken(data.access_token);
          // Load user into context BEFORE navigating so AppShell doesn't redirect back
          await refreshUser();
          router.replace("/dashboard");
        } else {
          router.replace("/auth?error=oauth_failed");
        }
      })
      .catch(() => router.replace("/auth?error=oauth_failed"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(99,102,241,0.2)", borderTopColor: "var(--indigo)", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Signing you in with Google...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }}></div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
