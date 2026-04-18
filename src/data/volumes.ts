import { assetsUrls } from '../assets';

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
      { src: assetsUrls.volumeI.bookMockupCovers, alt: 'Volume I - Book mockup covers' },
      { src: assetsUrls.volumeI.indiceImage, alt: 'Volume I - Indice spread' },
      { src: assetsUrls.volumeI.capituloAudiImage, alt: 'Volume I - Audi chapter spread' },
      { src: assetsUrls.volumeI.introduccionImage, alt: 'Volume I - Introduction spread' },
      { src: assetsUrls.volumeI.toyotaCelicaImage, alt: 'Volume I - Toyota Celica ST205 spread' },
    ],
  },
};

export const resolveVolumeConfig = (volumeId?: string) => {
  if (!volumeId) {
    return VOLUME_CONFIGS[DEFAULT_VOLUME_ID];
  }

  return VOLUME_CONFIGS[volumeId] ?? VOLUME_CONFIGS[DEFAULT_VOLUME_ID];
};
