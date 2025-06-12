import React, { useState, useEffect } from 'react'; 
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase-config';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import BackButton from '../BackButton/BackButton';
import ProgressBar from '../ProgressBar/ProgressBar';
import QuestionCard from '../QuestionCard/QuestionCard';
import styles from './Quiz.module.css';

function normalizeString(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

type Response = {
  question: string;
  givenAnswer: string;
  correctAnswer: string;
};

const Quiz: React.FC = () => {
  const { user, loading } = useAuth();

  const { categorie, serieId } = useParams<{ categorie?: string; serieId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const sousCategorie = queryParams.get('sousCategorie');
  const dossierId = queryParams.get('dossierId');
  const langue = queryParams.get('langue') || 'fr';

  const [plants, setPlants] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [dossierNom, setDossierNom] = useState<string>('Nom inconnu');
  const [isSerieUnlocked, setIsSerieUnlocked] = useState<boolean>(true); // Par défaut accessible si pas de série

  // **AJOUT** : état pour stocker le titre de la série
  const [serieTitre, setSerieTitre] = useState<string | null>(null);

  // Vérification d'accès à la série si besoin
  useEffect(() => {
    const checkSerieAccess = async () => {
      if (loading) return; // Ne rien faire tant que le chargement est en cours

      if (!user) {
        alert('Veuillez vous connecter');
        navigate('/auth');
        return;
      }

      if (serieId) {
        setIsSerieUnlocked(false); // Bloqué le temps de vérifier
        setIsLoading(true);

        try {
          const serieRef = doc(db, 'quiz_series', serieId);
          const serieSnap = await getDoc(serieRef);

          if (!serieSnap.exists()) {
            alert('Série non trouvée');
            navigate('/quiz-series');
            return;
          }

          const serieData = serieSnap.data();
          const prerequisites: string[] = serieData.prerequisites || [];

          if (prerequisites.length > 0) {
            // Vérifier si tous les prérequis sont complétés
            const userProgPromises = prerequisites.map(preqId =>
              getDoc(doc(db, `users/${user.uid}/progression_quiz_series/${preqId}`))
            );

            const userProgDocs = await Promise.all(userProgPromises);

            const allCompleted = userProgDocs.every(docSnap => docSnap.exists() && docSnap.data()?.status === 'completed');

            if (!allCompleted) {
              alert('Cette série est bloquée. Terminez les séries précédentes pour la débloquer !');
              navigate('/quiz-series');
              return;
            }
          }

          // Série débloquée
          setIsSerieUnlocked(true);
        } catch (error) {
          console.error('Erreur lors de la vérification d’accès à la série', error);
          alert('Erreur lors de la vérification d’accès à la série');
          navigate('/quiz-series');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Pas de série, quiz accessible directement
        setIsSerieUnlocked(true);
        setIsLoading(false);
      }
    };

    checkSerieAccess();
  }, [serieId, user, loading, navigate]);

  // **AJOUT** : useEffect pour récupérer le titre de la série à partir de Firestore
  useEffect(() => {
    if (!serieId) {
      setSerieTitre(null);
      return;
    }

    const fetchSerieTitre = async () => {
      try {
        const serieRef = doc(db, 'quiz_series', serieId);
        const serieSnap = await getDoc(serieRef);

        if (serieSnap.exists()) {
          const data = serieSnap.data();
          setSerieTitre(data.titre || 'Titre inconnu');
        } else {
          setSerieTitre('Série non trouvée');
        }
      } catch (error) {
        console.error('Erreur récupération titre série:', error);
        setSerieTitre('Erreur lors du chargement');
      }
    };

    fetchSerieTitre();
  }, [serieId]);

  // Fonction pour récupérer les plantes une fois série débloquée
  const fetchPlants = async () => {
    setIsLoading(true);
    try {
      let selectedPlants: any[] = [];

      if (serieId) {
        const serieRef = doc(db, 'quiz_series', serieId);
        const serieSnap = await getDoc(serieRef);

        if (serieSnap.exists()) {
          const serieData = serieSnap.data();
          const plantIds = serieData.plantsId || [];

          const plantsPromises = plantIds.map(async (plantId: string) => {
            const plantDoc = await getDoc(doc(db, 'plants', plantId));
            if (plantDoc.exists()) {
              return { id: plantDoc.id, ...plantDoc.data() };
            }
            return null;
          });

          const plantsData = await Promise.all(plantsPromises);
          selectedPlants = plantsData.filter(p => p !== null);
        }
      } else if (dossierId && user) {
        const favsSnapshot = await getDocs(collection(db, 'users', user.uid, 'favorites-plants'));
        const favoris = favsSnapshot.docs.map(doc => doc.data());
        const favorisPourDossier = favoris.filter(fav => fav.dossierId === dossierId);
        const plantIds = favorisPourDossier.map(fav => fav.idPlante);

        if (favorisPourDossier.length > 0 && favorisPourDossier[0].dossierNom) {
          setDossierNom(favorisPourDossier[0].dossierNom);
        }

        const plantsSnapshot = await getDocs(collection(db, 'plants'));
        const allPlants = plantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        selectedPlants = allPlants.filter(plant => plantIds.includes(plant.id));
      } else {
        const querySnapshot = await getDocs(collection(db, 'plants'));
        const allPlants = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const catNormalized = normalizeString(categorie ?? '');

        let sousCatArray: string[] = [];
        if (typeof sousCategorie === 'string' && sousCategorie.trim() !== '' && normalizeString(sousCategorie) !== 'tous') {
          sousCatArray = [normalizeString(sousCategorie)];
        }

        selectedPlants = allPlants.filter(plant => {
          const plantCatNorm = normalizeString(plant.categorie || '');
          if (plantCatNorm !== catNormalized) return false;

          let plantSousCats: string[] = [];
          if (typeof plant.sousCategorie === 'string') {
            plantSousCats = [normalizeString(plant.sousCategorie)];
          } else if (Array.isArray(plant.sousCategorie)) {
            plantSousCats = plant.sousCategorie.map((sc: string) => normalizeString(sc));
          }

          if (sousCatArray.length === 0) return true;
          return plantSousCats.some(psc => sousCatArray.some(sc => psc.includes(sc) || sc.includes(psc)));
        });
      }

      // Formatage pour quiz
      const quizPlants = selectedPlants.map(data => {
        const isLatin = langue === 'latin';
        const choicesArray = Array.isArray(data.choices)
          ? data.choices.map(choice =>
              typeof choice === 'string'
                ? choice
                : isLatin ? choice.nom_latin || '' : choice.nom_fr || ''
            )
          : Object.values(data.choices || {}).map((choiceObj: any) =>
              isLatin ? choiceObj.nom_latin || '' : choiceObj.nom_fr || ''
            );

        return {
          question: data.question || '',
          image: data.image || '',
          choices: choicesArray,
          answer: isLatin ? data.nom_latin || '' : data.nom_fr || '',
          description: data.description,
          plantId: data.id,
          indiceIdentification: data.indice_identification || '' 

        };
      });

      setPlants(shuffleArray(quizPlants));
    } catch (error) {
      console.error("Erreur lors de la récupération des plantes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement des plantes uniquement si série débloquée
  useEffect(() => {
    if (isSerieUnlocked) {
      fetchPlants();
    }
  }, [isSerieUnlocked, categorie, sousCategorie, langue, dossierId, serieId, user?.uid]);

  useEffect(() => {
    if (plants.length > 0 && currentQuestion < plants.length) {
      const plantData = plants[currentQuestion];
      const originalChoices = [...new Set([...plantData.choices, plantData.answer])];
      setShuffledChoices(shuffleArray(originalChoices));
    }
  }, [currentQuestion, plants]);

  useEffect(() => {
    if (plants.length > 0 && currentQuestion === plants.length) {
      navigate('/resultats', {
        state: {
          score,
          total: plants.length,
          categorie: categorie ?? '',
          sousCategorie: sousCategorie ?? '',
          langue: langue ?? 'fr',
          responses,
          serieId,
          from: location.pathname,
        }
      });
    }
  }, [currentQuestion, plants, score, navigate, categorie, sousCategorie, langue]);

  const handleAnswer = (choice: string) => {
    const currentPlant = plants[currentQuestion];
    setResponses(prev => [...prev, {
      question: currentPlant.question,
      givenAnswer: choice,
      correctAnswer: currentPlant.answer,
    }]);

    if (answered) return;
    setSelectedAnswer(choice);
    setAnswered(true);
    if (choice === currentPlant.answer) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setSelectedAnswer('');
    setAnswered(false);
  };

  if (isLoading) return <p className={styles.loading}>Chargement des plantes...</p>;

  if (!isSerieUnlocked) {
    return (
      <div className={styles['no-access']}>
        <p>Cette série est bloquée. Terminez les séries précédentes pour la débloquer !</p>
        <BackButton onClick={() => navigate('/quiz-series')} label="Retour aux séries" />
      </div>
    );
  }

  if (!isLoading && plants.length === 0) {
    return (
      <div className={styles['no-results']}>
        <p>Aucun résultat trouvé pour cette sélection.</p>
        <BackButton onClick={() => navigate('/')} label="Retour aux catégories" />
      </div>
    );
  }

  if (currentQuestion === plants.length) return null;

  const plantData = plants[currentQuestion];

  return (
    <div className={styles.quiz}>
      <BackButton onClick={() => navigate(-1)} label="Retour" />
      <h2 className={styles.title}>
        {serieId
          ? `Série: ${serieTitre ?? 'Chargement...'}`
          : `${categorie} ${sousCategorie || ''} ${dossierNom !== 'Nom inconnu' ? `(Dossier: ${dossierNom})` : ''}`}
      </h2>
      <ProgressBar current={currentQuestion} total={plants.length} />

      <QuestionCard
        question={plantData.question}
        image={plantData.image}
        choices={shuffledChoices}
        selectedAnswer={selectedAnswer}
        answer={plantData.answer}
        onSelectAnswer={handleAnswer} 
        answered={answered}
        onNext={nextQuestion}
        plantId={plantData.plantId}
        description={plantData.description}
        indiceIdentification={plantData.indiceIdentification}
      />
      <p>Score: {score} / {plants.length}</p>
    </div>
  );
};

export default Quiz;
