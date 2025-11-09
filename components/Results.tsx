import React, { useState, useEffect } from 'react';
import { getEncouragement, EncouragementResponse } from '../services/geminiService';
import { StarIcon } from './icons/StarIcon';

interface ResultsProps {
  score: {
    correct: number;
    total: number;
  };
  onBack: () => void;
  onReview: () => void;
}

const Results: React.FC<ResultsProps> = ({ score, onBack, onReview }) => {
  const [encouragement, setEncouragement] = useState<EncouragementResponse>({ text: 'Đang nghĩ lời khen cho con...', imageUrl: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEncouragement = async () => {
      setIsLoading(true);
      const message = await getEncouragement(score.correct, score.total);
      setEncouragement(message);
      setIsLoading(false);
    };

    fetchEncouragement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);
  
  const percentage = score.total > 0 ? (score.correct / score.total) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl transform transition-all hover:scale-105">
        <div className="w-24 h-24 mx-auto text-yellow-400 animate-pulse">
            <StarIcon />
        </div>
        <h1 className="text-4xl font-bold text-green-600 mt-4">Hoàn thành!</h1>
        <p className="text-2xl font-semibold text-gray-700 mt-6">
          Điểm của con: <span className="text-blue-500">{score.correct} / {score.total}</span>
        </p>
         <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
            <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full" 
                style={{ width: `${percentage}%` }}>
            </div>
        </div>

        <div className="mt-8 p-6 bg-sky-50 rounded-lg min-h-[200px] flex flex-col items-center justify-center">
          {isLoading ? (
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          ) : (
            <>
                {encouragement.imageUrl && (
                    <img 
                        src={encouragement.imageUrl} 
                        alt="Hình ảnh động viên" 
                        className="max-w-xs w-full h-auto object-contain rounded-lg shadow-md mb-6"
                    />
                )}
                <p className="text-xl italic text-sky-800 text-center">"{encouragement.text}"</p>
            </>
          )}
        </div>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onReview}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg w-full sm:w-auto order-1 sm:order-2"
          >
            Xem lại bài
          </button>
          <button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg w-full sm:w-auto order-2 sm:order-1"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;