import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import Quiz from './Quiz';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:categorie" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
