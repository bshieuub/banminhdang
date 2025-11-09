import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, Subject, View, StudentAnswer } from './types';
import { getExercises, saveExercises } from './services/storageService';
import Dashboard from './components/Dashboard';
import CreateExercise from './components/CreateExercise';
import DoExercise from './components/DoExercise';
import Results from './components/Results';
import Header from './components/Header';
import { RocketIcon } from './components/icons/RocketIcon';
import ReviewExercise from './components/ReviewExercise';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Dashboard);
  const [exercises, setExercisesState] = useState<Exercise[]>([]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[] | null>(null);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    const loadedExercises = getExercises();
    setExercisesState(loadedExercises);
  }, []);

  const setExercises = (newExercises: Exercise[]) => {
    saveExercises(newExercises);
    setExercisesState(newExercises);
  };

  const handleCreateExercise = (newExercise: Exercise) => {
    const updatedExercises = [...exercises, newExercise];
    setExercises(updatedExercises);
    setView(View.Dashboard);
  };

  const handleStartExercise = (exerciseId: string) => {
    const exerciseToStart = exercises.find(ex => ex.id === exerciseId);
    if (exerciseToStart) {
      setActiveExercise(exerciseToStart);
      setView(View.DoExercise);
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    const updatedExercises = exercises.filter(ex => ex.id !== exerciseId);
    setExercises(updatedExercises);
  };

  const handleFinishExercise = (answers: StudentAnswer[]) => {
    if (!activeExercise) return;
    
    let correctCount = 0;
    activeExercise.questions.forEach((q, index) => {
        const studentAnswer = answers.find(a => a.questionId === q.id)?.answer ?? '';
        if (q.correctAnswer.toLowerCase().trim() === studentAnswer.toString().toLowerCase().trim()) {
            correctCount++;
        }
    });

    setStudentAnswers(answers);
    setScore({ correct: correctCount, total: activeExercise.questions.length });
    setView(View.Results);
  };

  const handleBackToDashboard = () => {
    setActiveExercise(null);
    setScore(null);
    setStudentAnswers(null);
    setView(View.Dashboard);
  };

  const handleReviewExercise = () => {
    setView(View.ReviewExercise);
  };

  const renderView = () => {
    switch (view) {
      case View.CreateExercise:
        return <CreateExercise onExerciseCreated={handleCreateExercise} onCancel={() => setView(View.Dashboard)} />;
      case View.DoExercise:
        return activeExercise && <DoExercise exercise={activeExercise} onFinish={handleFinishExercise} />;
      case View.Results:
        return score && <Results score={score} onBack={handleBackToDashboard} onReview={handleReviewExercise} />;
      case View.ReviewExercise:
        return activeExercise && studentAnswers && (
            <ReviewExercise 
                exercise={activeExercise} 
                answers={studentAnswers} 
                onBack={handleBackToDashboard} 
            />
        );
      case View.Dashboard:
      default:
        return (
          <Dashboard
            exercises={exercises}
            onStartExercise={handleStartExercise}
            onDeleteExercise={handleDeleteExercise}
            onCreateNew={() => setView(View.CreateExercise)}
          />
        );
    }
  };
  
  const isSplitView = view === View.DoExercise || view === View.ReviewExercise;

  return (
    <div className="bg-sky-50 min-h-screen text-gray-800 flex flex-col">
      <Header />
      <main className={`container mx-auto p-4 md:p-8 ${isSplitView ? 'flex-1' : ''}`}>
        {renderView()}
      </main>
      <footer className="text-center p-4 text-sky-600">
        <p>Làm với thật nhiều tình yêu cho bạn Minh Đăng <span className="inline-block animate-pulse">❤️</span></p>
      </footer>
    </div>
  );
};

export default App;
