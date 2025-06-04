import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage/HomePage';
import Quiz from './components/Quiz/Quiz';
import AuthPage from "./components/AuthPage/AuthPage";  // <-- ton formulaire d'auth
import { AuthProvider } from './context/AuthContext';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />   {/* route pour /auth */}
          <Route path="/quiz/:categorie" element={<Quiz />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
