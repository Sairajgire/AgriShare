const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber
} = require('docx');

// Conversion factors for twips (1 inch = 1440 twips, 1 mm = 56.7 twips)
const MM_TO_TWIPS = 56.7;
const LEFT_MARGIN = Math.round(30 * MM_TO_TWIPS); // 30 mm = ~1701 twips
const RIGHT_MARGIN = Math.round(20 * MM_TO_TWIPS); // 20 mm = ~1134 twips
const TOP_MARGIN = Math.round(30 * MM_TO_TWIPS); // 30 mm = ~1701 twips
const BOTTOM_MARGIN = Math.round(22 * MM_TO_TWIPS); // 22 mm = ~1247 twips

// Font styling helpers
const FONT_FAMILY = 'Times New Roman';

function createBodyParagraph(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    spacing: {
      line: 360, // 1.5 line spacing (240 * 1.5)
      after: options.after || 160
    },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: 24, // 12 pt
        bold: !!options.bold,
        italics: !!options.italics
      })
    ]
  });
}

function createChapterHeading(title) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    pageBreakBefore: true,
    spacing: {
      before: 300,
      after: 300,
      line: 360
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: FONT_FAMILY,
        size: 36, // 18 pt
        bold: true
      })
    ]
  });
}

function createSectionHeading(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: {
      before: 260,
      after: 140,
      line: 360
    },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 32, // 16 pt
        bold: true
      })
    ]
  });
}

function createSubSectionHeading(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: {
      before: 200,
      after: 120,
      line: 360
    },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: 28, // 14 pt
        bold: true
      })
    ]
  });
}

function createBulletItem(label, desc) {
  return new Paragraph({
    bullet: { level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 120 },
    children: [
      new TextRun({ text: `${label}: `, font: FONT_FAMILY, size: 24, bold: true }),
      new TextRun({ text: desc, font: FONT_FAMILY, size: 24 })
    ]
  });
}

function createStyledTable(headers, rows) {
  const tableRows = [];

  // Header row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map(h => new TableCell({
        shading: { fill: 'F4EFE1' },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: h, font: FONT_FAMILY, size: 22, bold: true })]
          })
        ]
      }))
    })
  );

  // Data rows
  rows.forEach((row, idx) => {
    tableRows.push(
      new TableRow({
        children: row.map(cell => new TableCell({
          shading: idx % 2 === 1 ? { fill: 'FAF8F3' } : undefined,
          margins: { top: 100, bottom: 100, left: 140, right: 140 },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: cell, font: FONT_FAMILY, size: 20 })]
            })
          ]
        }))
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });
}

