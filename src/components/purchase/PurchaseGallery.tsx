import type { VolumeGalleryImage } from '../../data/volumes';

type PurchaseGalleryProps = {
  volumeTitle: string;
  galleryTitle: string;
  gallerySubtitle: string;
  images: VolumeGalleryImage[];
  currentImageIndex: number;
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
};

function PurchaseGallery({
  volumeTitle,
  galleryTitle,
  gallerySubtitle,
  images,
  currentImageIndex,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onNextImage,
  onPrevImage,
}: PurchaseGalleryProps) {
  return (
    <>
      <section className="border border-black/10 p-5 md:p-6">
        <h3
          className="text-[26px] leading-none text-[#0A0A0A]"
          style={{ fontFamily: 'Crimson Text, serif' }}
        >
          {galleryTitle}
        </h3>

        <p
          className="mt-2 text-[14px] leading-[1.4] text-[#0A0A0A]/70"
          style={{ fontFamily: 'Crimson Text, serif' }}
        >
          {gallerySubtitle}
        </p>

        <div className="mt-5 space-y-3">
          <div className="relative border border-black/10 bg-[#FAFAFA]">
            <img
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt}
              onClick={onOpenModal}
              className="h-96 w-full cursor-pointer object-cover transition-opacity hover:opacity-95 md:h-120 xl:h-136"
            />
            <button
              onClick={onPrevImage}
              type="button"
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              aria-label="Previous image"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={onNextImage}
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              aria-label="Next image"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] text-[#0A0A0A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
              {currentImageIndex + 1} / {images.length}
            </span>
            <button
              onClick={onOpenModal}
              type="button"
              className="border-b border-black/10 pb-0.5 text-[12px] text-[#0A0A0A]/60 transition-colors hover:border-black/45 hover:text-[#0A0A0A]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              View fullscreen
            </button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onCloseModal}
        >
          <div
            className="relative flex h-full max-h-screen w-full max-w-5xl flex-col items-center justify-center bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={onCloseModal}
              className="absolute top-4 right-4 z-50 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
              aria-label="Close modal"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <img
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].alt}
              className="max-h-full max-w-full object-contain"
            />

            <button
              onClick={onPrevImage}
              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
              aria-label="Previous image"
              type="button"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={onNextImage}
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition-colors hover:bg-white/40"
              aria-label="Next image"
              type="button"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[14px] text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>
              {volumeTitle} {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PurchaseGallery;
