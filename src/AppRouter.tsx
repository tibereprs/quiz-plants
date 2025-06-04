// AppRouter.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Quiz from './Quiz';
import ResultatsPage from './ResultsPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/quiz/:categorie" element={<Quiz />} />
      <Route path="/resultats" element={<ResultatsPage />} />
    </Routes>
  );
};

export default AppRouter;
