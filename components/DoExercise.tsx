
import React, { useState } from 'react';
import { Exercise, QuestionType, StudentAnswer } from '../types';

interface DoExerciseProps {
  exercise: Exercise;
  onFinish: (answers: StudentAnswer[]) => void;
}

const DoExercise: React.FC<DoExerciseProps> = ({ exercise, onFinish }) => {
  const [answers, setAnswers] = useState<StudentAnswer[]>(
    exercise.questions.map(q => ({ questionId: q.id, answer: '' }))
  );

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(currentAnswers =>
      currentAnswers.map(a => (a.questionId === questionId ? { ...a, answer } : a))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFinish(answers);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-sky-700 mb-2">{exercise.title}</h1>
      <p className="text-center text-gray-500 mb-8">Môn: {exercise.subject}</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {exercise.questions.map((q, index) => (
          <div key={q.id} className="p-6 bg-sky-50 rounded-lg border border-sky-200">
            <p className="text-lg font-semibold text-gray-800 mb-4">
              <span className="text-blue-500 font-bold">Câu {index + 1}:</span> {q.questionText}
            </p>
            {q.type === QuestionType.FillInTheBlank && (
              <input
                type="text"
                value={answers.find(a => a.questionId === q.id)?.answer || ''}
                onChange={e => handleAnswerChange(q.id, e.target.value)}
                className="mt-1 block w-full md:w-1/2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Điền câu trả lời..."
              />
            )}
            {q.type === QuestionType.MultipleChoice && (
              <div className="space-y-3 mt-2">
                {q.options?.map(option => (
                  <label key={option} className="flex items-center p-3 bg-white rounded-md border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors has-[:checked]:bg-blue-100 has-[:checked]:border-blue-400">
                    <input
                      type="radio"
                      name={q.id}
                      value={option}
                      checked={answers.find(a => a.questionId === q.id)?.answer === option}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-4 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="text-center pt-6">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-xl transition-transform transform hover:scale-105 shadow-lg"
          >
            Nộp bài
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoExercise;
