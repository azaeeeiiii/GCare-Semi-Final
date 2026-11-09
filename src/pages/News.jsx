import { useEffect } from 'react';
import { PageHeader } from '../components/Header';
import { PageHero } from '../components/ui';
import Footer from '../components/Footer';

const Placeholder = ({ children }) => (
  <p className="m-0 rounded-[14px] border-2 border-dashed border-[#cfd4de] p-[22px] text-[15px] text-muted">
    {children}
  </p>
);

export default function News() {
  useEffect(() => {
    document.title = 'Latest News – GCare';
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />

      <main className="flex-1">
        <PageHero title="Latest News" />

        <div className="mx-auto max-w-[1040px] px-[clamp(16px,4vw,40px)] pb-14 pt-8">
          {/* "See all alerts" in the landing pop-up links to /news#alerts */}
          <section id="alerts" className="mb-9 scroll-mt-5">
            <h2 className="m-0 mb-2.5 text-[26px] font-extrabold">Alerts</h2>
            <Placeholder>Active alerts will appear here.</Placeholder>
          </section>

          <section id="news" className="mb-9 scroll-mt-5">
            <h2 className="m-0 mb-2.5 text-[26px] font-extrabold">News</h2>
            <Placeholder>News and updates from the GCare team will appear here.</Placeholder>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
