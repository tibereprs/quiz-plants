import React from 'react';
import styles from './ProgressBarSeries.module.css';

interface Props {
  completed: number;
  total: number;
}

const ProgressBarSeries: React.FC<Props> = ({ completed, total }) => {
  const percent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressText}>
        Progression : {completed} / {total} séries terminées
      </div>
      <div className={styles.progressBarBackground}>
        <div className={styles.progressBarFill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default ProgressBarSeries;
