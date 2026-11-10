import { useEffect } from 'react';
import { PageHeader } from '../components/Header';
import { PageHero } from '../components/ui';
import Footer from '../components/Footer';

const Placeholder = ({ children }) => (
  <p className="placeholder">{children}</p>
);

export default function News() {
  useEffect(() => {
    document.title = 'Latest News – GCare';
  }, []);

  return (
    <div className="page">
      <PageHeader />

      <main className="page__main">
        <PageHero title="Latest News" />

        <div className="page-content page-content--news">
          {/* "See all alerts" in the landing pop-up links to /news#alerts */}
          <section id="alerts" className="news-section">
            <h2 className="news-section__title">Alerts</h2>
            <Placeholder>Active alerts will appear here.</Placeholder>
          </section>

          <section id="news" className="news-section">
            <h2 className="news-section__title">News</h2>
            <Placeholder>News and updates from the GCare team will appear here.</Placeholder>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
