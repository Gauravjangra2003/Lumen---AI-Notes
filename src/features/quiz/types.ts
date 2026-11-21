export type QuizQuestion = {
  id: string;
  category: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
};
