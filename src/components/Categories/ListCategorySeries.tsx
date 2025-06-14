import React from 'react';
import styles from './ListCategorySeries.module.css';

interface Props {
  categories: string[];
  getProgressForCategory: (category: string) => { completed: number; total: number };
  onSelectCategory: (category: string) => void;
}

const ListCategorySeries: React.FC<Props> = ({ categories, getProgressForCategory, onSelectCategory }) => {
  return (
    <div className={styles.categorySelector}>
      <h2>Choisis une catégorie</h2>
      <div className={styles.categoryGrid}>
        {categories.map(cat => {
          const { completed, total } = getProgressForCategory(cat);
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={styles.categoryCard}
            >
              <h3>{cat}</h3>
              <p>{completed} / {total} séries terminées</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ListCategorySeries;
