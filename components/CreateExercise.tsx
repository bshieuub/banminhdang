import React, { useState } from 'react';
import { createExerciseFromFile } from '../services/geminiService';
import { Exercise } from '../types';
import { RocketIcon } from './icons/RocketIcon';

interface CreateExerciseProps {
  onExerciseCreated: (exercise: Exercise) => void;
  onCancel: () => void;
}

const CreateExercise: React.FC<CreateExerciseProps> = ({ onExerciseCreated, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Vui lòng chọn một file ảnh hoặc PDF!');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newExercise = await createExerciseFromFile(file);
      onExerciseCreated(newExercise);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-sky-700 mb-6">Tạo Bài Tập Mới</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="file-upload" className="block text-lg font-medium text-gray-700 mb-2">Tải ảnh hoặc PDF bài tập:</label>
          
          {file && (
            <div className="mb-4 p-4 border rounded-md text-center bg-gray-50">
                {preview ? (
                    <img src={preview} alt="Xem trước" className="mx-auto max-h-48 w-auto rounded-md object-contain" />
                ) : (
                    <div className="py-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
                        </svg>
                        <p className="mt-2 text-sm text-gray-600 font-medium">{file.name}</p>
                    </div>
                )}
            </div>
          )}

          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {!file && (
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>{file ? 'Chọn file khác' : 'Tải lên một file'}</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*,application/pdf" onChange={handleFileChange} />
                </label>
                {!file && <p className="pl-1">hoặc kéo và thả</p>}
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF tối đa 10MB</p>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-full transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
             <><span className="w-5 h-5 mr-2"><RocketIcon /></span> Bắt đầu tạo</>
            )}
          </button>
        </div>
        {isLoading && <p className="text-sm text-center text-gray-500 mt-2">AI đang đọc bài tập, chờ một chút nhé...</p>}
      </div>
    </div>
  );
};

export default CreateExercise;