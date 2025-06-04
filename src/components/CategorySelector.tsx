// src/components/CategorySelector.tsx
import React from 'react';

type SousCategorie = {
  value: string;
  label: string;
};

type Category = {
  nom: string;
  label: string;
  sousCategories: SousCategorie[];
};

type Props = {
  categories: Category[];
  onSelect: (categoryName: string) => void;
};

const CategorySelector: React.FC<Props> = ({ categories, onSelect }) => {
  return (
    <>
      <h1>Choisis ta catégorie</h1>
      <ul>
        {categories.map(cat => (
          <li key={cat.nom}>
            <button onClick={() => onSelect(cat.nom)}>
              {cat.label}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default CategorySelector;
