"use client";

import { useState } from "react";
import { CITIES } from "@/lib/cities";
import { VibeResult } from "@/lib/vibeEngine";

interface VibeResponse {
  city: { name: string; state: string };
  vibe: VibeResult;
  updatedAt: string;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 45 ? "#eab308" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 72 72)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <span className="text-3xl font-bold text-white">{score}</span>
    </div>
  );
}

function FactorBar({ label, score, note }: { label: string; score: number; note: string }) {
  const color = score >= 70 ? "bg-green-500" : score >= 45 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-slate-400">
        <span>{label}</span>
        <span className="text-white font-medium">{score}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-slate-500">{note}</p>
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
      if (!res.ok) throw new Error("Failed to fetch vibe");
      setData(await res.json());
    } catch {
      setError("Couldn't fetch the vibe. Check your API keys.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight mb-2">
          Vibe Check <span className="text-indigo-400">🌆</span>
        </h1>
        <p className="text-slate-400 text-lg">What&apos;s the energy in your city right now?</p>
      </div>

      <div className="w-full max-w-md flex gap-3">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">Pick a city...</option>
          {CITIES.map((city) => (
            <option key={city.name} value={city.name}>{city.name}, {city.state}</option>
          ))}
        </select>
        <button
          onClick={checkVibe}
          disabled={!selectedCity || loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      {error && <p className="mt-6 text-red-400 text-sm">{error}</p>}

      {loading && (
        <div className="mt-16 flex flex-col items-center gap-4 text-slate-400">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p>Reading the city&apos;s energy...</p>
        </div>
      )}

      {data && !loading && (
        <div className="mt-10 w-full max-w-md space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-6">
            <ScoreRing score={data.vibe.score} />
            <div>
              <div className="text-3xl mb-1">{data.vibe.emoji}</div>
              <h2 className="text-2xl font-bold">{data.vibe.label}</h2>
              <p className="text-slate-400 text-sm mt-1">{data.city.name}, {data.city.state}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-300 leading-relaxed">{data.vibe.summary}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Breakdown</h3>
            <FactorBar label="Weather" score={data.vibe.factors.weather.score} note={data.vibe.factors.weather.note} />
            <FactorBar label="Events" score={data.vibe.factors.events.score} note={data.vibe.factors.events.note} />
            <FactorBar label="Air Quality" score={data.vibe.factors.air.score} note={data.vibe.factors.air.note} />
          </div>
          <p className="text-center text-xs text-slate-600">
            Last updated {new Date(data.updatedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </main>
  );
}
