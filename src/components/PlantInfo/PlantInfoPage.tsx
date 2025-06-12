import React from 'react';
import { useParams } from 'react-router-dom';
import PlantInfo from './PlantInfo';
import plantsData from '../../data/plants.json'; // adapte chemin

const PlantInfoPage = () => {
  const { id } = useParams();

  if (!id) return <p>Plante non trouvée</p>;

  const plant = plantsData[id];

  if (!plant) return <p>Plante introuvable</p>;

  return (
    <div>
      <PlantInfo plant={plant} />
    </div>
  );
};

export default PlantInfoPage;
