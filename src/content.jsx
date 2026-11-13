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
    updated: 'Last updated: November 13, 2026',
    alsoRead: 'privacy',
    sections: [
      {
        id: 'acceptance',
        title: 'Acceptance of These Terms',
        body: (
          <p>
            By creating an account or using GCare, you agree to follow these Terms of Use and our{' '}
            <LegalRef to="privacy">Privacy Policy</LegalRef>. If you do not agree with these terms, please do not use
            the platform.
          </p>
        ),
      },
      {
        id: 'about',
        title: 'About GCare',
        body: (
          <>
            <p>
              GCare is a community safety platform that allows users to view safety alerts, explore an interactive
              safety map, report incidents and hazards, share information, and participate in volunteer activities.
            </p>
            <div className="callout">
              <strong>GCare is not an emergency response service.</strong> In case of an emergency, contact your local
              emergency hotline immediately. In the Philippines, you may dial <strong>911</strong>. Do not rely on
              GCare as a substitute for emergency assistance.
            </div>
          </>
        ),
      },
      {
        id: 'accounts',
        title: 'User Accounts',
        body: (
          <p>
            Users must provide accurate information when registering and are responsible for keeping their account
            credentials secure. Any activity performed through their accounts is their responsibility. Users should
            immediately report suspected unauthorized access to their accounts.
          </p>
        ),
      },
      {
        id: 'reports',
        title: 'Reports and User Submissions',
        body: (
          <>
            <p>
              All reports and submitted content must be truthful, accurate to the best of the user&rsquo;s knowledge,
              and submitted in good faith. By submitting content, users confirm that:
            </p>
            <ul>
              <li>The information provided is accurate to the best of their knowledge.</li>
              <li>They have permission or legal rights to upload and share the submitted photos and materials.</li>
              <li>Their submissions do not unnecessarily expose another person&rsquo;s private information.</li>
            </ul>
            <p>
              GCare administrators reserve the right to review, verify, edit, label, or remove submitted content when
              necessary to maintain platform safety and reliability.
            </p>
          </>
        ),
      },
      {
        id: 'conduct',
        title: 'Prohibited Activities',
        body: (
          <>
            <p>Users are not allowed to:</p>
            <ul>
              <li>Submit false, misleading, or intentionally fabricated reports.</li>
              <li>Harass, threaten, discriminate against, or spread hate speech toward others.</li>
              <li>Post spam, advertisements, or unrelated content.</li>
              <li>Attempt unauthorized access, disrupt, or interfere with GCare&rsquo;s services.</li>
              <li>Impersonate another user, administrator, or government agency.</li>
            </ul>
            <p>Violations may result in warnings, restricted access, account suspension, or account termination.</p>
          </>
        ),
      },
      {
        id: 'alerts',
        title: 'Safety Alerts and Information',
        body: (
          <>
            <p>
              GCare may display alerts and advisories from administrators, official agencies, and verified community
              reports. Although we make reasonable efforts to maintain accurate and updated information, we cannot
              guarantee that all information is complete, current, or error-free.
            </p>
            <p>Users should verify important information and follow official instructions from local authorities.</p>
          </>
        ),
      },
      {
        id: 'volunteering',
        title: 'Volunteer Participation',
        body: (
          <>
            <p>
              Participation in volunteer activities is voluntary. Volunteers are expected to prioritize their personal
              safety, follow official instructions, and avoid entering hazardous areas without proper authorization and
              safety measures.
            </p>
            <p>GCare does not guarantee volunteer protection, insurance coverage, or emergency assistance.</p>
          </>
        ),
      },
      {
        id: 'content',
        title: 'User-Generated Content',
        body: (
          <p>
            Users retain ownership of the content they submit to GCare. However, by submitting content, users grant
            GCare permission to store, display, and share that content as necessary to operate the platform and support
            community safety activities, subject to the Privacy Policy and applicable laws.
          </p>
        ),
      },
      {
        id: 'liability',
        title: 'Disclaimers and Limitation of Liability',
        body: (
          <>
            <p>
              GCare is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. While we aim to
              provide reliable services, we cannot guarantee uninterrupted access or completely accurate information.
            </p>
            <p>
              To the extent permitted by applicable law, GCare shall not be responsible for damages or losses resulting
              from reliance on inaccurate, delayed, or unavailable information on the platform.
            </p>
          </>
        ),
      },
      {
        id: 'changes',
        title: 'Changes to These Terms',
        body: (
          <p>
            GCare reserves the right to update or modify these Terms of Use when necessary. Any revisions will be
            published on this page with the corresponding update date. Continued use of the platform after changes take
            effect constitutes acceptance of the revised terms.
          </p>
        ),
      },
      {
        id: 'law',
        title: 'Governing Law',
        body: (
          <p>
            These Terms of Use shall be governed by and interpreted in accordance with the laws of the Republic of the
            Philippines.
          </p>
        ),
      },
      {
        id: 'contact',
        title: 'Contact Information',
        body: (
          <p>
            For questions, concerns, or clarifications regarding these Terms of Use, users may contact us through our{' '}
            <ContactLink />.
          </p>
        ),
      },
    ],
  },

    privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: November 13, 2026',
    alsoRead: 'terms',
    sections: [
      {
        id: 'collect',
        title: 'Personal Information We Collect',
        body: (
          <>
            <p>GCare collects information needed to provide its services, including:</p>
            <ul>
              <li>Name and email address.</li>
              <li>Account login information.</li>
              <li>Incident descriptions and uploaded photos.</li>
              <li>Location details for mapping and nearby alerts.</li>
              <li>Basic device and browser information.</li>
            </ul>
          </>
        ),
      },
      {
        id: 'use',
        title: 'Purpose of Data Collection',
        body: (
          <>
            <p>We use collected information to:</p>
            <ul>
              <li>Manage user accounts.</li>
              <li>Display community safety alerts.</li>
              <li>Process incident reports.</li>
              <li>Support volunteer activities.</li>
              <li>Improve website performance and security.</li>
            </ul>
          </>
        ),
      },
      {
        id: 'public',
        title: 'Information Visibility',
        body: (
          <p>
            Some information submitted through incident reports may be visible to other users through the community
            feed and safety map. Private account details, such as passwords and email addresses, are not publicly
            displayed.
          </p>
        ),
      },
      {
        id: 'sharing',
        title: 'Data Sharing',
        body: (
          <p>
            GCare does not sell personal information. Information may be shared with authorized response teams or
            relevant authorities when necessary for public safety or when legally required.
          </p>
        ),
      },
      {
        id: 'retention',
        title: 'Data Retention',
        body: (
          <p>
            Personal information is stored only for as long as necessary to provide GCare&rsquo;s services or comply
            with legal requirements. Certain safety reports may be retained for documentation purposes.
          </p>
        ),
      },
      {
        id: 'security',
        title: 'Data Security',
        body: (
          <p>
            We apply reasonable security measures to protect user information against unauthorized access, disclosure,
            or misuse. Users are also encouraged to maintain strong passwords and protect their account credentials.
          </p>
        ),
      },
      {
        id: 'rights',
        title: 'User Privacy Rights',
        body: (
          <>
            <p>In accordance with the Philippine Data Privacy Act of 2012 (RA 10173), users may:</p>
            <ul>
              <li>Request access to their personal information.</li>
              <li>Request corrections to inaccurate information.</li>
              <li>Object to certain data processing activities.</li>
              <li>Request deletion of personal information, subject to applicable requirements.</li>
              <li>File a complaint with the National Privacy Commission.</li>
            </ul>
          </>
        ),
      },
      {
        id: 'children',
        title: 'Children’s Privacy',
        body: (
          <p>
            GCare is not intended for children under 13 years old. If we discover that personal information has been
            collected from a child under 13 without appropriate authorization, we will take steps to address and remove
            the information.
          </p>
        ),
      },
      {
        id: 'cookies',
        title: 'Cookies and Website Storage',
        body: (
          <p>
            GCare may use cookies and browser storage to maintain user sessions, remember preferences, and improve
            website functionality. Users may manage or clear these settings through their browser.
          </p>
        ),
      },
      {
        id: 'updates',
        title: 'Policy Updates and Contact Information',
        body: (
          <>
            <p>
              GCare may revise this Privacy Policy when necessary. Any updates will be reflected on this page along
              with the latest revision date.
            </p>
            <p>
              For questions, concerns, or requests regarding personal information, users may contact us through our{' '}
              <ContactLink />.
            </p>
          </>
        ),
      },
    ],
  },
}

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
    lat: 13.7866,
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

