import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Quiz } from "@/features/quiz";

export const metadata: Metadata = {
  title: "Quiz",
};

export default function QuizPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Quick quiz"
        description="Five random questions, one at a time. A new set every round."
      />
      <Quiz />
    </div>
  );
}
