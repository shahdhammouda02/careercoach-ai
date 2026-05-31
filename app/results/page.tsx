"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/types";

export default function Results() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [tab, setTab] = useState<"analysis" | "interview" | "roadmap">("analysis");

  useEffect(() => {
  const stored = localStorage.getItem("careercoach_result");
  if (!stored) {
    router.push("/");
    return;
  }
  const parsed = JSON.parse(stored);
  setTimeout(() => setData(parsed), 0);
}, [router]);

  if (!data) return null;

  const { cvAnalysis, interviewQuestions, roadmap } = data;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-slate-800">Your Career Report</h1>
          <div />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-4 text-center">
          <p className="text-sm text-slate-500 mb-1">Match Score</p>
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {cvAnalysis.matchScore}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${cvAnalysis.matchScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-4 text-sm text-slate-600">
            <span>🎓 {cvAnalysis.educationLevel}</span>
            <span>💼 {cvAnalysis.experienceYears} years exp.</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {(["analysis", "interview", "roadmap"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              {t === "analysis" ? "📊 Analysis" : t === "interview" ? "🎤 Interview" : "🗺️ Roadmap"}
            </button>
          ))}
        </div>

        {tab === "analysis" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-3">✅ Strengths</h3>
              <div className="flex flex-wrap gap-2">
                {cvAnalysis.strengths.map((s) => (
                  <span key={s} className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-3">⚠️ Skill Gaps</h3>
              <div className="flex flex-wrap gap-2">
                {cvAnalysis.gaps.map((g) => (
                  <span key={g} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-3">🛠️ Your Skills</h3>
              <div className="flex flex-wrap gap-2">
                {cvAnalysis.extractedSkills.map((s) => (
                  <span key={s} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "interview" && (
          <div className="flex flex-col gap-3">
            {interviewQuestions.map((q, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {q.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    q.difficulty === "easy" ? "bg-green-50 text-green-600" :
                    q.difficulty === "medium" ? "bg-yellow-50 text-yellow-600" :
                    "bg-red-50 text-red-600"
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
                <p className="font-medium text-slate-700 text-sm mb-3">{q.question}</p>
                <details className="text-sm text-slate-500">
                  <summary className="cursor-pointer text-blue-500 font-medium">
                    Show sample answer
                  </summary>
                  <p className="mt-2 leading-relaxed">{q.sampleAnswer}</p>
                </details>
              </div>
            ))}
          </div>
        )}

        {tab === "roadmap" && (
          <div className="flex flex-col gap-4">
            {roadmap.map((week) => (
              <div key={week.week} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {week.week}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">{week.focus}</p>
                    <p className="text-xs text-slate-400">Week {week.week}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {week.topics.map((t) => (
                    <span key={t} className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {week.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <span>{r.type === "video" ? "▶️" : r.type === "course" ? "🎓" : "📖"}</span>
                      {r.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}