import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import plantsData from '../../data/plants.json';
import styles from './ListPlantsPage.module.css';
import { useNavigate } from 'react-router-dom';


type Plant = {
  id: string;
  nom_fr: string;
  nom_latin: string;
  // Ajoute d'autres propriétés si besoin
};

const ListPlantsPage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();


  // Convertir l'objet JSON en tableau
  const allPlants: Plant[] = Object.values(plantsData);

  // Filtrer les plantes en fonction de la recherche
 const filteredPlants = allPlants.filter((plant) => {
  const query = search.toLowerCase();
  return (
    plant.nom_fr.toLowerCase().includes(query) ||
    plant.nom_latin.toLowerCase().includes(query)
  );
});


  return (
    <div className={styles.container}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
  ← Retour
</button>

      <h1 className={styles.title}>🌿 Liste des plantes</h1>

      <input
        type="text"
        placeholder="Rechercher une plante..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />

      <div className={styles.grid}>
        {filteredPlants.map((plant) => (
          <Link
            key={plant.id}
            to={`/plant/${plant.id}`}
            className={styles.card}
          >
            <div className={styles.content}>
              <h3 className={styles.plantName}>{plant.nom_fr}</h3>
              <p className={styles.plantLatin}>{plant.nom_latin}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ListPlantsPage;
