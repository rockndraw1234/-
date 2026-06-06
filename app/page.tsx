"use client";

import { useState, useCallback } from "react";
import { getRandomPrompt, type Prompt } from "@/lib/prompts";

type WritingType = "과장" | "은유";

interface Feedback {
  worked: string;
  upgrade: string;
}

const TYPE_DESCRIPTIONS: Record<WritingType, string> = {
  과장: "실제보다 훨씬 크거나 강하게 표현",
  은유: "전혀 다른 것에 빗대어 표현",
};

export default function Home() {
  const [prompt, setPrompt] = useState<Prompt>(() => getRandomPrompt());
  const [type, setType] = useState<WritingType | null>(null);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewPrompt = useCallback(() => {
    setPrompt((prev) => getRandomPrompt(prev.text));
    setType(null);
    setText("");
    setFeedback(null);
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (!type || !text.trim()) return;

    setLoading(true);
    setFeedback(null);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.text, type, response: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }

      setFeedback(data);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = type !== null && text.trim().length > 0 && !loading;

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-xl flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-stone-800 tracking-tight">
            유머 글쓰기 훈련
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            과장 또는 은유로 유머러스한 문장을 써보세요
          </p>
        </div>

        {/* Prompt Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">
            {prompt.category}
          </span>
          <p className="mt-2 text-2xl font-bold text-stone-900 leading-snug">
            {prompt.text}
          </p>
        </div>

        {/* Type Selection */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-stone-500">훈련 유형</p>
          <div className="flex gap-3">
            {(["과장", "은유"] as WritingType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setFeedback(null);
                }}
                className={`
                  flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all
                  ${
                    type === t
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                  }
                `}
              >
                <span className="block text-base font-semibold">{t}법</span>
                <span
                  className={`block text-xs mt-0.5 font-normal ${
                    type === t ? "text-stone-300" : "text-stone-400"
                  }`}
                >
                  {TYPE_DESCRIPTIONS[t]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-stone-500" htmlFor="writing">
            한두 문장으로 써보세요
          </label>
          <textarea
            id="writing"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              type === "과장"
                ? "예: 충전기 선이 너무 엉켜서..."
                : type === "은유"
                ? "예: 이건 마치..."
                : "먼저 훈련 유형을 선택하세요"
            }
            disabled={!type}
            rows={3}
            className={`
              w-full resize-none rounded-xl border px-4 py-3 text-sm text-stone-800
              placeholder-stone-300 outline-none transition-all leading-relaxed
              ${
                type
                  ? "bg-white border-stone-200 focus:border-stone-500"
                  : "bg-stone-100 border-stone-200 cursor-not-allowed text-stone-400"
              }
            `}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-sm transition-all
            ${
              canSubmit
                ? "bg-stone-900 text-white hover:bg-stone-700 active:scale-[0.98]"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              피드백 받는 중...
            </span>
          ) : (
            "피드백 받기"
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-300">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
                작동한 것
              </p>
              <p className="text-stone-800 text-sm leading-relaxed">
                {feedback.worked}
              </p>
            </div>
            <div className="bg-stone-900 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                업그레이드 버전
              </p>
              <p className="text-stone-100 text-sm leading-relaxed">
                {feedback.upgrade}
              </p>
            </div>
          </div>
        )}

        {/* New Prompt Button */}
        <button
          onClick={handleNewPrompt}
          className="w-full py-3 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium hover:border-stone-400 hover:text-stone-700 transition-all"
        >
          새 소재로 연습하기 →
        </button>

      </div>
    </main>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
