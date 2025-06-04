import React from 'react';
import styles from './BackButton.module.css';

type Props = {
  onClick: () => void;
  label?: string; // Par défaut : 'Retour'
};

const BackButton: React.FC<Props> = ({ onClick, label = 'Retour' }) => {
  return (
    <button className={styles['back-button']} onClick={onClick}>
      ← {label}
    </button>
  );
};

export default BackButton;
