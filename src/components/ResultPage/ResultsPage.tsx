import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ResultPage.module.css';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useEffect } from 'react';


const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const {
    score = 0,
    total = 0,
    categorie = '',
    sousCategorie = '',
    langue = 'fr',
    responses = [],
    serieId = null, // 👈 ici
    from = '', 
  } = location.state || {};
  const ratio = total === 0 ? 0 : score / total;
console.log('je viens de ici')
console.log(from)

  const getMessage = () => {
    if (ratio === 1) return "🎉 Parfait ! Tu connais toutes les plantes !";
    if (ratio >= 0.8) return "👏 Très bien joué !";
    if (ratio >= 0.5) return "🙂 Pas mal, continue comme ça !";
    return "🤔 Ça peut s'améliorer, rejoue pour progresser !";
  };

const handleReplay = () => {
  if (serieId) {
    // Rejouer une série
    navigate(`/quiz/serie/${serieId}?langue=${langue}`);
  } else {
    // Rejouer une catégorie classique
    const queryParams = new URLSearchParams();
    if (sousCategorie) queryParams.append('sousCategorie', sousCategorie);
    if (langue) queryParams.append('langue', langue);
    navigate(`/quiz/categorie/${categorie}?${queryParams.toString()}`);
  }
};


useEffect(() => {
  const enregistrerProgression = async () => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user || !serieId) return;

    // 🔸 Convertir le ratio en étoiles
    const getEtoiles = (ratio: number): number => {
      console.log(ratio)
      if (ratio >= 0.9) return 3;
      if (ratio >= 0.7) return 2;
      if (ratio >= 0.3) return 1;
      return 0;
    };

    const etoiles = getEtoiles(ratio);

    // 🔹 Créer l'objet à sauvegarder
    const data: any = {
      score: etoiles,
      completedAt: new Date(),
    };

    // 🔹 Ajouter le statut 'completed' SEULEMENT si 2 étoiles ou +
    if (etoiles >= 2) {
      data.status = 'completed';
    }

    try {
      await setDoc(
        doc(db, `users/${user.uid}/progression_quiz_series`, serieId),
        data
      );
      console.log(`✅ Progression enregistrée (${etoiles} étoiles) pour la série ${serieId}`);
    } catch (err) {
      console.error("❌ Erreur lors de l'enregistrement :", err);
    }
  };

  enregistrerProgression();
}, []);



  return (
    <div className={styles['result-page']}>
      <h2>Résultats</h2>
      <p className={styles.scoreText}>
        Ton score est de <strong>{score}</strong> sur <strong>{total}</strong>
      </p>
      <p className={styles.message}>{getMessage()}</p>

      <div>
        <button className={styles.toggleButton} onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Cacher le résumé des réponses' : 'Voir le résumé des réponses'}
        </button>
      </div>

      {showDetails && (
        <div className={styles['responses-summary']}>
          {responses && responses.length > 0 ? (
            <ul>
              {responses.map((resp, index) => (
                <li key={index} className={styles.responseItem}>
                  <strong>Q:</strong> {resp.question} <br />
                  <strong>Ta réponse:</strong>{' '}
                  <span className={resp.givenAnswer === resp.correctAnswer ? styles.correct : styles.incorrect}>
                    {resp.givenAnswer}
                  </span>{' '}
                  | <strong>Réponse correcte:</strong> {resp.correctAnswer}
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucun résumé disponible.</p>
          )}
        </div>
      )}

      <div className={styles['buttons-container']}>
          {from === '/profile' && (
            <button onClick={() => navigate('/profile')}>Retour au profil</button>
          )}

          {from.startsWith('/quiz/serie') && (
            <button onClick={() => navigate('/quizseries')}>Retour aux séries</button>
          )}

            <button onClick={() => navigate('/')}>Retour à l'accueil</button>
      </div>
    </div>
  );
};

export default ResultPage;
