import React, { useState } from 'react';
import { Award, CheckCircle2, Lock, RotateCcw, XCircle } from 'lucide-react';
import { Module, QuizAttempt } from '../types/lms';
import { useLMS } from '../store/LMSContext';

interface ModuleQuizEngineProps {
  module: Module;
  isUnlocked: boolean;
  completedChapters: number;
  totalChapters: number;
  onUnlockCertificate?: () => void;
}

export const ModuleQuizEngine: React.FC<ModuleQuizEngineProps> = ({
  module,
  isUnlocked,
  completedChapters,
  totalChapters,
  onUnlockCertificate,
}) => {
  const { state, currentUser, submitQuizAttempt } = useLMS();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [latestResult, setLatestResult] = useState<QuizAttempt | null>(null);

  const pastAttempts = state.quizAttempts.filter(
    (a) => a.userId === currentUser?.id && a.moduleId === module.id
  );
  const bestAttempt = [...pastAttempts].sort((a, b) => b.scorePercent - a.scorePercent)[0];

  const allAnswered =
    module.quiz.length > 0 &&
    module.quiz.every((q) => typeof selectedAnswers[q.id] === 'number');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;
    const res = submitQuizAttempt(module.id, selectedAnswers);
    if (res) {
      setLatestResult(res);
      if (res.passed && onUnlockCertificate) {
        onUnlockCertificate();
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setLatestResult(null);
  };

  if (!isUnlocked) {
    return (
      <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-8 text-center">
        <Lock className="w-7 h-7 text-[#71717A] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="font-display font-semibold text-[18px] text-[#09090B]">
          Knowledge Check Locked
        </h3>
        <p className="text-[14px] text-[#71717A] mt-1.5 max-w-md mx-auto">
          Complete all {totalChapters} chapters in this module to unlock the Knowledge Check and earn your Certificate of Attendance.
        </p>
        <div className="mt-4 text-[13px] font-mono tabular-nums text-[#09090B]">
          Progress: {completedChapters} / {totalChapters} chapters completed
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-white border border-[#E4E4E7] rounded-[8px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[12px] font-mono text-[#71717A]">
            {module.code} · Knowledge Check
          </div>
          <h2 className="font-display font-semibold text-[20px] text-[#09090B] mt-0.5">
            {module.title} Assessment
          </h2>
          <p className="text-[13px] text-[#71717A] mt-1 tabular-nums">
            {module.quiz.length} questions · Passing score {module.quizPassingScore}%
          </p>
        </div>

        {bestAttempt && (
          <div className="px-4 py-2.5 rounded-[6px] bg-[#FAFAFA] border border-[#E4E4E7] text-right shrink-0">
            <div className="text-[11px] text-[#71717A]">Best Score</div>
            <div className="font-display font-semibold text-[18px] tabular-nums text-[#09090B]">
              {bestAttempt.scorePercent}% · {bestAttempt.passed ? 'Passed' : 'Retry'}
            </div>
          </div>
        )}
      </div>

      {/* Results Breakdown View */}
      {latestResult ? (
        <div className="space-y-5">
          <div
            className={`rounded-[8px] p-6 border ${
              latestResult.passed
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-[#09090B] border-[#09090B]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div
                  className={`text-[12px] font-mono ${
                    latestResult.passed ? 'text-zinc-400' : 'text-[#71717A]'
                  }`}
                >
                  Assessment Result
                </div>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-display font-semibold text-[32px] tabular-nums">
                    {latestResult.scorePercent}%
                  </span>
                  <span className="text-[14px] tabular-nums">
                    {latestResult.correctCount} of {latestResult.totalCount} correct
                  </span>
                </div>
                <p
                  className={`mt-1.5 text-[13px] ${
                    latestResult.passed ? 'text-zinc-300' : 'text-[#71717A]'
                  }`}
                >
                  {latestResult.passed
                    ? 'You met the passing threshold. Your Certificate of Attendance is now unlocked.'
                    : `Passing threshold is ${module.quizPassingScore}%. Review the question feedback below and retry.`}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleRetry}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                    latestResult.passed
                      ? 'bg-white text-[#09090B] hover:bg-zinc-200'
                      : 'bg-[#09090B] text-white hover:bg-[#18181B]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Retake Quiz</span>
                </button>
                {latestResult.passed && onUnlockCertificate && (
                  <button
                    type="button"
                    onClick={onUnlockCertificate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[6px] border border-white/25 text-white hover:bg-white/10 text-[13px] font-medium whitespace-nowrap shrink-0"
                  >
                    <Award className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>View Certificate</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {module.quiz.map((q, idx) => {
              const chosen = latestResult.selectedAnswers[q.id];
              const isCorrect = chosen === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className="bg-white border border-[#E4E4E7] rounded-[8px] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[14px] font-semibold text-[#09090B]">
                      <span className="font-mono text-[#71717A] mr-2">0{idx + 1}.</span>
                      {q.prompt}
                    </div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#09090B] shrink-0">
                        <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#71717A] shrink-0">
                        <XCircle className="w-4 h-4" strokeWidth={1.5} />
                        Incorrect
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5 text-[13px]">
                    <div className="text-[#71717A]">
                      Your answer:{' '}
                      <span className="text-[#09090B] font-medium">
                        {q.options[chosen]}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="text-[#71717A]">
                        Correct answer:{' '}
                        <span className="text-[#09090B] font-medium">
                          {q.options[q.correctIndex]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E4E4E7] text-[12px] text-[#71717A] leading-relaxed">
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {module.quiz.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white border border-[#E4E4E7] rounded-[8px] p-6"
            >
              <div className="text-[15px] font-semibold text-[#09090B] mb-4">
                <span className="font-mono text-[#71717A] mr-2">0{idx + 1}.</span>
                {q.prompt}
              </div>

              <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                  const selected = selectedAnswers[q.id] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      className={`flex items-start gap-3 p-3.5 rounded-[6px] border cursor-pointer transition-colors ${
                        selected
                          ? 'border-[#09090B] bg-[#FAFAFA]'
                          : 'border-[#E4E4E7] hover:border-[#09090B]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={selected}
                        onChange={() =>
                          setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                        }
                        className="mt-0.5 accent-[#09090B]"
                      />
                      <span className="text-[13px] text-[#09090B] leading-snug">
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-[12px] font-mono text-[#71717A] tabular-nums">
              {Object.keys(selectedAnswers).length} / {module.quiz.length} answered
            </span>
            <button
              type="submit"
              disabled={!allAnswered}
              className={`px-5 py-2.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                allAnswered
                  ? 'bg-[#09090B] hover:bg-[#18181B] text-white'
                  : 'bg-[#F4F4F5] text-[#71717A] cursor-not-allowed'
              }`}
            >
              Submit Knowledge Check
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
