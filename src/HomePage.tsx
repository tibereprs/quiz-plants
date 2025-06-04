// src/HomePage.tsx (ou où tu as ta homepage)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    nom: 'Arbre',
    label: '🌳 Arbre',
    sousCategories: [
      { value: 'Tous', label: '🌐 Tous' },
      { value: 'Arbre fruitier', label: '🍎 Arbre fruitier' },
      { value: "Arbre d'ornement", label: '🌸 Arbre d\'ornement' },
      { value: 'Méllifère', label: '🐝 Méllifère' },
    ],
  },
  {
    nom: 'Arbuste',
    label: '🌿 Arbuste',
    sousCategories: [
      { value: 'Tous', label: '🌐 Tous' },
      { value: 'Plante médicinale', label: '🧴 Plante médicinale' },
      { value: 'Plante aromatique', label: '🌿 Plante aromatique' },
      { value: 'Méllifère', label: '🐝 Méllifère' },
    ],
  },
  {
    nom: 'Vivace',
    label: '🌱 Vivace',
    sousCategories: [
      { value: 'Tous', label: '🌐 Tous' },
      { value: 'Plante médicinale', label: '🧴 Plante médicinale' },
      { value: 'Plante aromatique', label: '🌿 Plante aromatique' },
      { value: 'Méllifère', label: '🐝 Méllifère' },
    ],
  },
  {
    nom: 'Annuelle',
    label: '🌸 Annuelle',
    sousCategories: [
      { value: 'Tous', label: '🌐 Tous' },
    ],
  },
  {
    nom: 'Bulbe',
    label: '💐 Bulbe',
    sousCategories: [
      { value: 'Tous', label: '🌐 Tous' },
    ],
  },
];


const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSousCategorieClick = (sousCategorie: string) => {
    if (!selectedCategory) return;
    // Navigue vers /quiz/:categorie avec query param sousCategorie si ce n'est pas 'Tous'
    const url = `/quiz/${encodeURIComponent(selectedCategory)}${sousCategorie !== 'Tous' ? `?sousCategorie=${encodeURIComponent(sousCategorie)}` : ''}`;
    navigate(url);
  };

  return (
    <div className="home-container">
  {!selectedCategory ? (
    <>
      <h1>Choisis ta catégorie</h1>
<ul>
  {categories.map(cat => (
    <li key={cat.nom}>
      <button onClick={() => setSelectedCategory(cat.nom)}>
        {cat.label}
      </button>
    </li>
  ))}
</ul>

    </>
  ) : (
    <>
      <button className="back-button" onClick={() => setSelectedCategory(null)}>← Retour aux catégories</button>
      <h2>Sous-catégories de {selectedCategory}</h2>
 <ul>
  {categories.find(cat => cat.nom === selectedCategory)?.sousCategories.map(sc => (
    <li key={sc.value}>
      <button onClick={() => handleSousCategorieClick(sc.value)}>
        {sc.label}
      </button>
    </li>
  ))}
</ul>

    </>
  )}
</div>


  );
};

export default HomePage;
