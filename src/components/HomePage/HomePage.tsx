import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CategorySelector from '../CategorySelector';
import SubCategorySelector from '../SubCategorySelector';
import LanguageSelector from '../LanguageSelector';
import { categories } from '../../categories';
import { useAuth } from "../../context/AuthContext";
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'entrainement' | null>(null); // 👈 'quizseries' retiré
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSousCategorie, setSelectedSousCategorie] = useState<string | null>(null);
  const [langue, setLangue] = useState<'fr' | 'latin' | null>(null);
  const navigate = useNavigate();

  const handleRetour = () => {
    if (langue) {
      setLangue(null);
    } else if (mode === 'entrainement' && selectedSousCategorie) {
      setSelectedSousCategorie(null);
    } else if (mode === 'entrainement' && selectedCategory) {
      setSelectedCategory(null);
    } else {
      setMode(null);
    }
  };

  useEffect(() => {
    if (mode === 'entrainement' && selectedCategory && selectedSousCategorie && langue) {
      navigate(`/quiz/categorie/${encodeURIComponent(selectedCategory)}?sousCategorie=${encodeURIComponent(selectedSousCategorie)}&langue=${langue}`);
    }
  }, [mode, selectedCategory, selectedSousCategorie, langue, navigate]);

  return (
    <div className={styles['home-container']}>
      <div className={styles["user-icon-container"]}>
        {user ? (
          <Link to="/profile" title="Voir le profil">
            <img
              src={user.photoURL || "./../../public/images/default-avatar.png"}
              alt="Profil"
              className={styles["user-avatar"]}
            />
          </Link>
        ) : (
          <Link to="/auth" title="Se connecter">
            <img
              src="./../../public/images/default-avatar.png"
              alt="Se connecter"
              className={styles["user-avatar"]}
            />
          </Link>
        )}
      </div>

      {!mode ? (
        <>
          <h1>Bienvenue ! Choisis ton mode de jeu</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setMode('entrainement')}>🎯 Entraînement</button>
            <button onClick={() => navigate('/quizseries')}>🏆 Quiz séries</button> {/* 👈 redirection directe */}
          </div>
        </>
      ) : (
        !selectedCategory ? (
          <CategorySelector
            categories={categories}
            onSelect={setSelectedCategory}
          />
        ) : !selectedSousCategorie ? (
          <SubCategorySelector
            categoryName={selectedCategory}
            sousCategories={categories.find(cat => cat.nom === selectedCategory)?.sousCategories || []}
            onSelect={setSelectedSousCategorie}
            onBack={handleRetour}
          />
        ) : (
          <LanguageSelector
            onSelect={setLangue}
            onBack={handleRetour}
          />
        )
      )}
    </div>
  );
};

export default HomePage;
