// src/components/SubCategorySelector.tsx
import React from 'react';
import BackButton from './BackButton/BackButton';


type SousCategorie = {
  value: string;
  label: string;
};

type Props = {
  categoryName: string;
  sousCategories: SousCategorie[];
  onSelect: (sousCategorie: string) => void;
  onBack: () => void;
};

const SubCategorySelector: React.FC<Props> = ({
  categoryName,
  sousCategories,
  onSelect,
  onBack,
}) => {
  return (
    <>
      <BackButton onClick={onBack} label="Retour aux catégories" />
      <h2>Sous-catégories de {categoryName}</h2>
      <ul>
        {sousCategories.map(sc => (
          <li key={sc.value}>
            <button onClick={() => onSelect(sc.value)}>
              {sc.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SubCategorySelector;
