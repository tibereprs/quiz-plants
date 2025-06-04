import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import styles from './fetchImages.module.css';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Props = {
  plantId: string;
  className?: string;
};

const FetchImages: React.FC<Props> = ({ plantId, className }) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pour gérer la lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/image/${plantId}`);
        if (!res.ok) throw new Error("Impossible de charger les images");
        const data = await res.json();

        const urls: string[] = Object.values(data.urls).flat();
        setImages(urls);
      } catch (err) {
        setError("Erreur lors du chargement des images.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [plantId]);

  if (loading) return <p>Chargement des images...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (images.length === 0) return <p>Aucune image disponible.</p>;

  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
  };

return (
  <>
    <div className={className ?? styles['fetch-images-slider']}>
      <Slider {...settings}>
        {images.map((url, index) => (
          <div key={index}>
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className={styles['fetch-images-slider-img']}
              onClick={() => setLightboxIndex(index)}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
          </div>
        ))}
      </Slider>
    </div>

    {lightboxIndex !== null && (
      <>
        <div
          onClick={() => setLightboxIndex(null)}
          className={styles['lightbox-overlay']}
        >
          <img
            src={images[lightboxIndex]}
            alt={`Image agrandie ${lightboxIndex + 1}`}
            className={styles['lightbox-image']}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        </div>
        <div
          onClick={() => setLightboxIndex(null)}
          className={styles['close-button']}
          aria-label="Fermer la fenêtre d'image agrandie"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setLightboxIndex(null);
          }}
        >
          &times;
        </div>
      </>
    )}
  </>
);

};

export default FetchImages;
