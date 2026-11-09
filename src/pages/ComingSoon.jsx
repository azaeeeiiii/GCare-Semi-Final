import { useEffect } from 'react';
import { PageHeader } from '../components/Header';
import { PageHero } from '../components/ui';
import Footer from '../components/Footer';

export default function ComingSoon() {
  useEffect(() => {
    document.title = 'Coming soon – GCare';
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="flex-1">
        <PageHero title="Coming soon" />
        <div className="mx-auto max-w-[1040px] px-[clamp(16px,4vw,40px)] py-8">
          <p className="m-0 rounded-[14px] border-2 border-dashed border-[#cfd4de] p-[22px] text-[15px] text-muted">
            This page hasn&apos;t been built yet.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
