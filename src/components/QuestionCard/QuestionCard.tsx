import React, { useEffect, useState } from 'react';
import styles from './QuestionCard.module.css';
import { useAuth } from "../../context/AuthContext";
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import FetchImages from '../fetchImages/fetchImages.tsx';

type QuestionCardProps = {
  question: string;
  image: string; // tu peux garder si tu veux fallback ou historique
  choices: string[];
  answer: string;
  selectedAnswer: string;
  answered: boolean;
  description?: string;
  onSelectAnswer: (choice: string) => void;
  onNext: () => void;
  plantId: string;
  indiceIdentification: string;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  image,
  choices,
  answer,
  selectedAnswer,
  answered,
  description,
  onSelectAnswer,
  onNext,
  plantId,
  indiceIdentification
}) => {
  const [visible, setVisible] = useState(false);
  const { user } = useAuth();

  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);



  useEffect(() => {
            console.log(indiceIdentification)

    setVisible(false);
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  }, [question]);

  const getButtonStyle = (choice: string) => {
    if (!answered) return '';
    if (choice === answer) return styles.correct;
    if (choice === selectedAnswer) return styles.incorrect;
    return '';
  };
  
 const handleSendReport = async () => {
  if (!reportText.trim()) {
    alert("Merci de décrire le problème.");
    return;
  }

  try {
    await fetch('http://localhost:3001/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: user?.email || 'anonyme',
        question,
        plantId,
        reportText,
      }),
    });

    setReportSent(true);
    setTimeout(() => setReportSent(false), 10000); // 👈 Désactivation temporaire 10s

    alert("Merci, votre message a été envoyé.");
    setShowReport(false);
    setReportText('');
  } catch (error) {
    console.error("Erreur lors de l'envoi :", error);
    alert("Une erreur est survenue. Réessayez plus tard.");
  }
};



  return (
    <div className={`${styles['card-container']} ${visible ? styles.visible : ''}`}>
      <h2>{question}</h2>

      {/* Ici on utilise le slider dynamique */}
      <FetchImages plantId={plantId} className={styles['plant-image-slider']} />

      {user && (
        <div className={styles['favorite-container']}>
          <FavoriteButton plantId={plantId} />
        </div>
      )}

      <div className={styles['choices-grid']}>
        {choices.map((choice, index) => (
          <button
            key={index}
            className={`${styles['choice-button']} ${getButtonStyle(choice)}`}
            onClick={() => onSelectAnswer(choice)}
            disabled={answered}
          >
            {choice}
          </button>
        ))}
      </div>

      {!reportSent ? (
        <button className={styles['report-link']} onClick={() => setShowReport(true)}>
          Signaler une erreur
        </button>
      ) : (
        <span className={styles['report-confirmed']}>⏳ Signalement enregistré</span>
      )}


      {showReport && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal']}>
            <h3>Signaler une erreur</h3>
            <textarea
              placeholder="Décrivez le problème rencontré..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className={styles['report-textarea']}
            />
            <div className={styles['modal-buttons']}>
              <button onClick={handleSendReport}>Envoyer</button> {/* 👈 c’est ici qu’on appelle handleSendReport */}
              <button onClick={() => setShowReport(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}


      {answered && (
        <>
          <div className={styles['description-box']}>
            <h3>Description</h3>
            <p>{description}</p>
            <p className={styles['indiceText']}>
      🧠      🧠 Indice d’identification : {indiceIdentification}
            </p>
          </div>
          <button
            className={`${styles['next-button']} ${visible ? styles.visible : ''}`}
            onClick={onNext}
          >
            Suivant
          </button>
        </>
      )}
    </div>
  );
};

export default QuestionCard;
