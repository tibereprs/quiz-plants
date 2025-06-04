import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase/firebase-config';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './App.css';


function normalizeString(str: string) {
  return str
    .normalize("NFD") // décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .toLowerCase();
}

  const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

  const Quiz: React.FC = () => {
  const { categorie } = useParams<{ categorie: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer sousCategorie dans query params
  const queryParams = new URLSearchParams(location.search);
  const sousCategorie = queryParams.get('sousCategorie');

  const [plants, setPlants] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);


useEffect(() => {
  const fetchPlants = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "plants"));
      const allPlants = querySnapshot.docs.map(doc => doc.data());

      const catNormalized = normalizeString(categorie ?? '');

      let sousCatArray: string[] = [];
      if (typeof sousCategorie === 'string' && sousCategorie.trim() !== '') {
        sousCatArray = [normalizeString(sousCategorie)];
      } else if (Array.isArray(sousCategorie)) {
        sousCatArray = sousCategorie.map(sc => normalizeString(sc));
      }

  const filteredPlants = allPlants.filter(plant => {
  if (!plant.categorie) return false;

  // Normalisation
  const plantCatNorm = normalizeString(plant.categorie);
  const catNorm = catNormalized;
  if (plantCatNorm !== catNorm) return false;

  let plantSousCats: string[] = [];
  if (typeof plant.sousCategorie === 'string') {
    plantSousCats = [normalizeString(plant.sousCategorie)];
  } else if (Array.isArray(plant.sousCategorie)) {
    plantSousCats = plant.sousCategorie.map((sc: string) => normalizeString(sc));
  }

  if (sousCatArray.length === 0) return true;

  // Cette ligne change : on vérifie si la sous-catégorie demandée est contenue dans celle de la plante, ou inversement
  const matchesSousCat = plantSousCats.some(psc =>
    sousCatArray.some(sc => psc.includes(sc) || sc.includes(psc))
  );

  return matchesSousCat;
});



      console.log("Plantes filtrées:", filteredPlants);

      const plantData = filteredPlants.map(data => ({
        question: data.question,
        image: data.image,
        choices: data.choices,
        answer: data.nom_fr,
      }));

      setPlants(shuffleArray(plantData));
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des plantes:", error);
    }
  };

  fetchPlants();
}, [categorie, sousCategorie]);
  useEffect(() => {
    if (plants.length > 0 && currentQuestion < plants.length) {
      const plantData = plants[currentQuestion];
      const originalChoices = plantData.choices.concat(plantData.answer);
      const shuffled = shuffleArray(originalChoices);
      setShuffledChoices(shuffled);
    }
  }, [currentQuestion, plants]);

  useEffect(() => {
    if (plants.length > 0 && currentQuestion === plants.length) {
      navigate('/resultats', { state: { score, total: plants.length } });
    }
  }, [currentQuestion, plants, score, navigate]);

  if (isLoading) return <p>Chargement des plantes...</p>;
  if (!isLoading && plants.length === 0) {
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <p>Aucun résultat trouvé pour cette catégorie ou sous-catégorie.</p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '1rem',
          backgroundColor: '#4db6ac',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
      >
        ← Retour aux catégories
      </button>
    </div>
  );
}

  if (currentQuestion === plants.length) return null;

  const plantData = plants[currentQuestion];

  const handleAnswer = (choice: string) => {
    if (answered) return;
    setSelectedAnswer(choice);
    setAnswered(true);
    if (choice === plantData.answer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer('');
    setAnswered(false);
  };

  const getButtonStyle = (choice: string) => {
    if (!answered) return '';
    if (choice === plantData.answer) return 'correct';
    if (choice === selectedAnswer) return 'incorrect';
    return '';
  };

return (
  <div>
    <button
      onClick={() => navigate('/')}
      style={{
        marginBottom: '1rem',
        backgroundColor: '#4db6ac',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
      }}
    >
      ← Retour aux catégories
    </button>

{/* Barre de progression */}
<div className="progress-container">
  <div
    className="progress-bar"
    style={{ width: `${((currentQuestion + 1) / plants.length) * 100}%` }}
  />
  <div className="progress-text">
    {Math.round(((currentQuestion + 1) / plants.length) * 100)}%
  </div>
</div>
<p>
  Question {currentQuestion + 1} sur {plants.length}
</p>


    <div className="card-container">
      <h2>{plantData.question}</h2>
      <img src={plantData.image} alt="Plante" className="plant-image" />
      <div className="choices-grid">
        {shuffledChoices.map((choice, index) => (
          <button
            key={index}
            className={`choice-button ${getButtonStyle(choice)}`}
            onClick={() => handleAnswer(choice)}
            disabled={answered}
          >
            {choice}
          </button>
        ))}
      </div>
      {answered && (
        <button className="next-button" onClick={nextQuestion}>
          Suivant
        </button>
      )}
    </div>
  </div>
);

};

export default Quiz;
