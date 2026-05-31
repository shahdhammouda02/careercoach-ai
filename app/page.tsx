"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [agentStep, setAgentStep] = useState("");

  const steps = [
    "Reading your CV...",
    "Analyzing job requirements...",
    "Calculating match score...",
    "Generating interview questions...",
    "Building your roadmap...",
  ];

  async function handleSubmit() {
    if (!file || !jobTitle) return;
    setLoading(true);

    for (let i = 0; i < steps.length; i++) {
      setAgentStep(steps[i]);
      await new Promise((r) => setTimeout(r, 800));
    }

    const formData = new FormData();
    formData.append("cv", file);
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);

    const res = await fetch("/api/agent", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    localStorage.setItem("careercoach_result", JSON.stringify(data));
    router.push("/results");
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎯</div>
          <h1 className="text-3xl font-bold text-slate-800">CareerCoach AI</h1>
          <p className="text-slate-500 mt-2">
            Upload your CV and get a personalized career plan
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Your CV (PDF)
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 transition">
              <span className="text-2xl mb-2">📄</span>
              <span className="text-sm text-slate-500">
                {file ? file.name : "Click to upload PDF"}
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Target Job Title
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Developer"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Job Description{" "}
              <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              placeholder="Paste the job description here..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !file || !jobTitle}
            className="w-full bg-blue-600 text-white rounded-xl p-3 font-semibold hover:bg-blue-700 disabled:opacity-40 transition"
          >
            {loading ? agentStep : "🚀 Analyze with AI Agent"}
          </button>

        </div>

        {loading && (
          <div className="mt-4 flex justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i <= steps.indexOf(agentStep) ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}