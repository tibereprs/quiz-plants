// AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';  // <-- ici, bien importer BrowserRouter
import HomePage from './components/HomePage/HomePage';
import Quiz from './components/Quiz/Quiz';
import ResultatsPage from './components/ResultPage/ResultsPage';
import AuthPage from './components/AuthPage/AuthPage';
import ProfilePage from './components/ProfilePage/ProfilePage';
import { AuthProvider } from './context/AuthContext';  // <-- Ajouter cet import
import QuizSeriesPage from './components/QuizSeriesPage/QuizSeriesPage'; // Ajuste le chemin si besoin
import PlantInfoPage from './components/PlantInfo/PlantInfoPage';
import ListPlantsPage from './components/PlantInfo/ListPlantsPage';


const AppRouter = () => {
  return (
      <AuthProvider>
      <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />   {/* route pour /auth */}
      <Route path="/quiz/categorie/:categorie" element={<Quiz />} />
      <Route path="/quiz/serie/:serieId" element={<Quiz />} />
      <Route path="/resultats" element={<ResultatsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/quizseries" element={<QuizSeriesPage />} />
      <Route path="/plant/" element={<ListPlantsPage />} />
      <Route path="/plant/:id" element={<PlantInfoPage />} />
    </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRouter;
