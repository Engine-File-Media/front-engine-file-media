import bookMockupCovers from '../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/BOOK-MOCKUP-COVERS.webp';
import indiceImage from '../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/INDICE.webp';
import capituloAudiImage from '../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/CAPITULO AUDI.webp';
import introduccionImage from '../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/introduccion.webp';
import toyotaCelicaImage from '../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/TOYOTA-CELICA-ST205.webp';

export type VolumeGalleryImage = {
  src: string;
  alt: string;
};

export type VolumeConfig = {
  id: string;
  bookId: string;
  title: string;
  galleryTitle: string;
  gallerySubtitle: string;
  galleryImages: VolumeGalleryImage[];
};

export const DEFAULT_VOLUME_ID = 'volume-i';

const VOLUME_CONFIGS: Record<string, VolumeConfig> = {
  'volume-i': {
    id: 'volume-i',
    bookId: 'volume-i',
    title: 'Volume I',
    galleryTitle: 'Volume I Gallery',
    gallerySubtitle: 'Preview of selected spreads and cover mockups.',
    galleryImages: [
      { src: bookMockupCovers, alt: 'Volume I - Book mockup covers' },
      { src: indiceImage, alt: 'Volume I - Indice spread' },
      { src: capituloAudiImage, alt: 'Volume I - Audi chapter spread' },
      { src: introduccionImage, alt: 'Volume I - Introduction spread' },
      { src: toyotaCelicaImage, alt: 'Volume I - Toyota Celica ST205 spread' },
    ],
  },
};

export const resolveVolumeConfig = (volumeId?: string) => {
  if (!volumeId) {
    return VOLUME_CONFIGS[DEFAULT_VOLUME_ID];
  }

  return VOLUME_CONFIGS[volumeId] ?? VOLUME_CONFIGS[DEFAULT_VOLUME_ID];
};
