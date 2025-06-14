// src/pages/QuizSeriesPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizSeriesPage.module.css';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ProgressBarSeries from '../ProgressBar/ProgressBarSeries';
import ListCategorySeries from '../Categories/ListCategorySeries';
import UnlockableSeriesCard from './UnlockableSeriesCard';




const CATEGORIES = ['Arbre', 'Arbuste', 'Vivace', 'Annuelle', 'Bulbe & Rhizome'];



interface Serie {
  id: string;
  titre: string;
  description: string;
  prerequis?: string | string[];
  categorie: string;
}

interface ProgressionMap {
  [serieId: string]: {
    status: string;
    score?: number;
  };
}

const fetchAllSeries = async (db: any) => {
  const colRef = collection(db, 'quiz_series');
  const q = query(colRef, orderBy('ordre'));

  const snapshot = await getDocs(q);
  const series = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      ordre: typeof data.ordre === 'string' ? parseInt(data.ordre) : data.ordre ?? 999,
    };
  });

  series.sort((a, b) => a.ordre - b.ordre);
  return series;
};




const QuizSeriesPage: React.FC = () => {

  const navigate = useNavigate();
  const [series, setSeries] = useState<Serie[]>([]);
  const [progression, setProgression] = useState<ProgressionMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  

const isSerieUnlocked = (serie: Serie): boolean => {
  if (!serie.prerequis) return true;

  // Transformer en tableau si c'est une string
  const prerequisArray = Array.isArray(serie.prerequis) ? serie.prerequis : [serie.prerequis];

  return prerequisArray.every(reqId => {
    const progress = progression[reqId];
    return progress && progress.status === 'completed' && progress.score >= 2;
  });
};



useEffect(() => {
  const fetchData = async () => {
    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

    if (!user) {
      alert('Utilisateur non connecté');
      setIsLoading(false);
      return;
    }

      const allSeries = await fetchAllSeries(db);
      setSeries(allSeries);

      const progSnapshot = await getDocs(collection(db, `users/${user.uid}/progression_quiz_series`));
      const progressionData: ProgressionMap = {};
      progSnapshot.docs.forEach(doc => {
        progressionData[doc.id] = doc.data() as any;
      });
      setProgression(progressionData);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);



  if (isLoading) return <p className={styles.loading}>Chargement des séries...</p>;


const getProgressForCategory = (category: string) => {
  const filteredSeries = series.filter(s => s.categorie === category);
  const completed = filteredSeries.filter(s => {
    const prog = progression[s.id];
    return prog && prog.status === 'completed' && prog.score >= 2;
  }).length;
  return { completed, total: filteredSeries.length };
};

// Si une catégorie est sélectionnée, calcule sa progression spécifique
const { completed: completedInCategory, total: totalInCategory } = selectedCategory
  ? getProgressForCategory(selectedCategory)
  : { completed: 0, total: 0 };

const progressPercentInCategory = totalInCategory > 0
  ? (completedInCategory / totalInCategory) * 100
  : 0;



return (
  <div className={styles.container}>
    <button 
      onClick={() => navigate('/')}
      style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
    >
      ← Retour à l’accueil
    </button>

    {!selectedCategory ? (
      <ListCategorySeries
        categories={CATEGORIES}
        getProgressForCategory={getProgressForCategory}
        onSelectCategory={setSelectedCategory}
      />
    ) : (
      <>
        <button onClick={() => setSelectedCategory(null)} className={styles.backButton}>
          ← Changer de catégorie
        </button>
        <h1>Séries de la catégorie : {selectedCategory}</h1>

        <ProgressBarSeries
        completed={completedInCategory}
        total={totalInCategory}
        />
        
        <div className={styles.grid}>
          {series
            .filter(serie => serie.categorie === selectedCategory)
            .map(serie => {
              const debloquee = isSerieUnlocked(serie);
              return (
                <UnlockableSeriesCard
                  key={serie.id}
                  serie={serie}
                  progression={progression[serie.id]}
                  isUnlocked={debloquee}
                  onClick={() => navigate(`/quiz/serie/${serie.id}?langue=fr`)}
                />
              );
            })}
        </div>

      </>
    )} {/* fermeture du bloc conditionnel */}
  </div>
); // ← fermeture correcte du return JSX
};

export default QuizSeriesPage;

