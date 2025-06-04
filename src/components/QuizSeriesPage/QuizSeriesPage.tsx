// src/pages/QuizSeriesPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizSeriesPage.module.css';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { query, orderBy } from 'firebase/firestore'; // 🔹 à ajouter si pas encore importé


interface Serie {
  id: string;
  titre: string;
  description: string;
  prerequis?: string[];
}

interface ProgressionMap {
  [serieId: string]: {
    status: string;
  };
}

const QuizSeriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<Serie[]>([]);
  const [progression, setProgression] = useState<ProgressionMap>({});
  const [isLoading, setIsLoading] = useState(true);
  

  const isSerieUnlocked = (serie: Serie): boolean => {
    if (!serie.prerequis || serie.prerequis.length === 0) return true;

    console.log("Progression debug:", progression);


    return serie.prerequis.every(reqId => {
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
          return;
        }

        const seriesQuery = query(collection(db, 'quiz_series'), orderBy('ordre'));
        const snapshot = await getDocs(seriesQuery);
        // 🔹 Récupérer toutes les séries
        const allSeries: Serie[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Serie[];
        allSeries.sort((a, b) => (a.ordre ?? 999) - (b.ordre ?? 999));

        setSeries(allSeries);

        // 🔹 Récupérer la progression de l'utilisateur
        const progSnapshot = await getDocs(collection(db, `users/${user.uid}/progression_quiz_series`));
        const progressionData: ProgressionMap = {};
        progSnapshot.docs.forEach(doc => {
          progressionData[doc.id] = doc.data() as any;
        });
        setProgression(progressionData);

        console.log("Séries chargées:", allSeries);
        console.log("Progression utilisateur:", progressionData);


      } catch (error) {
        console.error("Erreur lors du chargement des séries ou progression :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <p className={styles.loading}>Chargement des séries...</p>;

  return (
    <div className={styles.container}>
      <button 
        onClick={() => navigate('/')}
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        ← Retour à l’accueil
      </button>
      <h1>Choisis ta série de quiz</h1>
      <div className={styles.grid}>
        {series.map((serie) => {
          const debloquee = isSerieUnlocked(serie);
          return (
            <div
              key={serie.id}
              className={`${styles.card} ${!debloquee ? styles.locked : ''}`}
              onClick={() => {
                if (!debloquee) {
                  alert('Cette série est bloquée. Terminez les séries précédentes pour la débloquer !');
                  return;
                }
                navigate(`/quiz/serie/${serie.id}?langue=fr`);
              }}
              style={{ cursor: debloquee ? 'pointer' : 'not-allowed' }}
            >
              <h2>{serie.titre}</h2>
              <p>{serie.description}</p>
            {typeof progression[serie.id]?.score === 'number' && (
              <div
                className={styles.stars}
                aria-label={`Score: ${progression[serie.id]?.score ?? 0} étoiles sur 3`}
              >
                {Array.from({ length: 3 }, (_, i) => {
                  const score = Number(progression[serie.id]?.score ?? 0);
                  return (
                    <span key={i}>
                      {i < score ? '⭐' : '☆'}
                    </span>
                  );
                })}
              </div>
            )}
              {!debloquee && <span className={styles.lockIcon}>🔒</span>}
            </div>
          );
        })}
      </div>
    </div>

  );
};

export default QuizSeriesPage;
