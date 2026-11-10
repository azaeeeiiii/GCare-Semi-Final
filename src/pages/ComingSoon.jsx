import { useEffect } from 'react';
import { PageHeader } from '../components/Header';
import { PageHero } from '../components/ui';
import Footer from '../components/Footer';

export default function ComingSoon() {
  useEffect(() => {
    document.title = 'Coming soon – GCare';
  }, []);

  return (
    <div className="page">
      <PageHeader />
      <main className="page__main">
        <PageHero title="Coming soon" />
        <div className="page-content">
          <p className="placeholder">This page hasn&apos;t been built yet.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
