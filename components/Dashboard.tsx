
import React, { useState } from 'react';
import { Exercise, Subject } from '../types';
import { RocketIcon } from './icons/RocketIcon';
import { StarIcon } from './icons/StarIcon';
import { TrashIcon } from './icons/TrashIcon';
import { BookIcon } from './icons/BookIcon';
import Modal from './Modal';

interface DashboardProps {
  exercises: Exercise[];
  onStartExercise: (id: string) => void;
  onDeleteExercise: (id: string) => void;
  onCreateNew: () => void;
}

const SubjectIcon: React.FC<{ subject: Subject }> = ({ subject }) => {
  const baseClasses = "w-8 h-8 mr-3";
  switch (subject) {
    case Subject.Toan:
      return <div className={`text-blue-500 ${baseClasses}`}> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm3-6h.008v.008H11.25v-.008Zm0 3h.008v.008H11.25v-.008Zm0 3h.008v.008H11.25v-.008Zm3-6h.008v.008H14.25v-.008Zm0 3h.008v.008H14.25v-.008Zm0 3h.008v.008H14.25v-.008ZM3.375 21h17.25c1.14 0 2.063-.923 2.063-2.062V8.312c0-1.14-.923-2.063-2.063-2.063H3.375c-1.14 0-2.063.923-2.063 2.063v10.625C1.312 20.077 2.235 21 3.375 21Z" /></svg></div>;
    case Subject.TiengViet:
      return <div className={`text-green-500 ${baseClasses}`}><BookIcon /></div>;
    case Subject.TiengAnh:
      return <div className={`text-orange-500 ${baseClasses}`}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" /></svg></div>;
    default:
      return <div className={`text-gray-500 ${baseClasses}`}><StarIcon /></div>;
  }
};


const Dashboard: React.FC<DashboardProps> = ({ exercises, onStartExercise, onDeleteExercise, onCreateNew }) => {
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  const subjects = Object.values(Subject);
  const groupedExercises = subjects.reduce((acc, subject) => {
    const filtered = exercises.filter(ex => ex.subject === subject);
    if (filtered.length > 0) {
      acc[subject] = filtered;
    }
    return acc;
  }, {} as Record<Subject, Exercise[]>);
  
  const subjectOrder = [Subject.Toan, Subject.TiengViet, Subject.TiengAnh, Subject.Khac];

  const handleDeleteClick = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
  };

  const confirmDelete = () => {
    if (exerciseToDelete) {
      onDeleteExercise(exerciseToDelete.id);
      setExerciseToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <button
          onClick={onCreateNew}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
        >
          <span className="w-6 h-6 mr-2"><RocketIcon /></span>
          Tạo bài tập mới
        </button>
        <p className="text-gray-500 mt-2">Tải ảnh bài tập lên để bắt đầu cuộc phiêu lưu!</p>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-700">Chưa có bài tập nào!</h2>
          <p className="text-gray-500 mt-2">Bấm nút "Tạo bài tập mới" để thêm bài tập cho Minh Đăng nhé.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {subjectOrder.map(subject => 
            groupedExercises[subject] && (
            <div key={subject}>
              <h2 className="text-2xl font-bold text-sky-700 mb-4 flex items-center">
                <SubjectIcon subject={subject} /> {subject}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedExercises[subject].map(ex => (
                  <div key={ex.id} className="bg-white rounded-xl shadow-lg p-5 flex flex-col justify-between transition-shadow hover:shadow-2xl">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{ex.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{ex.questions.length} câu hỏi</p>
                        <p className="text-xs text-gray-400 mt-1">Tạo ngày: {new Date(ex.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="flex justify-end items-center mt-4 space-x-2">
                       <button
                        onClick={() => handleDeleteClick(ex)}
                        className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                        aria-label="Xóa bài tập"
                      >
                       <TrashIcon />
                      </button>
                      <button
                        onClick={() => onStartExercise(ex.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-transform transform hover:scale-105"
                      >
                        Làm bài
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )
          )}
        </div>
      )}

      {exerciseToDelete && (
        <Modal
          title="Xác nhận xóa"
          message={`Bạn có chắc muốn xóa bài tập "${exerciseToDelete.title}" không?`}
          onConfirm={confirmDelete}
          onCancel={() => setExerciseToDelete(null)}
          confirmText="Xóa"
          confirmColor="red"
        />
      )}
    </div>
  );
};

export default Dashboard;
