import React from 'react';
import styles from './UnlockableSeriesCard.module.css';

interface Progression {
  status: string;
  score?: number;
}

interface Serie {
  id: string;
  titre: string;
  description: string;
}

interface UnlockableSeriesCardProps {
  serie: Serie;
  progression?: Progression;
  isUnlocked: boolean;
  onClick: () => void;
}

const UnlockableSeriesCard: React.FC<UnlockableSeriesCardProps> = ({ serie, progression, isUnlocked, onClick }) => {
  const score = progression?.score ?? 0;

  return (
    <div
      className={`${styles.card} ${!isUnlocked ? styles.locked : ''}`}
      onClick={() => {
        if (isUnlocked) onClick();
        else alert('Cette série est bloquée. Terminez les séries précédentes pour la débloquer !');
      }}
      style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isUnlocked) {
          onClick();
        }
      }}
    >
      <h2>{serie.titre}</h2>
      <p>{serie.description}</p>

      {typeof progression?.score === 'number' && (
        <div className={styles.stars}>
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i}>{i < score ? '⭐' : '☆'}</span>
          ))}
        </div>
      )}

      {!isUnlocked && <span className={styles.lockIcon}>🔒</span>}
    </div>
  );
};

export default UnlockableSeriesCard;
