import logotipos from '../../assets/FIGMA/Logo de Marcas/Logotipos.webp';

const Footer = () => {
  return (
    <footer className="w-full bg-[#282828] flex flex-col items-center px-5.5 py-5.75 gap-10.5 md:bg-[#2B2B2B] md:py-20 md:px-6 md:gap-0">
      <p
        className="m-0 max-w-86.5 text-center text-[12.5px] font-medium leading-4.5 uppercase text-[#B0B0B1] md:max-w-none md:text-[17px] md:leading-4.5"
        style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '1.5px' }}
      >
        Archive material for vol. i was contributed by:
      </p>

      <img
        src={logotipos}
        alt="Brand logos"
        className="mx-auto block w-auto max-w-full h-auto object-contain md:mt-28"
      />
    </footer>
  );
};

export default Footer;