/* ===================== ABOUT GCARE PAGE (/about) =====================
   Text shown on pages/About.jsx. Edit the wording here.
   `icon` says which picture the card uses (see the icon map in About.jsx). */
export const ABOUT = {
  title: 'About GCare',
  tagline: 'A safer, more prepared, and more connected Batangas.',
  intro:
    'GCare is a community-driven platform designed to keep you informed, prepared, and supported during emergencies and other local concerns. Together, we can build a safer and more resilient Golden Country Homes.',
  features: [
    { icon: 'bell', title: 'Real-Time Alerts', text: 'Get the latest updates on weather, hazards, and more.' },
    { icon: 'hazard', title: 'Report Incidents', text: 'Help your community by reporting emergencies.' },
    { icon: 'people', title: 'Find Help', text: 'Access resources and find nearby evacuation centers.' },
    { icon: 'volunteer', title: 'Volunteer', text: 'Be part of the solution. Support & assist your community.' },
  ],
  banner: {
    title: 'Together, we can make a difference.',
    text: 'Stay informed. Stay prepared. Stay safe.',
  },
};

/* ===================== CONTACT PAGE (/contact) =====================
   Text shown on pages/Contact.jsx. Edit the wording here. */
export const CONTACT = {
  title: 'Contact Us',
  tagline: 'We’d Love to Hear From You!',
  intro: [
    'Have suggestions, questions, or feedback about GCare? We’re here to listen! Whether you want to recommend a feature, clarify our Terms of Use, or ask about our Privacy Policy, feel free to reach out.',
    'Your feedback helps us improve GCare and provide a better experience for our community.',
  ],
  helpTitle: 'How Can We Help You?',
  help: [
    {
      title: 'Suggestions and Feedback',
      text: 'Have an idea or recommendation to improve GCare? Share your thoughts with us. We value your suggestions for new features, website improvements, and community safety initiatives.',
    },
    {
      title: 'Terms of Use Inquiries',
      text: 'Have questions about GCare’s rules, user responsibilities, or platform guidelines? Contact us if you need clarification about our Terms of Use.',
    },
    {
      title: 'Privacy Policy Inquiries',
      text: 'Do you have questions about how GCare collects, uses, stores, or protects your personal information? You may contact us regarding our Privacy Policy and data protection practices.',
    },
  ],
  formTitle: 'Send Us a Message',
  formIntro: 'Select the purpose of your message and provide the necessary details below.',
  categoryLabel: 'Message Category',
  categories: ['Suggestions and Feedback', 'Terms of Use Inquiry', 'Privacy Policy Inquiry', 'Other Inquiries'],
  messageLabel: 'Your Message',
  messageHelp: 'Describe your suggestion, question, or inquiry in the space provided.',
  placeholder: 'Write your message here...',
  submit: 'Submit Message',
  thanksTitle: 'Thank You for Reaching Out!',
  thanksText:
    'We appreciate your time and feedback. Your messages help us improve GCare, maintain transparency, and build a safer and more informed community.',
};
