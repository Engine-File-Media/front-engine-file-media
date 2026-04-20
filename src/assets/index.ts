const ASSET_BASE_URL = import.meta.env.VITE_ASSETS_BASE_URL;

const assetUrl = (path: string) => `${ASSET_BASE_URL}/${path}`;

export const assetsUrls = {
  home: {
    bgVideo: assetUrl('videos/Background%20EFM.mp4'),
    portada: assetUrl('fotografias/home/Portada.webp'),
  },
  brand: {
    logo: assetUrl('logos/EFM_SIN_TITULO.webp'),
    logotipos: assetUrl('logos/marcas/Logotipos.webp'),
  },
  about: {
    introHero: assetUrl('fotografias/about/rectangle71240-v8k8-800h.webp'),
    galleryA: assetUrl('fotografias/about/rectangle71242-2o3l-600w.webp'),
    galleryB: assetUrl('fotografias/about/rectangle81243-2t5r-600h.webp'),
    galleryC: assetUrl('fotografias/about/rectangle91244-06tk-600w.webp'),
    galleryD: assetUrl('fotografias/about/rectangle71246-2hs-400h.webp'),
    galleryE: assetUrl('fotografias/about/rectangle91247-3s6-400h.webp'),
    galleryF: assetUrl('fotografias/about/rectangle81248-v1bl-600w.webp'),
    wideImage: assetUrl('fotografias/about/rectangle71263-sl9i-800h.webp'),
  },
  volumeI: {
    bookMockupCovers: assetUrl('fotografias/volume-i/BOOK-MOCKUP-COVERS.webp'),
    indiceImage: assetUrl('fotografias/volume-i/INDICE.webp'),
    capituloAudiImage: assetUrl('fotografias/volume-i/CAPITULO%20AUDI.webp'),
    introduccionImage: assetUrl('fotografias/volume-i/introduccion.webp'),
    toyotaCelicaImage: assetUrl('fotografias/volume-i/TOYOTA-CELICA-ST205.webp'),
  },
};