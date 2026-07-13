import { ReactNode } from 'react';
import { BrandHeader } from './BrandHeader';

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="border-b border-stone-200 bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <BrandHeader compact />
        </div>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-130px)] max-w-6xl items-start justify-center px-4 pt-12 pb-8 sm:px-6 lg:pt-14 lg:pb-10">
        <div className="w-full max-w-[520px]">{children}</div>
      </div>
      <footer className="pb-8 text-center text-sm text-slate-500">
        <p>© 2026 Stella Maris College (Autonomous).</p>
        <p>Developed & Maintained by SMC IT Team.</p>
      </footer>
    </div>
  );
}
