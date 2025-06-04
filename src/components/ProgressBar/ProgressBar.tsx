import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progressPercent = total === 0 ? 0 : ((current + 1) / total) * 100;

  return (
    <div className={styles['progress-container']}>
      <div
        className={styles['progress-bar']}
        style={{ width: `${progressPercent}%` }}
      />
      <div className={styles['progress-text']}>
        {Math.round(progressPercent)}%
      </div>
    </div>
  );
};


export default ProgressBar;
