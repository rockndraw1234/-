"use client";

import { useState, useCallback } from "react";
import { getRandomPrompt, type Prompt } from "@/lib/prompts";

type WritingType = "과장" | "은유";

interface Feedback {
  worked: string;
  upgrade: string;
  gag: string;
}

const TYPE_CONFIG: Record<WritingType, { emoji: string; desc: string; active: string; inactive: string }> = {
  과장: {
    emoji: "📣",
    desc: "실제보다 훨씬 크게",
    active: "bg-orange-400 border-orange-400 text-white shadow-orange-100 shadow-lg",
    inactive: "bg-white border-orange-200 text-orange-500 hover:border-orange-300 hover:bg-orange-50",
  },
  은유: {
    emoji: "🔮",
    desc: "전혀 다른 것에 빗대기",
    active: "bg-violet-500 border-violet-500 text-white shadow-violet-100 shadow-lg",
    inactive: "bg-white border-violet-200 text-violet-500 hover:border-violet-300 hover:bg-violet-50",
  },
};

const CATEGORY_STYLE: Record<string, string> = {
  "사물/현상": "bg-sky-100 text-sky-600",
  "감정/상태": "bg-pink-100 text-pink-600",
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
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50 to-amber-50 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-xl flex flex-col gap-7">

        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2">✍️</div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">
            유머 글쓰기 훈련
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            소재 하나로 유머 감각을 키워봐요
          </p>
        </div>

        {/* Intro */}
        <div className="bg-white/70 backdrop-blur-sm border border-orange-100 rounded-3xl px-5 py-4 text-sm text-stone-600 leading-relaxed shadow-sm">
          <p className="font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
            <span>🎯</span> 이런 앱이에요
          </p>
          <p>
            일상 소재가 주어지면 <strong>과장법</strong> 또는{" "}
            <strong>은유법</strong>을 골라 유머러스한 한두 문장을 써보세요.
            AI 코치가 뭐가 잘 됐는지, 어떻게 더 강하게 쓸 수 있는지 알려줍니다.
          </p>
          <p className="mt-2 text-stone-400 text-xs flex gap-3">
            <span>🎲 매번 다른 소재</span>
            <span>🚫 점수 없음</span>
            <span>✨ 감각 훈련에 집중</span>
          </p>
        </div>

        {/* Prompt Card */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full" />
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${CATEGORY_STYLE[prompt.category] ?? "bg-stone-100 text-stone-500"}`}>
            {prompt.category}
          </span>
          <p className="text-2xl font-bold text-stone-900 leading-snug">
            {prompt.text}
          </p>
        </div>

        {/* Type Selection */}
        <div className="flex flex-col gap-2.5">
          <p className="text-sm font-semibold text-stone-500 px-1">기법 선택</p>
          <div className="flex gap-3">
            {(["과장", "은유"] as WritingType[]).map((t) => {
              const cfg = TYPE_CONFIG[t];
              const isActive = type === t;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    setFeedback(null);
                  }}
                  className={`flex-1 py-3.5 px-4 rounded-2xl border-2 text-sm font-medium transition-all ${isActive ? cfg.active : cfg.inactive}`}
                >
                  <span className="block text-xl mb-0.5">{cfg.emoji}</span>
                  <span className="block text-base font-bold">{t}법</span>
                  <span className={`block text-xs mt-0.5 font-normal ${isActive ? "opacity-80" : "opacity-60"}`}>
                    {cfg.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-stone-500 px-1" htmlFor="writing">
            ✏️ 한두 문장으로 써보세요
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
                : "먼저 기법을 선택하세요 👆"
            }
            disabled={!type}
            rows={3}
            className={`
              w-full resize-none rounded-2xl border-2 px-4 py-3 text-sm text-stone-800
              placeholder-stone-300 outline-none transition-all leading-relaxed
              ${
                type
                  ? "bg-white border-stone-200 focus:border-orange-300 focus:shadow-sm"
                  : "bg-stone-50 border-stone-100 cursor-not-allowed text-stone-400"
              }
            `}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
            w-full py-4 rounded-2xl font-bold text-sm transition-all
            ${
              canSubmit
                ? "bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg shadow-orange-100 hover:shadow-orange-200 hover:scale-[1.01] active:scale-[0.98]"
                : "bg-stone-100 text-stone-300 cursor-not-allowed"
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              코치 부르는 중...
            </span>
          ) : (
            "💬 피드백 받기"
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-500 flex items-start gap-2">
            <span>😅</span>
            <span>{error}</span>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="flex flex-col gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 shadow-sm">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                <span>✅</span> 잘 됐어요
              </p>
              <p className="text-stone-700 text-sm leading-relaxed">
                {feedback.worked}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-3xl p-5 shadow-md">
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                <span>⚡</span> 업그레이드 버전
              </p>
              <p className="text-white text-sm leading-relaxed">
                {feedback.upgrade}
              </p>
            </div>
            {feedback.gag && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-5">
                <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <span>🎤</span> 코치의 한 마디
                </p>
                <p className="text-stone-700 text-sm leading-relaxed italic">
                  {feedback.gag}
                </p>
              </div>
            )}
          </div>
        )}

        {/* New Prompt Button */}
        <button
          onClick={handleNewPrompt}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-stone-300 text-stone-400 text-sm font-semibold hover:border-orange-300 hover:text-orange-400 transition-all"
        >
          🎲 새 소재로 연습하기
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
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
