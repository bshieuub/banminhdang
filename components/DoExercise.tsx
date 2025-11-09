import React, { useState } from 'react';
import { Exercise, Question, QuestionType, StudentAnswer } from '../types';
import Modal from './Modal';

interface DoExerciseProps {
  exercise: Exercise;
  onFinish: (answers: StudentAnswer[]) => void;
}

const DoExercise: React.FC<DoExerciseProps> = ({ exercise, onFinish }) => {
  const [answers, setAnswers] = useState<StudentAnswer[]>(
    exercise.questions.map(q => ({ questionId: q.id, answer: '' }))
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(a => (a.questionId === questionId ? { ...a, answer } : a))
    );
  };

  const isAllAnswered = () => {
    return answers.every(a => a.answer.trim() !== '');
  };

  const handleSubmit = () => {
    if (isAllAnswered()) {
        onFinish(answers);
    } else {
        setShowConfirmModal(true);
    }
  };
  
  const confirmFinish = () => {
    setShowConfirmModal(false);
    onFinish(answers);
  };

  const renderQuestion = (question: Question, index: number) => {
    const studentAnswer = answers.find(a => a.questionId === question.id)?.answer ?? '';

    return (
      <div key={question.id} className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
        <p className="text-lg font-semibold text-gray-800 mb-4">
          <span className="text-blue-500 font-bold">Câu {index + 1}:</span> {question.questionText}
        </p>
        
        {question.type === QuestionType.FillInTheBlank && (
          <div>
            <label htmlFor={`q-${question.id}`} className="text-sm font-medium text-gray-500">Trả lời của con:</label>
            <input
              id={`q-${question.id}`}
              type="text"
              value={studentAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="mt-1 block w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              autoComplete="off"
            />
          </div>
        )}

        {question.type === QuestionType.MultipleChoice && question.options && (
          <div className="space-y-3 mt-2">
            {question.options.map(option => (
              <label key={option} className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-sky-50 transition-colors cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={studentAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-4 text-gray-800">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4 max-w-7xl mx-auto">
      {/* Top panel: Original exercise file */}
      <div className="flex-1 overflow-hidden border rounded-xl shadow-lg bg-gray-100 flex justify-center items-center p-2">
        {exercise.originalFile.type.startsWith('image/') ? (
          <img src={exercise.originalFile.dataUrl} alt="Bài tập gốc" className="max-w-full max-h-full object-contain" />
        ) : (
          <object data={exercise.originalFile.dataUrl} type={exercise.originalFile.type} className="w-full h-full">
            <p className="p-4 text-center text-gray-600">
                Trình duyệt không thể hiển thị file PDF.
                <a href={exercise.originalFile.dataUrl} download={exercise.originalFile.name} className="text-blue-600 hover:underline font-semibold ml-1">
                    Bấm vào đây để tải về.
                </a>
            </p>
          </object>
        )}
      </div>

      {/* Bottom panel: Questions */}
      <div className="flex-1 overflow-auto bg-sky-50 p-6 md:p-8 rounded-xl shadow-inner">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-sky-700 mb-2">{exercise.title}</h1>
        <p className="text-center text-gray-500 mb-6">Môn: {exercise.subject}</p>
        
        <div className="space-y-6">
          {exercise.questions.map(renderQuestion)}
        </div>
        
        <div className="text-center pt-8">
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
          >
            Hoàn thành bài
          </button>
        </div>
      </div>
      
      {showConfirmModal && (
        <Modal
            title="Chưa làm xong bài!"
            message="Con vẫn còn câu chưa điền đáp án. Con có chắc muốn nộp bài không?"
            onConfirm={confirmFinish}
            onCancel={() => setShowConfirmModal(false)}
            confirmText="Vẫn nộp bài"
            confirmColor="blue"
            cancelText="Làm tiếp"
        />
      )}
    </div>
  );
};

export default DoExercise;
