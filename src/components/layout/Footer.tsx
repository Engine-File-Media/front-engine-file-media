import logotipos from '../../assets/FIGMA/Logo de Marcas/Logotipos.png';

const Footer = () => {
  return (
    <footer className="w-full bg-white flex justify-center overflow-hidden">
      <div className="relative h-223.25 w-337.5">
        <div className="absolute -left-2.75 top-0 h-223.25 w-340.5 bg-[#2B2B2B]">
          <p
            className="absolute m-0 flex h-4.5 w-134.75 items-center justify-center text-center text-[17px] font-medium leading-4.5 uppercase text-[#B0B0B1]"
            style={{
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '1.5px',
              left: '411px',
              top: '57px',
            }}
          >
            Archive material for vol. i was contributed by:
          </p>

          <img
            src={logotipos}
            alt="Brand logos"
            className="absolute h-81.75 w-257 object-contain"
            style={{ left: '166px', top: '212px' }}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;