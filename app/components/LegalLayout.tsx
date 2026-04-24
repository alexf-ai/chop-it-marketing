import type { ReactNode } from 'react';

import Nav from './Nav';
import Footer from './Footer';

const DEFAULT_ACCENT = '#E8547A';

type LegalLayoutProps = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <>
      <Nav accent={DEFAULT_ACCENT} />
      <main className="section legal">
        <header className="legal-head">
          <h1 className="h-editorial">{title}</h1>
          <div className="legal-sub mono">Last updated {lastUpdated}</div>
        </header>
        <div className="legal-body">{children}</div>
        <div className="legal-note">
          This policy will be expanded before public launch.
        </div>
      </main>
      <Footer />
    </>
  );
}
