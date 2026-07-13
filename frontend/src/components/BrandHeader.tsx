export function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 ${
        compact ? 'justify-center' : 'justify-center sm:justify-start'
      } text-center sm:text-left`}
    >
      <img
        src="/logo.webp"
        alt="Stella Maris College"
        className={compact ? 'h-8 w-8 object-contain sm:h-10 sm:w-10' : 'h-10 w-10 object-contain sm:h-12 sm:w-12'}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
      <div className={compact ? 'text-center' : 'text-center sm:text-left'}>
        <p className="font-display text-xl leading-none text-accent sm:text-3xl">
          STELLA MARIS COLLEGE
        </p>
        <p className="mt-1 font-display text-base leading-none text-accent sm:text-xl">
          (AUTONOMOUS), CHENNAI, INDIA
        </p>
      </div>
    </div>
  );
}
