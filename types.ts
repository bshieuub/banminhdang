export enum Subject {
  Toan = 'Toán',
  TiengViet = 'Tiếng Việt',
  TiengAnh = 'Tiếng Anh',
  Khac = 'Khác',
}

export enum QuestionType {
  MultipleChoice = 'MULTIPLE_CHOICE',
  FillInTheBlank = 'FILL_IN_THE_BLANK',
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  imageUrl?: string;
}

export interface Exercise {
  id: string;
  title: string;
  subject: Subject;
  questions: Question[];
  createdAt: string;
  originalFile: {
    dataUrl: string;
    name: string;
    type: string;
  };
}

export enum View {
    Dashboard = 'DASHBOARD',
    CreateExercise = 'CREATE_EXERCISE',
    DoExercise = 'DO_EXERCISE',
    Results = 'RESULTS',
    ReviewExercise = 'REVIEW_EXERCISE',
}

export interface StudentAnswer {
    questionId: string;
    answer: string;
}
