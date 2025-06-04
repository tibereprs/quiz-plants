// src/components/LanguageSelector.tsx
import React from 'react';

type Props = {
  onSelect: (langue: 'fr' | 'latin') => void;
  onBack: () => void;
};

const LanguageSelector: React.FC<Props> = ({ onSelect, onBack }) => {
  return (
    <>
      <button className="back-button" onClick={onBack}>← Retour aux sous-catégories</button>
      <h2>Comment veux-tu jouer ?</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => onSelect('fr')}>🌼 Deviner en nom <strong>français</strong></button>
        <button onClick={() => onSelect('latin')}>🌿 Deviner en nom <strong>latin</strong></button>
      </div>
    </>
  );
};

export default LanguageSelector;
