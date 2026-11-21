"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw, Trophy, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsClient } from "@/hooks/use-is-client";
import { sample, shuffle } from "@/lib/random";
import { cn } from "@/lib/utils";

import { QUIZ_QUESTIONS } from "../data/questions";
import type { QuizQuestion } from "../types";

const QUIZ_LENGTH = 5;
const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

function createRound(): QuizQuestion[] {
  return sample(QUIZ_QUESTIONS, QUIZ_LENGTH).map((question) => ({
    ...question,
    options: shuffle(question.options),
  }));
}

export function Quiz() {
  const isClient = useIsClient();
  const [round, setRound] = useState(0);

  if (!isClient) return <QuizSkeleton />;

  return <QuizRound key={round} onRestart={() => setRound((current) => current + 1)} />;
}

function QuizRound({ onRestart }: { onRestart: () => void }) {
  const [questions] = useState(createRound);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (finished) {
    return <QuizResult score={score} total={questions.length} onRestart={onRestart} />;
  }

  const question = questions[index]!;
  const isLast = index === questions.length - 1;
  const answered = selected !== null;

  function handleSelect(option: string) {
    if (answered) return;
    setSelected(option);
    if (option === question.answer) setScore((current) => current + 1);
  }

  function handleNext() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
  }

  return (
    <section
      aria-labelledby="quiz-question"
      className="space-y-6 rounded-xl border bg-card p-5 sm:p-8"
    >
      <QuizProgress current={index + 1} total={questions.length} score={score} />

      <div className="space-y-2">
        <span className="inline-flex rounded-full bg-ai-muted px-2.5 py-0.5 text-xs font-medium text-ai">
          {question.category}
        </span>
        <h2 id="quiz-question" className="text-lg font-semibold text-balance sm:text-xl">
          {question.question}
        </h2>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option, optionIndex) => (
          <li key={option}>
            <QuizOption
              label={OPTION_LABELS[optionIndex]!}
              option={option}
              state={getOptionState(option, question.answer, selected)}
              disabled={answered}
              onSelect={() => handleSelect(option)}
            />
          </li>
        ))}
      </ul>

      <div aria-live="polite" className="min-h-6 text-sm">
        {answered && (
          <p className={cn(selected === question.answer ? "text-emerald-500" : "text-destructive")}>
            <span className="font-medium">
              {selected === question.answer ? "Correct!" : `Not quite — it's ${question.answer}.`}
            </span>{" "}
            {question.explanation && (
              <span className="text-muted-foreground">{question.explanation}</span>
            )}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleNext} disabled={!answered}>
          {isLast ? "See results" : "Next question"}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </section>
  );
}

type OptionState = "idle" | "correct" | "wrong" | "dimmed";

function getOptionState(option: string, answer: string, selected: string | null): OptionState {
  if (selected === null) return "idle";
  if (option === answer) return "correct";
  if (option === selected) return "wrong";
  return "dimmed";
}

function QuizOption({
  label,
  option,
  state,
  disabled,
  onSelect,
}: {
  label: string;
  option: string;
  state: OptionState;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      data-state={state}
      className="group/option flex min-h-12 w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors outline-none hover:border-foreground/30 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default data-[state=correct]:border-emerald-500 data-[state=correct]:bg-emerald-500/10 data-[state=dimmed]:opacity-50 data-[state=dimmed]:hover:bg-transparent data-[state=wrong]:border-destructive data-[state=wrong]:bg-destructive/10"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-medium group-data-[state=correct]/option:border-emerald-500 group-data-[state=correct]/option:bg-emerald-500 group-data-[state=correct]/option:text-white group-data-[state=wrong]/option:border-destructive group-data-[state=wrong]/option:bg-destructive group-data-[state=wrong]/option:text-white">
        {state === "correct" ? (
          <Check className="size-4" />
        ) : state === "wrong" ? (
          <X className="size-4" />
        ) : (
          label
        )}
      </span>
      <span className="flex-1">{option}</span>
    </button>
  );
}

function QuizProgress({
  current,
  total,
  score,
}: {
  current: number;
  total: number;
  score: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Question {current} of {total}
        </span>
        <span>Score: {score}</span>
      </div>
      <div
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-ai transition-[width] duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function getResultMessage(ratio: number) {
  if (ratio === 1) return "Perfect score! You nailed it.";
  if (ratio >= 0.6) return "Great job — you know your stuff.";
  if (ratio >= 0.4) return "Not bad! Another round?";
  return "Keep going, practice makes perfect.";
}

function QuizResult({
  score,
  total,
  onRestart,
}: {
  score: number;
  total: number;
  onRestart: () => void;
}) {
  return (
    <section className="flex flex-col items-center gap-5 rounded-xl border bg-card px-5 py-10 text-center sm:px-8">
      <span className="flex size-14 items-center justify-center rounded-full bg-ai-muted text-ai">
        <Trophy className="size-7" />
      </span>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">
          {score} / {total}
        </h2>
        <p className="text-sm text-muted-foreground">{getResultMessage(score / total)}</p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button size="lg" onClick={onRestart}>
          <RotateCcw data-icon="inline-start" />
          Play again
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/notes">Back to notes</Link>
        </Button>
      </div>
    </section>
  );
}

function QuizSkeleton() {
  return (
    <div className="space-y-6 rounded-xl border p-5 sm:p-8">
      <Skeleton className="h-1.5 w-full" />
      <Skeleton className="h-7 w-3/4" />
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
