import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PlantInfo.module.css';
import FetchImages from '../FetchImages/FetchImages';


interface Plant {
  id: string;
  nom_fr: string;
  nom_latin: string;
  description: string;
  imageId: string;
  famille: string;
  genre_fr: string;
  genre_latin: string;
  espece_fr: string;
  espece_latin: string;
  categorie: string;
  port: string;
  feuillage_persistance: string;
  exposition: string[];
  entretien: string;
  toxicite: string;
  [key: string]: any; // pour autres propriétés dynamiques
}

interface PlantInfoProps {
  plant: Plant;
}

function monthName(num: number): string {
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return months[num - 1] || '';
}

const AccordionSection: React.FC<{title: string}> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <section className={styles.section}>
      <h2 onClick={() => setOpen(!open)} style={{cursor: 'pointer'}}>
        {title} {open ? '▲' : '▼'}
      </h2>
      {open && <div>{children}</div>}
    </section>
  );
};



const PlantInfo: React.FC<PlantInfoProps> = ({ plant }) => {
   const navigate = useNavigate();  // Hook ici, à l'intérieur du composant


  if (!plant) {
    return <p>Plante introuvable ou en cours de chargement...</p>;
  };

  return (
    <div className={styles.container}>
        <button
            className={styles.backButton}
            onClick={() => navigate(-1)}  // Retour page précédente
        >
        ← Précédent
      </button>
      <header className={styles.header}>
        <h1 className={styles.title}>{plant.nom_fr}</h1>
        <p className={styles.subtitle}>{plant.nom_latin}</p>
         {/* Slider juste sous le titre */}
        <FetchImages plantId={plant.imageId} />
      </header>
        <section>
            <h2>Identification</h2>
            <p><strong>Indice d’identification :</strong> {plant.indice_identification}</p>
            <p><strong>Particularités du feuillage :</strong> {plant.particularites_feuillage}</p>
        </section>


        <section>
            <h2>Caractéristiques botaniques</h2>
            <ul>
            <li>Famille : {plant.famille}</li>
            <li>Genre (FR) : {plant.genre_fr}</li>
            <li>Genre (latin) : {plant.genre_latin}</li>
            <li>Espèce (FR) : {plant.espece_fr}</li>
            <li>Espèce (latin) : {plant.espece_latin}</li>
            <li>Type de feuillage : {plant.type_feuillage}</li>
            <li>Dimensions : hauteur {plant.hauteur?.join(' - ')} m, largeur {plant.largeur?.join(' - ')} m</li>
            </ul>
        </section>

        <AccordionSection title="Floraison">
            <ul>
            <li>Dates : {plant.date_floraison ? plant.date_floraison.map(m => monthName(m)).join(' - ') : 'N/A'}</li>
            <li>Saison : {plant.saison_floraison?.join(', ')}</li>
            <li>Fréquence : {plant.frequence_floraison}</li>
            <li>Durée : {plant.duree_floraison_jours} jours</li>
            <li>Forme : {plant.forme_floraison}</li>
            <li>Couleur : {plant.couleur_floraison?.join(', ')}</li>
            <li>Odeur : {plant.odeur_floraison}</li>
            <li>Présence de fruits : {plant.fruit_present ? 'Oui' : 'Non'}</li>
            </ul>
       </AccordionSection>

        <AccordionSection title="Culture & Entretien">
            <ul>
            <li>Rusticité : {plant.rusticite} °C</li>
            <li>Type de sol : {plant.type_sol}</li>
            <li>Exposition : {plant.exposition?.join(', ')}</li>
            <li>Entretien : {plant.entretien}</li>
            <li>Besoin en eau : {plant.besoin_en_eau}</li>
            <li>Croissance : {plant.croissance}</li>
            <li>Difficulté : {plant.difficulty}</li>
            <li>Mode de reproduction : {plant.mode_reproduction}</li>
            </ul>
       </AccordionSection>


        <AccordionSection title="Ecologie & Usages">
            <ul>
            <li>Toxicité : {plant.toxicite}</li>
            <li>Allergénicité : {plant.allergenicite}</li>
            <li>Mellifère : {plant.mellifere ? 'Oui' : 'Non'}</li>
            <li>Utilisations : {plant.utilisations?.join(', ')}</li>
            <li>Biotope : {plant.biotope?.join(', ')}</li>
            <li>Résistance à la pollution : {plant.resistance_pollution}</li>
            <li>Sensibilité aux maladies : {plant.sensibilite_aux_maladies}</li>
            </ul>
       </AccordionSection>

        <AccordionSection title="Distribution">
            <ul>
            <li>Origine : {plant.origine}</li>
            <li>Répartition géographique : {plant.repartition_geographique?.join(', ')}</li>
            <li>Cycle de vie : {plant.cycle_de_vie}</li>
            <li>Statut de conservation : {plant.statut_conservation}</li>
            <li>Date d’ajout : {plant.date_ajout}</li>
            </ul>
       </AccordionSection>


        <AccordionSection title="Variantes proches">
            <ul>
            {plant.choices?.map(choice => (
                <li key={choice.nom_latin}>{choice.nom_fr} ({choice.nom_latin})</li>
            ))}
            </ul>
       </AccordionSection>

    </div>
  );
};

export default PlantInfo;
