"use client";

import { useState } from "react";
import { CITIES } from "@/lib/cities";
import { VibeResult } from "@/lib/vibeEngine";

interface VibeResponse {
  city: { name: string; state: string };
  vibe: VibeResult;
  updatedAt: string;
}

const SCORE_COLOR = (score: number) =>
  score >= 70 ? "#4ADE80" : score >= 45 ? "#F5C842" : "#F87171";

function SignalMeter({ score, label, note, delay }: { score: number; label: string; note: string; delay: number }) {
  const blocks = 20;
  const filled = Math.round((score / 100) * blocks);
  const color = SCORE_COLOR(score);

  return (
    <div className="animate-fade-up" style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "var(--muted-fg)", fontFamily: "var(--font-dm-mono)" }}>
          {label}
        </span>
        <span className="text-lg" style={{ color, fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}>
          {score}
        </span>
      </div>
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: blocks }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-3 bar-fill"
            style={{
              backgroundColor: i < filled ? color : "var(--muted)",
              animationDelay: `${delay + i * 25}ms`,
              animationFillMode: "both",
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: "var(--muted-fg)", fontFamily: "var(--font-dm-mono)" }}>{note}</p>
    </div>
  );
}

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("");
  const [data, setData] = useState<VibeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkVibe() {
    if (!selectedCity) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`/api/vibe?city=${encodeURIComponent(selectedCity)}`);
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch {
      setError("Signal lost. Check your API keys.");
    } finally {
      setLoading(false);
    }
  }

  const accentColor = data ? SCORE_COLOR(data.vibe.score) : "var(--accent)";

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--muted)" }}>
        <span
          className="text-2xl tracking-widest"
          style={{ fontFamily: "var(--font-bebas)", color: "var(--accent)" }}
        >
          VIBE CHECK
        </span>
        <span className="text-xs tracking-widest" style={{ color: "var(--muted-fg)", fontFamily: "var(--font-dm-mono)" }}>
          CITY ENERGY INDEX
        </span>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-10">

        {/* Selector row */}
        <div className="flex gap-0 mb-12">
          <div className="flex-1 relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full appearance-none px-4 py-4 text-sm tracking-widest uppercase outline-none cursor-pointer border-r-0"
              style={{
                background: "var(--muted)",
                color: selectedCity ? "var(--fg)" : "var(--muted-fg)",
                borderTop: "1px solid var(--muted)",
                borderLeft: "1px solid var(--muted)",
                borderBottom: "1px solid var(--muted)",
                borderRight: "none",
                fontFamily: "var(--font-dm-mono)",
                letterSpacing: "0.1em",
              }}
            >
              <option value="">SELECT A CITY</option>
              {CITIES.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name.toUpperCase()}, {city.state}
                </option>
              ))}
            </select>
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs"
              style={{ color: "var(--muted-fg)" }}
            >
              ▾
            </div>
          </div>
          <button
            onClick={checkVibe}
            disabled={!selectedCity || loading}
            className="px-8 py-4 text-sm font-medium tracking-widest uppercase transition-all"
            style={{
              background: !selectedCity || loading ? "var(--muted)" : "var(--accent)",
              color: !selectedCity || loading ? "var(--muted-fg)" : "#0C0A08",
              fontFamily: "var(--font-bebas)",
              fontSize: "1rem",
              letterSpacing: "0.15em",
              cursor: !selectedCity || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "READING..." : "SCAN →"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 gap-6">
            <div
              className="text-7xl tracking-widest animate-pulse"
              style={{ fontFamily: "var(--font-bebas)", color: "var(--accent)" }}
            >
              ---
            </div>
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--muted-fg)", fontFamily: "var(--font-dm-mono)" }}>
              READING THE CITY
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs tracking-widest uppercase py-4" style={{ color: "#F87171", fontFamily: "var(--font-dm-mono)" }}>
            ✕ {error}
          </p>
        )}

        {/* Result */}
        {data && !loading && (
          <div>
            {/* City + Score hero */}
            <div className="border-b pb-8 mb-8" style={{ borderColor: "var(--muted)" }}>
              <div
                className="text-xs tracking-[0.3em] uppercase mb-3 animate-ticker"
                style={{ color: "var(--muted-fg)", fontFamily: "var(--font-dm-mono)" }}
              >
                NOW READING / {data.city.name.toUpperCase()}, {data.city.state}
              </div>

              <div className="flex items-end justify-between">
                <div
                  className="animate-score-pop"
                  style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: "clamp(6rem, 18vw, 10rem)",
                    lineHeight: 0.85,
                    color: accentColor,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {data.vibe.score}
                </div>
                <div className="text-right pb-2 animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
                  <div
                    className="text-3xl mb-1"
                    style={{ fontFamily: "var(--font-bebas)", color: accentColor, letterSpacing: "0.05em" }}
                  >
                    {data.vibe.label.toUpperCase()}
                  </div>
                  <div className="text-xs tracking-widest" style={{ color: "var(--muted-fg)", fontFamily: "var(--font-dm-mono)" }}>
                    VIBE SCORE / 100
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p
              className="text-base leading-relaxed mb-10 animate-fade-up"
              style={{ color: "var(--fg)", fontFamily: "var(--font-dm-mono)", animationDelay: "300ms", animationFillMode: "both" }}
            >
              {data.vibe.summary}
            </p>

            {/* Signal meters */}
            <div
              className="text-xs tracking-[0.3em] uppercase mb-6"
              style={{ color: "var(--muted-fg)", fontFamily: "var(--font-dm-mono)" }}
            >
              SIGNAL BREAKDOWN
            </div>
            <div className="space-y-8">
              <SignalMeter label="WEATHER" score={data.vibe.factors.weather.score} note={data.vibe.factors.weather.note} delay={350} />
              <SignalMeter label="EVENTS" score={data.vibe.factors.events.score} note={data.vibe.factors.events.note} delay={450} />
              <SignalMeter label="AIR" score={data.vibe.factors.air.score} note={data.vibe.factors.air.note} delay={550} />
            </div>

            {/* Footer */}
            <div
              className="mt-12 pt-6 border-t flex justify-between text-xs tracking-widest"
              style={{ borderColor: "var(--muted)", color: "var(--muted-fg)", fontFamily: "var(--font-dm-mono)" }}
            >
              <span>LAST SCAN</span>
              <span>{new Date(data.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <div
              className="text-8xl mb-6 opacity-10"
              style={{ fontFamily: "var(--font-bebas)", color: "var(--fg)", letterSpacing: "0.1em" }}
            >
              000
            </div>
            <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--muted-fg)", fontFamily: "var(--font-dm-mono)" }}>
              SELECT A CITY TO BEGIN
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
