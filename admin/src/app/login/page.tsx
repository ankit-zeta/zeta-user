"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useAdminAuth } from "@/lib/convex";
import { Shield, Lock, Mail, Eye, EyeOff, Grid3X3, RotateCcw, CheckCircle } from "lucide-react";

const DOT_POSITIONS = [
  { x: 50, y: 50 },  { x: 150, y: 50 },  { x: 250, y: 50 },
  { x: 50, y: 150 }, { x: 150, y: 150 }, { x: 250, y: 150 },
  { x: 50, y: 250 }, { x: 150, y: 250 }, { x: 250, y: 250 },
];

function PatternGrid({ selectedDots, success, onPointerDown, onPointerMove, onPointerUp, svgRef }: {
  selectedDots: number[];
  success: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  svgRef: React.RefObject<SVGSVGElement>;
}) {
  const stroke = success ? "#16a34a" : "#176B4D";
  return (
    <div className="flex justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 300 300"
        className="w-64 h-64 touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {selectedDots.length > 1 && (
          <polyline
            points={selectedDots.map((d) => `${DOT_POSITIONS[d].x},${DOT_POSITIONS[d].y}`).join(" ")}
            fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"
          />
        )}
        {DOT_POSITIONS.map((pos, i) => {
          const isSelected = selectedDots.includes(i);
          const isLast = selectedDots[selectedDots.length - 1] === i;
          return (
            <g key={i}>
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r="22" fill="none" stroke={stroke} strokeWidth="2" opacity="0.3" />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={isLast ? "14" : "10"}
                fill={isSelected ? stroke : "#e5e5e5"}
                stroke={isSelected ? (success ? "#15803d" : "#0f5132") : "#d4d4d4"}
                strokeWidth="2" className="transition-all duration-150"
              />
              {!isSelected && <circle cx={pos.x} cy={pos.y} r="4" fill="#a3a3a3" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, token } = useAdminAuth();
  const loginAction = useAction(api.auth.login);
  const verifyPatternAction = useAction(api.gateActions.verifyPattern);
  const setPatternMutation = useAction(api.gateActions.setPattern);
  const setInitialPatternMutation = useAction(api.gateActions.setInitialPattern);
  const patternExists = useQuery(api.gate.isPatternSet);

  const [gatePhase, setGatePhase] = useState<"loading" | "verify" | "setup" | "setupConfirm" | "login">("loading");
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [gateError, setGateError] = useState("");
  const [gateSuccess, setGateSuccess] = useState(false);
  const [setupFirstPattern, setSetupFirstPattern] = useState<number[]>([]);
  const [verifying, setVerifying] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (patternExists === undefined) return;
    setGatePhase(patternExists ? "verify" : "setup");
  }, [patternExists]);

  const getDotFromPoint = useCallback((clientX: number, clientY: number): number | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 300 / rect.width;
    const scaleY = 300 / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    for (let i = 0; i < 9; i++) {
      const dx = x - DOT_POSITIONS[i].x;
      const dy = y - DOT_POSITIONS[i].y;
      if (Math.sqrt(dx * dx + dy * dy) < 35) return i;
    }
    return null;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const dot = getDotFromPoint(e.clientX, e.clientY);
    if (dot !== null) {
      setIsDragging(true);
      setSelectedDots([dot]);
      setGateError("");
      setGateSuccess(false);
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  }, [getDotFromPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dot = getDotFromPoint(e.clientX, e.clientY);
    if (dot !== null && !selectedDots.includes(dot)) {
      setSelectedDots((prev) => [...prev, dot]);
    }
  }, [isDragging, getDotFromPoint, selectedDots]);

  const handlePointerUp = useCallback(async () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (selectedDots.length < 3) {
      setGateError("Pattern too short. Connect at least 3 dots.");
      setSelectedDots([]);
      return;
    }

    if (gatePhase === "verify") {
      setVerifying(true);
      try {
        const result = await verifyPatternAction({ pattern: selectedDots });
        if (result.valid) {
          setGateSuccess(true);
          setTimeout(() => setGatePhase("login"), 600);
        } else {
          setGateError("Wrong pattern. Try again.");
          setSelectedDots([]);
        }
      } catch (err: any) {
        setGateError(err.message || "Verification failed. Try again.");
        setSelectedDots([]);
      } finally {
        setVerifying(false);
      }
    } else if (gatePhase === "setup") {
      setSetupFirstPattern(selectedDots);
      setSelectedDots([]);
      setGatePhase("setupConfirm");
      setGateError("");
    } else if (gatePhase === "setupConfirm") {
      const match = selectedDots.length === setupFirstPattern.length &&
        selectedDots.every((v, i) => v === setupFirstPattern[i]);
      if (match) {
        try {
          setVerifying(true);
          await setInitialPatternMutation({ pattern: selectedDots });
          setGateSuccess(true);
          setTimeout(() => setGatePhase("login"), 600);
        } catch (err: any) {
          setGateError(err.message || "Failed to save pattern.");
          setSelectedDots([]);
        } finally {
          setVerifying(false);
        }
      } else {
        setGateError("Patterns don't match. Draw again from start.");
        setSelectedDots([]);
      }
    }
  }, [isDragging, selectedDots, gatePhase, verifyPatternAction, setPatternMutation, setupFirstPattern, token]);

  const handleReset = () => { setSelectedDots([]); setGateError(""); setGateSuccess(false); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please provide both email and password."); return; }
    setIsLoading(true); setError("");
    try {
      let ip = "", location = "";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ip = ipData.ip || "";
        if (ip) {
          try {
            const locRes = await fetch(`https://ipapi.co/${ip}/json/`);
            const locData = await locRes.json();
            location = [locData.city, locData.region, locData.country_name].filter(Boolean).join(", ");
          } catch {}
        }
      } catch {}
      const ua = navigator.userAgent;
      const deviceType = /Mobi|Android|iPhone/i.test(ua) ? "mobile" : /iPad|Tablet/i.test(ua) ? "tablet" : "desktop";
      const deviceOS = /Win/i.test(ua) ? "Windows" : /Mac/i.test(ua) ? "macOS" : /Linux/i.test(ua) ? "Linux" : /Android/i.test(ua) ? "Android" : /iPhone|iPad/i.test(ua) ? "iOS" : "Unknown";
      const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Brave)\/[\d.]+/);
      const deviceBrowser = browserMatch ? browserMatch[1] : "Unknown";
      const res = await loginAction({
        email: email.trim().toLowerCase(), password,
        ip: ip || undefined, userAgent: ua || undefined,
        deviceType, deviceOS, deviceBrowser, location: location || undefined,
      });
      if (!["super_admin", "admin", "content_admin", "finance_admin", "work_admin"].includes(res.user.role)) {
        throw new Error("Access Denied: You do not have administrator permissions.");
      }
      login(res.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid administrative credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPhaseTitle = () => {
    if (gatePhase === "setup") return { title: "Set Your Pattern", sub: "Draw a pattern (min 3 dots) to secure the admin portal. You'll confirm it next." };
    if (gatePhase === "setupConfirm") return { title: "Confirm Pattern", sub: "Draw the same pattern again to save." };
    return { title: "Restricted Area", sub: "Draw your pattern to unlock the admin portal." };
  };
  const phase = getPhaseTitle();

  if (gatePhase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgWarm">
        <div className="text-xs text-textMuted">Loading...</div>
      </div>
    );
  }

  if (gatePhase !== "login") {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bgWarm text-textMain">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
            {gatePhase === "setupConfirm" ? <CheckCircle className="w-6 h-6" /> : <Grid3X3 className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-textMain">{phase.title}</h1>
          <p className="text-xs text-textMuted">{phase.sub}</p>
          {gatePhase === "setup" && (
            <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
              First time setup — draw your pattern to secure the admin portal.
            </p>
          )}
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white border border-borderSubtle rounded-xl p-8 space-y-6 shadow-sm">
            {gateError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{gateError}</div>}
            {gateSuccess && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700">
              {gatePhase === "setupConfirm" ? "Pattern saved! Redirecting to dashboard..." : "Pattern accepted. Unlocking..."}
            </div>}

            <PatternGrid
              selectedDots={selectedDots} success={gateSuccess}
              onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp} svgRef={svgRef}
            />

            {selectedDots.length > 0 && !gateSuccess && (
              <div className="flex justify-center">
                <button onClick={handleReset} className="flex items-center gap-1.5 text-[11px] text-textMuted hover:text-textMain transition-colors">
                  <RotateCcw className="w-3 h-3" /> Clear pattern
                </button>
              </div>
            )}

            {verifying && <p className="text-[11px] text-textMuted text-center">Verifying against server...</p>}

            {gatePhase === "setupConfirm" && !gateSuccess && (
              <button onClick={() => { setGatePhase("setup"); setSetupFirstPattern([]); setSelectedDots([]); setGateError(""); }}
                className="w-full text-[11px] text-textMuted hover:text-textMain transition-colors">
                Start over
              </button>
            )}

            <p className="text-[10px] text-textMuted text-center">Unauthorized access attempts are logged.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-bgWarm text-textMain">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-textMain">ZetaGrow Admin Panel</h1>
        <p className="text-xs text-textMuted">Secure operational gateway for platform administrators.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-borderSubtle rounded-xl p-8 space-y-6 shadow-sm">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMuted">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zetagrow.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-borderSubtle text-xs bg-white text-textMain placeholder:text-neutral-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textMuted">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-lg border border-borderSubtle text-xs bg-white text-textMain placeholder:text-neutral-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 focus:outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 text-xs font-semibold shadow-sm mt-2 bg-brand-600 hover:bg-brand-700">
              {isLoading ? "Authenticating..." : "Sign In to Admin Panel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
