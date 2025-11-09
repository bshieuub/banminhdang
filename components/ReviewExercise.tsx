import React from 'react';
import { Exercise, QuestionType, StudentAnswer } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { CrossIcon } from './icons/CrossIcon';

interface ReviewExerciseProps {
  exercise: Exercise;
  answers: StudentAnswer[];
  onBack: () => void;
}

const ReviewExercise: React.FC<ReviewExerciseProps> = ({ exercise, answers, onBack }) => {
    const isCorrect = (question: Exercise['questions'][0], studentAnswer: string): boolean => {
        return question.correctAnswer.toLowerCase().trim() === studentAnswer.toString().toLowerCase().trim();
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

            {/* Bottom panel: Review content */}
            <div className="flex-1 overflow-auto bg-white p-6 md:p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl md:text-3xl font-bold text-center text-sky-700 mb-2">Xem lại: {exercise.title}</h1>
                <p className="text-center text-gray-500 mb-6">Môn: {exercise.subject}</p>
                
                <div className="space-y-6">
                    {exercise.questions.map((q, index) => {
                        const studentAnswerObj = answers.find(a => a.questionId === q.id);
                        const studentAnswer = studentAnswerObj ? studentAnswerObj.answer : '';
                        const correct = isCorrect(q, studentAnswer);
                        
                        const containerClasses = correct
                            ? 'border-green-300 bg-green-50'
                            : 'border-red-300 bg-red-50';

                        return (
                            <div key={q.id} className={`p-4 rounded-lg border ${containerClasses} transition-all`}>
                                <div className="flex justify-between items-start">
                                    <p className="text-lg font-semibold text-gray-800 mb-4 flex-1 pr-4">
                                        <span className="text-blue-500 font-bold">Câu {index + 1}:</span> {q.questionText}
                                    </p>
                                    <div className="flex-shrink-0">
                                    {correct ? (
                                        <span className="w-8 h-8 text-green-500 ml-4 flex items-center justify-center bg-white rounded-full shadow-md"><CheckIcon className="w-6 h-6" /></span>
                                    ) : (
                                        <span className="w-8 h-8 text-red-500 ml-4 flex items-center justify-center bg-white rounded-full shadow-md"><CrossIcon className="w-6 h-6" /></span>
                                    )}
                                    </div>
                                </div>
                                
                                {q.type === QuestionType.FillInTheBlank && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Câu trả lời của con:</label>
                                        <input
                                            type="text"
                                            value={studentAnswer}
                                            disabled
                                            className={`mt-1 block w-full md:w-1/2 px-4 py-2 bg-white border rounded-md shadow-sm cursor-not-allowed ${correct ? 'border-green-400' : 'border-red-400'}`}
                                        />
                                        {!correct && (
                                            <p className="mt-2 text-sm text-green-800 font-semibold bg-green-100 p-2 rounded-md">
                                              Đáp án đúng: <span className="font-bold">{q.correctAnswer}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {q.type === QuestionType.MultipleChoice && (
                                    <div className="space-y-3 mt-2">
                                        {q.options?.map(option => {
                                            const isStudentChoice = studentAnswer === option;
                                            const isCorrectChoice = q.correctAnswer === option;
                                            
                                            let optionClasses = 'border-gray-300 bg-white opacity-70';
                                            if (isStudentChoice && !correct) {
                                                optionClasses = 'border-red-500 bg-red-100 ring-2 ring-red-400';
                                            } else if (isCorrectChoice) {
                                                optionClasses = 'border-green-500 bg-green-100 ring-2 ring-green-400';
                                            }

                                            return (
                                                <label key={option} className={`flex items-center p-3 rounded-md border transition-all cursor-not-allowed ${optionClasses}`}>
                                                    <input
                                                        type="radio"
                                                        name={`${q.id}-review`}
                                                        value={option}
                                                        checked={isStudentChoice}
                                                        disabled
                                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-400"
                                                    />
                                                    <span className="ml-4 text-gray-800">{option}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className="text-center pt-8">
                    <button
                        onClick={onBack}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewExercise;