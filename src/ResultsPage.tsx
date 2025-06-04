import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total } = location.state || { score: 0, total: 0 };

  return (
    <div className="card-container">
      <h2>Résultats</h2>
      <p>Votre score est de {score} sur {total}</p>
      <button onClick={() => navigate('/')}>Revenir à l'accueil</button>
    </div>
  );
};

export default ResultPage;