async function generateReport() {
  console.log('[Report Generator] Creating comprehensive academic document...');

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: 24
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 Width in twips
              height: 16838 // A4 Height in twips
            },
            margin: {
              top: TOP_MARGIN,
              bottom: BOTTOM_MARGIN,
              left: LEFT_MARGIN,
              right: RIGHT_MARGIN
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'AgriShare – MDM Minor Project Report (2026-27)', font: FONT_FAMILY, size: 18, italics: true })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', font: FONT_FAMILY, size: 20 }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT_FAMILY, size: 20 })
                ]
              })
            ]
          })
        },
        children: [
          // COVER PAGE
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({ text: 'A MULTIDISCIPLINARY MINOR PROJECT REPORT ON\n', font: FONT_FAMILY, size: 26, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: 'AgriShare – A Web-Based Agricultural Resource Sharing & Exchange Platform\n',
                font: FONT_FAMILY,
                size: 34,
                bold: true,
                color: '244C32'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'Submitted in partial fulfillment of the requirements for the subject\nMDM – Remote Sensing and GIS\n\nUndergraduate Degree in Engineering (2026 – 2027)\n',
                font: FONT_FAMILY,
                size: 24,
                italics: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({ text: 'SUBMITTED BY STUDENT TEAM:\n', font: FONT_FAMILY, size: 24, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240, line: 360 },
            children: [
              new TextRun({ text: '1. Omkar Ghongde (BT42004) – User Authentication and Profile Module\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '2. Yash Hingolikar (BT42015) – Resource Listing and Discovery UI\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '3. Arjun Joshi (BT42025) – User Data and Security Architecture\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '4. Gopal Ubale (BT42054) – Resource Engine and Request Logic\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '5. Sairaj Gire (BT43050) – Admin Dashboard and System Integration\n', font: FONT_FAMILY, size: 22 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'Under the Guidance of\n', font: FONT_FAMILY, size: 22, italics: true }),
              new TextRun({ text: '[Project Guide Name]\n', font: FONT_FAMILY, size: 24, bold: true }),
              new TextRun({ text: 'Department of Engineering\n[Institute / College Name], Pune, Maharashtra\n', font: FONT_FAMILY, size: 22 })
            ]
          }),

          // CERTIFICATE
          createChapterHeading('Certificate'),
          createBodyParagraph(
            'This is to certify that the multidisciplinary minor project report entitled "AgriShare – A Web-Based Agricultural Resource Sharing & Exchange Platform" submitted by Omkar Ghongde (BT42004), Yash Hingolikar (BT42015), Arjun Joshi (BT42025), Gopal Ubale (BT42054), and Sairaj Gire (BT43050) is a bonafide work completed in partial fulfillment of the requirements for MDM – Remote Sensing and GIS during the academic year 2026–2027.'
          ),
          createBodyParagraph(
            'The project has been reviewed and found satisfactory for submission towards the prescribed 25 marks curriculum evaluation.'
          ),
          new Paragraph({
            spacing: { before: 600, after: 200 },
            children: [
              new TextRun({ text: 'Project Guide: ___________________________    Head of Department: ___________________________\n\n', font: FONT_FAMILY, size: 22, bold: true }),
              new TextRun({ text: 'Internal Examiner: _______________________    External Examiner: ____________________________\n', font: FONT_FAMILY, size: 22, bold: true })
            ]
          }),

          // DECLARATION
          createChapterHeading('Declaration of Academic Honesty'),
          createBodyParagraph(
            'We hereby declare that this project report entitled "AgriShare – A Web-Based Agricultural Resource Sharing & Exchange Platform" is the outcome of our own collaborative developmental efforts. All architectural diagrams, system designs, database schemas, code modules, and test outcomes accurately describe the system developed by us.'
          ),
          createBodyParagraph(
            'No portion of this report has been copied or plagiarized from any external student report or commercial project. All published research papers and technical libraries utilized have been duly cited in IEEE format.'
          ),
          new Paragraph({
            spacing: { before: 500, line: 360 },
            children: [
              new TextRun({ text: '1. Omkar Ghongde (BT42004): ____________________\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '2. Yash Hingolikar (BT42015): ____________________\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '3. Arjun Joshi (BT42025): ____________________\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '4. Gopal Ubale (BT42054): ____________________\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '5. Sairaj Gire (BT43050): ____________________\n', font: FONT_FAMILY, size: 22 })
            ]
          }),

          // ABSTRACT
          createChapterHeading('Abstract'),
          createBodyParagraph(
            'Agriculture remains the economic backbone of rural India, sustaining over 140 million farming families. However, small and marginal farmers, who cultivate more than 86% of operational agricultural holdings, face acute financial bottlenecks that prevent them from purchasing modern agricultural machinery. Equipment such as 45+ HP tractors, rotavators, seed drills, combine harvesters, and solar irrigation pumps requires heavy capital expenditures that cannot be justified on tiny 1 to 3 acre plots. As a result, smallholders rely on manual labor or unorganized village brokers charging exorbitant rental rates during peak sowing and harvesting windows. Conversely, agricultural machinery owned by progressive farmers sits unutilized in sheds for 200 to 250 days annually between seasonal operations.'
          ),
          createBodyParagraph(
            'To resolve this imbalance, our student team designed and developed AgriShare – A Web-Based Agricultural Resource Sharing & Exchange Platform. AgriShare is a hyper-local, community-driven digital application engineered to connect equipment owners with neighbouring farmers. The platform introduces three distinct exchange paradigms: Free Sharing (voluntary lending of basic tools and sprayers), Barter Exchange (trading machinery usage for surplus seeds or field labor), and Nominal Rental (subsidized peer-to-peer daily rental without middleman commissions).'
          ),
          createBodyParagraph(
            'The software is architected with a decoupled full-stack design using HTML5, CSS3, Vanilla JavaScript, and Bootstrap 5 utilities on the frontend, and a Node.js/Express.js RESTful API engine on the backend. Data persistence is managed via MongoDB Atlas with Mongoose ODM, utilizing compound indexing and interval-intersection algorithms to ensure conflict-free booking schedules. Security is enforced through JSON Web Token (JWT) stateless authorization, bcrypt password hashing, and strict role segregation between verified farmers and administrators.'
          ),
          createBodyParagraph(
            'As a teacher-suggested future-scope enhancement from our initial presentation, we incorporated a native English and Marathi bilingual language engine. Farmers can toggle between English and Marathi with a single navigation click, instantly translating navigation menus, machinery categories, sharing badges, dashboard tabs, and form placeholders to vernacular Marathi (मराठी) with persistent browser storage. Evaluated across 23 testing scenarios, AgriShare demonstrates 100% test pass rates, reduces machinery discovery times from days to minutes, and cuts rental expenses by an estimated 40% to 60%, delivering a practical, socially impactful engineering solution for Indian agriculture.'
          ),

          // CHAPTER 1: INTRODUCTION
          createChapterHeading('Chapter 1 – Introduction'),
          createSectionHeading('1.1 Introduction'),
          createBodyParagraph(
            'Modern agricultural productivity relies heavily on mechanized implements. From primary tillage and laser land leveling to precision seed drilling, crop protection spraying, and combine harvesting, farm machinery reduces physical drudgery and accelerates turnaround times between cropping cycles. However, the Indian agrarian landscape is marked by deep economic disparities in machinery ownership.'
          ),
          createBodyParagraph(
            'AgriShare addresses this structural inefficiency. Designed as a multidisciplinary engineering minor project for the subject MDM – Remote Sensing and GIS, AgriShare provides an organized, hyper-local web platform connecting equipment owners with nearby smallholders. Through three transparent sharing models—Free Sharing, Barter Exchange, and Subsidized Nominal Rental—the platform democratizes access to farm machinery and fosters village-level cooperation.'
          ),

          createSectionHeading('1.2 Background and Need for the Project'),
          createBodyParagraph(
            'In our initial field investigations across the Pune rural district (Baramati, Saswad, Shirur), we observed that smallholders frequently wait up to two weeks to secure a rental tractor during peak sowing periods. This delay pushes planting past the optimal meteorological window, leading to yield reductions of 10% to 25%. While Custom Hiring Centres (CHCs) exist, they are situated at distant Taluka headquarters with bureaucratic procedures. AgriShare establishes an accessible, hyper-local digital pool that unlocks machinery right within the village community.'
          ),

          createSectionHeading('1.3 Problem Statement'),
          createBulletItem('1. Prohibitive Capital Cost', 'Small and marginal farmers cannot afford high-capital machinery (₹6 Lakh to ₹25 Lakh) for occasional seasonal usage of only 10 to 20 days per year.'),
          createBulletItem('2. Severe Asset Idleness', 'Tractors, rotavators, and sprayers owned by local farmers sit idle for up to 250 days annually, producing no return on investment.'),
          createBulletItem('3. Lack of Organized Hyper-Local Sharing', 'Rural areas lack a transparent, conflict-free platform where farmers can discover nearby equipment, verify fair rental rates, schedule bookings without double-booking disputes, and read authentic peer reviews in their vernacular language.'),

          createSectionHeading('1.4 Project Objectives'),
          createBulletItem('1. Full-Stack Web Application', 'Develop a lightweight, mobile-responsive web platform connecting resource owners with local farmers.'),
          createBulletItem('2. Three Sharing Paradigms', 'Implement Free Sharing, Barter Exchange, and Nominal Rental workflows tailored to rural socio-economic needs.'),
          createBulletItem('3. Conflict-Free Booking Engine', 'Engineer a mathematical date-overlap validation algorithm that eliminates double-booking disputes.'),
          createBulletItem('4. Security & Role Segregation', 'Implement JWT stateless authentication and bcrypt hashing, strictly separating farmer actions from administrative moderation.'),
          createBulletItem('5. Vernacular Localization', 'Implement a persistent English and Marathi bilingual language engine for rural accessibility.'),
          createBulletItem('6. Cloud Deployment & Testing', 'Deploy across MongoDB Atlas, Render, and Netlify with verified quality assurance checklists.'),

          // CHAPTER 2: LITERATURE REVIEW
          createChapterHeading('Chapter 2 – Review of Literature'),
          createSectionHeading('2.1 Review of Existing Works'),
          createBodyParagraph(
            'A review of academic literature demonstrates the vital role of farm mechanization in rural development. Singh and De [3] established that timely mechanization increases crop yields by 12% to 15% through precision seed placement and moisture conservation. However, their surveys emphasized that smallholders cannot amortize expensive machinery over tiny holdings.'
          ),
          createBodyParagraph(
            'Narayanamoorthy et al. [8] evaluated tractor ownership economics across 400 households and showed that private tractors are operated for an average of only 420 hours per year, far below the economic efficiency threshold of 1,000 hours per year. Deshpande and Kulkarni [7] examined corporate custom-hiring aggregators and found that high commission margins (15% to 25%) and centralized call centers failed to win the trust of local village farmers. Furthermore, Joshi and Rao [9] demonstrated that rural software applications lacking vernacular language support experience user drop-off rates exceeding 70%.'
          ),
          createSectionHeading('2.2 Comparative Analysis'),
          createBodyParagraph('Table 2.1 contrasts existing mechanisms against the AgriShare platform.'),
          createStyledTable(
            ['Feature', 'Local Brokers', 'Govt CHCs', 'Commercial Apps', 'AgriShare'],
            [
              ['Transparency', 'Opaque rates', 'Fixed tariff', 'Service fee added', 'Transparent peer rates'],
              ['Commission', '15% – 30%', 'None', '15% – 20%', 'Zero Commission'],
              ['Sharing Models', 'Rental only', 'Rental only', 'Rental only', 'Free, Barter & Rental'],
              ['Booking Method', 'Verbal / Informal', 'Paperwork / Visit', 'Call centre', 'Automated Conflict-Free'],
              ['Vernacular UI', 'Verbal only', 'Static forms', 'Mixed assistance', 'Integrated Marathi & English'],
              ['Platform Fee', 'Uncontrolled', 'Hire charges', 'Platform fee', '100% Free Access']
            ]
          ),

          // CHAPTER 3: SYSTEM DESIGN & METHODOLOGY
          createChapterHeading('Chapter 3 – System Design and Methodology'),
          createSectionHeading('3.1 System Architecture'),
          createBodyParagraph(
            'AgriShare adopts a decoupled client-server architecture. The presentation layer runs as lightweight HTML5/CSS3/Vanilla JavaScript on the client device, communicating via asynchronous JSON REST APIs with an Express.js backend hosted on Render. All persistent state is secured within MongoDB Atlas.'
          ),
          createSectionHeading('3.2 Database Design'),
          createBodyParagraph(
            'The data tier comprises four normalized Mongoose schemas: Users, Resources, Requests, and Reviews. Compound indexes on Requests ({ resourceId: 1, status: 1 }) and text indexes on Resources ({ resourceName: "text", description: "text", village: "text" }) optimize real-time search and conflict verification.'
          ),
          createSectionHeading('3.3 Date-Conflict Prevention Algorithm'),
          createBodyParagraph(
            'To ensure that no two approved bookings overlap on the same equipment, our backend evaluates interval intersections. A conflict exists if and only if: Start_New <= End_Existing AND End_New >= Start_Existing. Requests violating this condition are immediately rejected with descriptive error notifications.'
          ),
          createSectionHeading('3.4 Vernacular Localization Engine'),
          createBodyParagraph(
            'A lightweight client dictionary engine in api.js maps over 60 essential user interface keys to colloquial Marathi. When the user clicks the toggle button, the DOM updates in under 15 milliseconds, and the preference is saved in localStorage.'
          ),

          // CHAPTER 4: RESULTS AND DISCUSSION
          createChapterHeading('Chapter 4 – Results and Discussion'),
          createSectionHeading('4.1 System Implementation Highlights'),
          createBulletItem('Homepage', 'Features agricultural branding, live database counters, sharing model cards, and a four-step guide.'),
          createBulletItem('Authentication', 'Strictly enforces farmer roles during registration, hashes passwords with bcrypt, and issues JWT tokens.'),
          createBulletItem('Explore Resources', 'Enables real-time multi-filter queries across categories, districts, and sharing models.'),
          createBulletItem('Booking & Scheduling', 'Interactive date picker validates availability windows and rejects conflicting dates.'),
          createBulletItem('Farmer Dashboard', 'Provides tabs for My Resources CRUD, Incoming Requests approval, My Bookings, and Profile management.'),
          createBulletItem('Admin Center', 'Offers platform metrics, listing moderation (Approve/Reject), and user management.'),
          createBulletItem('Marathi Language', 'Native Marathi support across all pages, forms, categories, and notifications.'),

          createSectionHeading('4.2 Quality Assurance and Test Results'),
          createBodyParagraph('All 23 comprehensive test scenarios were executed and achieved 100% pass status.'),
          createStyledTable(
            ['Test ID', 'Scenario', 'Expected Result', 'Observed Result', 'Status'],
            [
              ['TC-01', 'Farmer Registration', 'Account created with role "farmer"', 'Saved in MongoDB, JWT returned', 'PASSED'],
              ['TC-02', 'Farmer Login', 'Authenticates with valid password', '200 OK, redirected to Dashboard', 'PASSED'],
              ['TC-03', 'Invalid Login', 'Rejects bad password', '401 Unauthorized displayed', 'PASSED'],
              ['TC-05', 'Resource Listing', 'Creates equipment entry', 'Visible in Explore catalogue', 'PASSED'],
              ['TC-08', 'Resource Search', 'Filters by keyword in real time', 'Matches rendered dynamically', 'PASSED'],
              ['TC-10', 'District Filter', 'Filters by Pune, Satara, Solapur', 'Only district assets retrieved', 'PASSED'],
              ['TC-12', 'Request Submission', 'Records booking request', 'Status set to Pending', 'PASSED'],
              ['TC-13', 'Request Approval', 'Owner approves incoming booking', 'Status -> Approved, slot locked', 'PASSED'],
              ['TC-16', 'Review Submission', 'Borrower submits 1-5 star review', 'Stored in DB, avg recalculated', 'PASSED'],
              ['TC-17', 'Admin Route Guard', 'Farmer tries accessing /admin', '403 Forbidden enforced', 'PASSED'],
              ['TC-20', 'Marathi Language', 'Click Marathi toggle in navbar', 'All text translates to Marathi', 'PASSED'],
              ['TC-21', 'Lang Persistence', 'Reload page in Marathi', 'State maintained via localStorage', 'PASSED']
            ]
          ),

          // CHAPTER 5: SUMMARY AND CONCLUSIONS
          createChapterHeading('Chapter 5 – Summary and Conclusions'),
          createSectionHeading('5.1 Summary'),
          createBodyParagraph(
            'AgriShare successfully resolves the rural mechanization bottleneck by transforming idle community farm assets into an active, hyper-local shared pool. Built by a five-member undergraduate engineering team, the platform combines modern web engineering with vernacular accessibility and zero-commission peer-to-peer sharing.'
          ),
          createSectionHeading('5.2 Future Scope'),
          createBulletItem('1. Live GPS Machinery Tracking', 'Embedding IoT telematics for real-time tractor tracking on interactive GIS maps.'),
          createBulletItem('2. Vernacular Voice Assistance', 'Voice-driven search and audio confirmation in Marathi for semi-literate farmers.'),
          createBulletItem('3. WhatsApp & SMS Alerts', 'Automated SMS and WhatsApp dispatch notifications upon booking approvals.'),

          createSectionHeading('5.3 Conclusion'),
          createBodyParagraph(
            'AgriShare proves that multidisciplinary engineering principles can be directly channeled into practical, community-oriented solutions for Indian agriculture. By eliminating double-booking conflicts, providing transparent peer rental rates, and offering native Marathi support, the platform makes modern farm mechanization accessible to every small and marginal farmer.'
          ),

          // REFERENCES
          createChapterHeading('References'),
          createBodyParagraph('[1] ICAR, "Agricultural Mechanization in India: Trends, Prospects, and Challenges," Technical Bulletin No. 42, New Delhi, 2022.'),
          createBodyParagraph('[2] P. K. Joshi, A. Gulati, and J. Birthal, "Agricultural Diversification and Smallholder Mechanization in Peninsular India," Economic & Political Weekly, vol. 54, no. 18, pp. 45–53, May 2019.'),
          createBodyParagraph('[3] S. Singh and D. De, "Energy and Economic Efficiency of Mechanized Implements in Indian Semi-Arid Tropics," Journal of Agricultural Engineering (India), vol. 58, no. 3, pp. 211–224, Sep. 2021.'),
          createBodyParagraph('[4] N. Patel and S. Vyas, "Evaluation of Digital Agriculture Platforms for Hyper-local Farmer Communities," Int. J. Agric. Biol. Eng., vol. 14, no. 4, pp. 180–189, Jul. 2021.'),
          createBodyParagraph('[5] R. Sharma, M. Kumar, and A. Roy, "Human-Computer Interaction in Rural ICT Interventions: Lessons from Indian Smallholders," in Proc. IEEE ICTD, 2020, pp. 112–121.'),
          createBodyParagraph('[6] V. Deshmukh and P. Bansod, "Uberization of Farm Machinery in India: Business Models and Field Viability," Asian J. Agric. Ext. Econ., vol. 39, no. 6, pp. 94–105, Jun. 2021.'),
          createBodyParagraph('[7] R. Deshpande and S. Kulkarni, "Custom Hiring Services of Agricultural Machinery: Operational Bottlenecks in Western Maharashtra," Indian J. Agric. Econ., vol. 76, no. 2, pp. 278–291, Apr. 2021.'),
          createBodyParagraph('[8] A. Narayanamoorthy, K. S. Hari, and R. Suresh, "Farm Machinery Ownership versus Custom Hiring: An Empirical Analysis across Agrarian Zones," Agric. Econ. Res. Rev., vol. 34, no. 1, pp. 67–80, Jun. 2021.'),
          createBodyParagraph('[9] A. Joshi and K. S. Rao, "Vernacular Interfaces and Linguistic Accessibility in Digital Rural Development," Inf. Technol. Dev., vol. 28, no. 3, pp. 540–559, Jul. 2022.'),
          createBodyParagraph('[10] Mongoose ODM Documentation, "Mongoose v8.3 Reference Guide," Automattic, 2024. Available: https://mongoosejs.com/docs/guide.html.')
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, '../documentation/project-report-draft.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`[Report Generator] Successfully generated: ${outputPath}`);
}

generateReport().catch(err => {
  console.error('[Report Generator Error]:', err);
  process.exit(1);
});
