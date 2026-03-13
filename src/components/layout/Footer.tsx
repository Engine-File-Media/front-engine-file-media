import logotipos from '../../assets/FIGMA/Logo de Marcas/Logotipos.png';

const Footer = () => {
  return (
    <footer className="w-full bg-[#2B2B2B] flex flex-col items-center py-16 md:py-20 px-6">
      <p
        className="m-0 text-center text-[17px] font-medium leading-4.5 uppercase text-[#B0B0B1]"
        style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '1.5px' }}
      >
        Archive material for vol. i was contributed by:
      </p>

      <img
        src={logotipos}
        alt="Brand logos"
        className="mt-16 md:mt-28 w-full max-w-257 h-auto object-contain"
      />
    </footer>
  );
};

export default Footer;