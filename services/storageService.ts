
import { Exercise } from '../types';

const EXERCISES_KEY = 'minhDangExercises';

// This service simulates a backend like Supabase using the browser's localStorage.

export const getExercises = (): Exercise[] => {
  try {
    const exercisesJson = localStorage.getItem(EXERCISES_KEY);
    return exercisesJson ? JSON.parse(exercisesJson) : [];
  } catch (error) {
    console.error("Failed to load exercises from localStorage", error);
    return [];
  }
};

export const saveExercises = (exercises: Exercise[]): void => {
  try {
    const exercisesJson = JSON.stringify(exercises);
    localStorage.setItem(EXERCISES_KEY, exercisesJson);
  } catch (error) {
    console.error("Failed to save exercises to localStorage", error);
  }
};
