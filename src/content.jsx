import { ContactLink, LegalRef } from './components/ui';

/* ===================== content.jsx =====================
   All editable text lives here: the alert/status shown on the landing page,
   and the Terms of Use / Privacy Policy wording.
   ======================================================= */

/*
 * ALERT DATA
 * Placeholder content. Later, replace this with a fetch() to your backend
 * so the banner and the pop-up show whatever the admin posts.
 * Example: fetch('/api/alerts/active').then(r => r.json()).then(setAlert)
 */
export const activeAlert = {
  level: 'Critical',
  headline: 'Heavy Rainfall Advisory',
  area: 'Batangas Province',
  issued: 'November 7, 2026  10:30 AM',
  body: [
    'Heavy to intense rainfall is expected over Batangas Province in the next 24 hours. Flooding and landslides are possible in low-lying and mountainous areas.',
    'Residents near rivers and slopes should prepare to evacuate. Keep your emergency kit ready, charge your phone, and follow instructions from your local DRRMO.',
  ],
};

/* Status line. Update from your backend / location check later. */
export const areaStatus = {
  text: 'No active emergency in your area',
  updated: 'November 7, 2026 3:39 PM',
};

/* ---------- TERMS OF USE + PRIVACY POLICY ---------- */

export const LEGAL = {
  terms: {
    title: 'Terms of Use',
    updated: 'Last updated: November 9, 2026',
    alsoRead: 'privacy',
    sections: [
      {
        id: 'acceptance',
        title: 'Acceptance of these terms',
        body: (
          <p>
            By creating an account or using GCare, you agree to these Terms of Use and to our{' '}
            <LegalRef to="privacy">Privacy Policy</LegalRef>. If you do not agree, please do not use the platform.
          </p>
        ),
      },
      {
        id: 'about',
        title: 'What GCare is',
        body: (
          <>
            <p>
              GCare is a community safety platform where people can view alerts, explore a safety map, report incidents
              and hazards, share verified information, and volunteer during emergencies.
            </p>
            <div className="callout">
              <strong>GCare is not an emergency service.</strong> In an emergency, call your local emergency hotline
              right away (in the Philippines, dial <strong>911</strong>). Do not wait for a GCare response.
            </div>
          </>
        ),
      },
      {
        id: 'accounts',
        title: 'Your account',
        body: (
          <p>
            You must give accurate information and keep your password private. You are responsible for everything that
            happens under your account. Tell us as soon as you think your account has been compromised.
          </p>
        ),
      },
      {
        id: 'reports',
        title: 'Reports and posts',
        body: (
          <>
            <p>Reports and posts must be truthful and made in good faith. When you submit one, you confirm that:</p>
            <ul>
              <li>the details are accurate to the best of your knowledge;</li>
              <li>you have the right to share any photos or content you upload;</li>
              <li>it does not expose another person&apos;s private information without a good reason.</li>
            </ul>
            <p>We may review, verify, edit, label or remove content, and we decide what appears on the feed and map.</p>
          </>
        ),
      },
      {
        id: 'conduct',
        title: 'What you must not do',
        body: (
          <>
            <ul>
              <li>Submit false or misleading reports, or fake emergencies.</li>
              <li>Harass, threaten or discriminate against others, or post hate speech.</li>
              <li>Post spam, advertisements or unrelated content.</li>
              <li>Try to break, overload or gain unauthorized access to GCare.</li>
              <li>Pretend to be an official agency, administrator or another person.</li>
            </ul>
            <p>Accounts that break these rules may be warned, limited or suspended.</p>
          </>
        ),
      },
      {
        id: 'alerts',
        title: 'Alerts and information',
        body: (
          <p>
            Alerts and advisories may come from administrators, official agencies or verified community reports. We work
            to keep them accurate and timely, but we cannot guarantee that every alert is complete, current or
            error-free. Always follow instructions from your local authorities.
          </p>
        ),
      },
      {
        id: 'volunteering',
        title: 'Volunteering',
        body: (
          <p>
            Volunteers act on their own responsibility. Put your safety first, follow instructions from local
            authorities, and never enter a dangerous area just to help. GCare does not employ or insure volunteers.
          </p>
        ),
      },
      {
        id: 'content',
        title: 'Your content',
        body: (
          <p>
            You keep ownership of what you post. By posting on GCare you allow us to display, store and share it on the
            platform and with response teams or authorities when needed to help people.
          </p>
        ),
      },
      {
        id: 'liability',
        title: 'Disclaimers and limits of liability',
        body: (
          <p>
            GCare is provided &quot;as is&quot; and &quot;as available&quot;. To the extent allowed by law, we are not
            liable for losses or damages that come from your use of, or reliance on, the platform, including delayed,
            missing or inaccurate information.
          </p>
        ),
      },
      {
        id: 'changes',
        title: 'Changes to these terms',
        body: (
          <p>
            We may update these terms from time to time. The date at the top shows when they last changed. Continuing to
            use GCare after an update means you accept the new terms.
          </p>
        ),
      },
      {
        id: 'law',
        title: 'Governing law',
        body: <p>These terms are governed by the laws of the Republic of the Philippines.</p>,
      },
      {
        id: 'contact',
        title: 'Contact us',
        body: (
          <p>
            Questions about these terms? Reach us through the <ContactLink />.
          </p>
        ),
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: November 9, 2026',
    alsoRead: 'terms',
    sections: [
      {
        id: 'collect',
        title: 'Information we collect',
        body: (
          <>
            <p>We collect only what we need to run GCare:</p>
            <ul>
              <li><strong>Account details:</strong> your name, email address and password (stored in protected form).</li>
              <li><strong>Reports you submit:</strong> descriptions, photos, time and location of the incident.</li>
              <li><strong>Location:</strong> your approximate or precise location, only if you allow it, to show nearby alerts and place reports on the map.</li>
              <li><strong>Technical data:</strong> basic device and browser information used to keep the site working and secure.</li>
            </ul>
          </>
        ),
      },
      {
        id: 'use',
        title: 'How we use your information',
        body: (
          <ul>
            <li>Create and secure your account.</li>
            <li>Show alerts, reports and safety information that are relevant to your area.</li>
            <li>Let you report incidents and join volunteer activities.</li>
            <li>Verify reports and prevent spam or abuse.</li>
            <li>Improve GCare and fix problems.</li>
          </ul>
        ),
      },
      {
        id: 'public',
        title: 'What other people can see',
        body: (
          <p>
            Incident reports may appear on the community feed and safety map. Your email address and password are never
            shown to other users.
          </p>
        ),
      },
      {
        id: 'sharing',
        title: 'Sharing',
        body: (
          <p>
            We do not sell your personal information. We may share report details with local authorities or response
            teams when it helps people in need, or when the law requires it.
          </p>
        ),
      },
      {
        id: 'retention',
        title: 'How long we keep it',
        body: (
          <p>
            We keep your information only as long as needed for the purposes above, or as the law requires. Reports that
            matter for safety records may be kept after your account is deleted, with personal details removed where
            possible.
          </p>
        ),
      },
      {
        id: 'security',
        title: 'Security',
        body: (
          <p>
            We use reasonable organizational and technical safeguards to protect your data. No system is perfectly
            secure, so please use a strong, unique password and keep it private.
          </p>
        ),
      },
      {
        id: 'rights',
        title: 'Your rights',
        body: (
          <>
            <p>Under the Philippine Data Privacy Act of 2012 (RA 10173) you may, among other rights:</p>
            <ul>
              <li>ask to see the personal data we hold about you;</li>
              <li>ask us to correct inaccurate data;</li>
              <li>object to certain uses of your data, or ask us to delete it;</li>
              <li>file a complaint with the National Privacy Commission.</li>
            </ul>
            <p>To use these rights, contact us using the details below.</p>
          </>
        ),
      },
      {
        id: 'children',
        title: 'Children',
        body: (
          <p>
            GCare is not meant for children under 13. If you believe a child has given us personal data, contact us and
            we will remove it.
          </p>
        ),
      },
      {
        id: 'cookies',
        title: 'Cookies and local storage',
        body: (
          <p>
            GCare may store small pieces of data in your browser, such as keeping you logged in or remembering
            preferences. You can clear this at any time from your browser settings.
          </p>
        ),
      },
      {
        id: 'changes',
        title: 'Changes to this policy',
        body: <p>We may update this policy from time to time. The date at the top shows when it last changed.</p>,
      },
      {
        id: 'contact',
        title: 'Contact us',
        body: (
          <p>
            Privacy questions or requests? Reach us through the <ContactLink />.
          </p>
        ),
      },
    ],
  },
};

/*
 * FEED REPORTS (placeholder). Later: fetch('/api/reports').then(r => r.json()).then(setNews)
 * `image` is optional: drop a photo in public/images/news/ and use '/images/news/name.jpg'.
 * `tone` is the colour of the placeholder tile and of the pin on the map.
 * `lat`/`lng` is where it happened (must be inside BOUNDARY in lib/serviceArea.js); `location` is the label.
 */
export const newsItems = [
  {
    id: 'rain-nov-7',
    tag: 'Weather',
    date: 'November 7, 2026',
    title: 'Heavy rainfall expected today in Batangas',
    excerpt: 'Residents across Batangas are advised to remain alert as periods of moderate to heavy rainfall are expected throughout the day.',
    body: 'Communities located near rivers, low-lying areas, and flood-prone zones are encouraged to monitor water levels, prepare emergency kits, and follow instructions from their local DRRMO.',
    image: '',
    tone: '#4a5d7a',
    location: 'Northern part of the subdivision',
    lat: 13.7876,
    lng: 121.0738,
  },
  {
    id: 'water-nov-6',
    tag: 'Water Interruption',
    date: 'November 6, 2026',
    title: 'Scheduled Water Service Interruption',
    excerpt: 'Water service may be temporarily unavailable in selected areas due to scheduled maintenance and system improvement works.',
    body: 'Residents within the affected areas are advised to store enough water for essential household needs before the interruption starts. Service will resume once the works are complete.',
    image: '',
    tone: '#2f7d8a',
    location: 'Central area',
    lat: 13.7858,
    lng: 121.0752,
  },
  {
    id: 'classes-nov-6',
    tag: 'Class Suspension',
    date: 'November 6, 2026',
    title: 'Classes Suspended Due to Severe Weather',
    excerpt: 'Classes in selected schools and educational institutions have been suspended due to expected severe weather conditions.',
    body: 'Parents and students are advised to wait for further announcements from their schools and local government before travelling.',
    image: '',
    tone: '#8a6a2f',
    location: 'Southern part of the subdivision',
    lat: 13.7845,
    lng: 121.0742,
  },
];
