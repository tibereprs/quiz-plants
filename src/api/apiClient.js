const API_BASE_URL = "http://localhost:3001/api"; // utilise une variable d'env plus tard si tu déploies

// 🔍 Récupère les images pour une espèce
export async function fetchImagesById(imageId) {
  const response = await fetch(`${API_BASE_URL}/image/${imageId}`);
  if (!response.ok) {
    throw new Error("Erreur lors du chargement des images");
  }
  const data = await response.json();
  return data.urls; // ou retourne `data` selon ton usage
}

// 🧠 D’autres exemples si tu en ajoutes plus tard :

// export async function fetchAllSpecies() {...}
// export async function fetchQuizQuestionById(id) {...}
