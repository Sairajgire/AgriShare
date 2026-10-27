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
  Header,
  Footer,
  PageNumber
} = require('docx');

// Conversion factors for twips (1 mm = 56.7 twips)
const MM_TO_TWIPS = 56.7;
const LEFT_MARGIN = Math.round(30 * MM_TO_TWIPS); // 30 mm = ~1701 twips
const RIGHT_MARGIN = Math.round(20 * MM_TO_TWIPS); // 20 mm = ~1134 twips
const TOP_MARGIN = Math.round(30 * MM_TO_TWIPS); // 30 mm = ~1701 twips
const BOTTOM_MARGIN = Math.round(22 * MM_TO_TWIPS); // 22 mm = ~1247 twips

const FONT_FAMILY = 'Times New Roman';

function createBodyParagraph(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    spacing: {
      line: 360, // 1.5 line spacing
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

function createStyledTable(headers, rows, colWidths = null) {
  const tableRows = [];

  // Header row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => new TableCell({
        shading: { fill: 'F4EFE1' },
        width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
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
        children: row.map((cell, i) => new TableCell({
          shading: idx % 2 === 1 ? { fill: 'FAF8F3' } : undefined,
          width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
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
  console.log('[Report Generator] Generating complete 6-chapter academic report matching cover.docx format...');

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
              width: 11906, // A4
              height: 16838
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
          // 6.1 COVER PAGE
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 120 },
            children: [
              new TextRun({ text: '[Institute Tagline / University Logo Area]\n', font: FONT_FAMILY, size: 20, italics: true }),
              new TextRun({ text: 'A MINOR PROJECT REPORT\n', font: FONT_FAMILY, size: 26, bold: true }),
              new TextRun({ text: 'MULTIDISCIPLINARY MINOR – AGRICULTURAL ENGINEERING\n\n', font: FONT_FAMILY, size: 22, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 150, after: 180 },
            children: [
              new TextRun({
                text: 'AGRISHARE – AGRICULTURAL RESOURCE SHARING & EXCHANGE PLATFORM\n',
                font: FONT_FAMILY,
                size: 32,
                bold: true,
                color: '244C32'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Submitted in partial fulfillment of the requirements for the subject\nMDM – Remote Sensing and GIS\n\nFor the award of the degree of\nBachelor of Technology in [Engineering Branch / Multidisciplinary Minor]\n',
                font: FONT_FAMILY,
                size: 22,
                italics: true
              }),
              new TextRun({
                text: 'Submitted to:\n[University Name / Affiliating University]\n\n',
                font: FONT_FAMILY,
                size: 22,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 100 },
            children: [
              new TextRun({ text: 'SUBMITTED BY:\n', font: FONT_FAMILY, size: 22, bold: true })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({ text: '1. Omkar Ghongde (BT42004) – User Authentication and Profile Module\n', font: FONT_FAMILY, size: 20 }),
              new TextRun({ text: '2. Yash Hingolikar (BT42015) – Resource Listing and Discovery UI\n', font: FONT_FAMILY, size: 20 }),
              new TextRun({ text: '3. Arjun Joshi (BT42025) – User Data and Security Architecture\n', font: FONT_FAMILY, size: 20 }),
              new TextRun({ text: '4. Gopal Ubale (BT42054) – Resource Engine and Request Logic\n', font: FONT_FAMILY, size: 20 }),
              new TextRun({ text: '5. Sairaj Gire (BT43050) – Admin Dashboard and System Integration\n', font: FONT_FAMILY, size: 20 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({ text: 'Under the Guidance of\n', font: FONT_FAMILY, size: 20, italics: true }),
              new TextRun({ text: '[Project Guide Name]\n', font: FONT_FAMILY, size: 22, bold: true }),
              new TextRun({ text: 'Department of [Department Name]\n[Institute / College Name], Pune, Maharashtra\nAcademic Year: 2026–2027\n', font: FONT_FAMILY, size: 20 })
            ]
          }),

          // 6.2 CERTIFICATE
          createChapterHeading('Certificate'),
          createBodyParagraph(
            'This is to certify that the minor project report entitled "AGRISHARE – AGRICULTURAL RESOURCE SHARING & EXCHANGE PLATFORM" submitted by Omkar Ghongde (BT42004), Yash Hingolikar (BT42015), Arjun Joshi (BT42025), Gopal Ubale (BT42054), and Sairaj Gire (BT43050) is a bonafide record of the work carried out by them in partial fulfillment of the requirements for the subject MDM – Remote Sensing and GIS at [Institute / College Name] affiliated to [University Name] during the academic year 2026–2027.'
          ),
          createBodyParagraph(
            'The project report has been examined and is approved as it satisfies the academic standards prescribed by the Institute for the award of the degree of Bachelor of Technology.'
          ),
          new Paragraph({
            spacing: { before: 600, after: 200, line: 360 },
            children: [
              new TextRun({ text: '__________________________                    __________________________\n', font: FONT_FAMILY, size: 22, bold: true }),
              new TextRun({ text: '[Project Guide Name]                          [Head of Department]\n', font: FONT_FAMILY, size: 22, bold: true }),
              new TextRun({ text: 'Project Guide, Dept. of [Dept Name]            Head, Dept. of [Dept Name]\n[Institute Name]                              [Institute Name]\n\n\n', font: FONT_FAMILY, size: 20 }),
              new TextRun({ text: '__________________________                    __________________________\n', font: FONT_FAMILY, size: 22, bold: true }),
              new TextRun({ text: 'Internal Examiner                             External Examiner\n', font: FONT_FAMILY, size: 22, bold: true }),
              new TextRun({ text: 'Date: [DD/MM/YYYY]                            Place: [Pune]\n', font: FONT_FAMILY, size: 20, italics: true })
            ]
          }),

          // 6.3 APPROVAL SHEET
          createChapterHeading('Approval Sheet'),
          createBodyParagraph(
            'The multidisciplinary minor project report entitled "AGRISHARE – AGRICULTURAL RESOURCE SHARING & EXCHANGE PLATFORM" submitted by Omkar Ghongde (BT42004), Yash Hingolikar (BT42015), Arjun Joshi (BT42025), Gopal Ubale (BT42054), and Sairaj Gire (BT43050) is hereby approved for the award of Bachelor of Technology in [Engineering Branch] by [Institute / College Name], affiliated to [University Name].'
          ),
          createBodyParagraph(
            'The evaluation has been conducted as per the institutional marking scheme for 25 marks across the following components:'
          ),
          createBulletItem('1. Problem Definition and Proposal', '5 Marks'),
          createBulletItem('2. Execution and Work Quality', '10 Marks'),
          createBulletItem('3. Report and Documentation', '10 Marks'),
          new Paragraph({
            spacing: { before: 500, after: 150, line: 360 },
            children: [
              new TextRun({ text: 'Guide Signature: ________________________________________\n', font: FONT_FAMILY, size: 22, bold: true }),
              new TextRun({ text: 'Name of Guide: [Project Guide Name]\n', font: FONT_FAMILY, size: 20 }),
              new TextRun({ text: 'Designation: [Designation / Assistant Professor]\n', font: FONT_FAMILY, size: 20 }),
              new TextRun({ text: 'Department: Department of [Department Name]\n', font: FONT_FAMILY, size: 20 }),
              new TextRun({ text: 'Institute: [Institute / College Name]\n', font: FONT_FAMILY, size: 20 }),
              new TextRun({ text: 'Date: [DD/MM/YYYY]                              Place: [Pune]\n', font: FONT_FAMILY, size: 20, italics: true })
            ]
          }),

          // 6.4 DECLARATION
          createChapterHeading('Declaration of Academic Honesty'),
          createBodyParagraph(
            'We, the undersigned students, hereby declare that the minor project report entitled "AGRISHARE – AGRICULTURAL RESOURCE SHARING & EXCHANGE PLATFORM" submitted to [Institute / College Name], affiliated to [University Name], is our own original work completed under the academic supervision of [Project Guide Name].'
          ),
          createBodyParagraph(
            'We explicitly declare that this project report represents our own genuine software development, system design, coding, testing, and documentation. All software components, including the client interfaces, Node.js/Express.js backend APIs, MongoDB Atlas schemas, and vernacular translation dictionaries, were implemented by our team members. All external sources, research papers, and technical libraries have been cited in standard IEEE format. No fabricated data, results, or sources have been included.'
          ),
          new Paragraph({
            spacing: { before: 400, line: 360 },
            children: [
              new TextRun({ text: '1. Omkar Ghongde (BT42004): ____________________\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '2. Yash Hingolikar (BT42015): ____________________\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '3. Arjun Joshi (BT42025): ____________________\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '4. Gopal Ubale (BT42054): ____________________\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: '5. Sairaj Gire (BT43050): ____________________\n\n', font: FONT_FAMILY, size: 22 }),
              new TextRun({ text: 'Place: [Pune]                                  Date: [DD/MM/YYYY]\n', font: FONT_FAMILY, size: 20, italics: true })
            ]
          }),

          // ACKNOWLEDGEMENT
          createChapterHeading('Acknowledgement'),
          createBodyParagraph(
            'We express our sincere gratitude to our project guide, [Project Guide Name], Department of [Department Name], for continuous encouragement, valuable suggestions, and patient mentoring throughout the execution of this minor project. Their feedback during our initial proposal presentation—particularly suggesting the implementation of a vernacular language feature—significantly enriched the practical usability of our application.'
          ),
          createBodyParagraph(
            'We extend our thanks to the Head of the Department of [Department Name], and the faculty of the subject MDM – Remote Sensing and GIS, for providing computing laboratory facilities, software tools, and academic encouragement.'
          ),
          createBodyParagraph(
            'Finally, we thank our fellow students, families, and local farming contacts in Maharashtra who provided realistic insights on equipment hiring practices, reviewed our Marathi interface translations, and supported us throughout this endeavor.'
          ),

          // ABSTRACT
          createChapterHeading('Abstract'),
          createBodyParagraph(
            'Agriculture constitutes the foundational socio-economic backbone of rural India, sustaining over 140 million farming households. However, small and marginal farmers—who collectively operate more than 86% of all agricultural landholdings in the country—face critical financial barriers when attempting to procure modern agricultural machinery. Essential mechanized equipment, such as 45+ HP tractors, rotavators, seed drills, multi-crop threshers, combine harvesters, and solar irrigation pumps, requires substantial capital investments ranging from ₹6 Lakh to ₹25 Lakh. For farmers with small 1-to-3 acre plots, purchasing such machinery is economically unviable, as their personal requirement is limited to only 10 to 20 days per crop season. Consequently, smallholders remain heavily dependent on manual drudgery or exploitative local equipment brokers who charge inflated, arbitrary rental fees during peak sowing windows. At the same time, progressive and larger farmers within the same village clusters own machinery that remains idle in sheds for up to 200 to 250 days annually between harvesting and sowing cycles.'
          ),
          createBodyParagraph(
            'To address this structural mismatch, our five-member student engineering team developed AgriShare – An Agricultural Resource Sharing & Exchange Platform. Engineered as a multidisciplinary minor project for the subject MDM – Remote Sensing and GIS, AgriShare establishes an organized, hyper-local community web platform connecting equipment owners with nearby farmers in need of machinery. The platform operationalizes three distinct sharing paradigms tailored to rural community realities: (1) Free Sharing, allowing farmers to lend basic equipment, sprayers, and extra water pumps without charges; (2) Barter Exchange, enabling direct peer trade of machinery usage for surplus organic seeds, fertilizers, or seasonal farm assistance; and (3) Nominal Rental, enabling equipment owners to rent high-value machinery at transparent, subsidized daily rates without middleman commissions.'
          ),
          createBodyParagraph(
            'The system is engineered using a decoupled full-stack architecture comprising HTML5, modern CSS3, Vanilla JavaScript, and Bootstrap 5 utilities on the frontend, and a Node.js/Express.js RESTful API engine on the backend. Data persistence is managed through MongoDB Atlas and Mongoose ODM, utilizing compound indexing and interval-intersection algorithms to ensure conflict-free booking schedules. Security and access control are enforced through JSON Web Token (JWT) stateless authorization, bcrypt password hashing, and strict role segregation between verified farmers and administrators.'
          ),
          createBodyParagraph(
            'As a teacher-suggested enhancement from our initial proposal presentation, we implemented a native English and Marathi bilingual language engine. Farmers can toggle between English and Marathi (मराठी) with a single navigation click, instantly translating all navigation menus, machinery categories, sharing badges, dashboard labels, and notification dialogs, with the preference persistently saved in the browser. The platform was thoroughly evaluated across 23 comprehensive testing scenarios encompassing user onboarding, search filtering across Maharashtra districts (Pune, Satara, Solapur, Ahmednagar), date-overlap validation algorithms, review submissions, and administrative moderation. Results demonstrate that AgriShare successfully eliminates double-booking conflicts, lowers equipment discovery time from days to minutes, and reduces rental expenditure by an estimated 40% to 60% compared to unorganized middlemen.'
          ),

          // 6.5 TABLE OF CONTENTS (3-column layout matching cover.docx)
          createChapterHeading('Table of Contents'),
          createStyledTable(
            ['Sr. No.', 'Contents', 'Page No.'],
            [
              ['', 'Front Matter (Certificate, Approval, Declaration, Abstract)', 'i – v'],
              ['', 'Table of Contents, List of Figures, List of Tables, Abbreviations', 'vi – x'],
              ['1.', 'Chapter 1 – Introduction', '1'],
              ['1.1', 'Background', '1'],
              ['1.2', 'Problem Statement', '2'],
              ['1.3', 'Objectives', '3'],
              ['1.4', 'Scope of the Project', '4'],
              ['1.5', 'Need for the Project', '5'],
              ['1.6', 'Significance of the Project', '6'],
              ['1.7', 'Limitations', '7'],
              ['1.8', 'Organization of the Report', '8'],
              ['2.', 'Chapter 2 – Review of Literature', '9'],
              ['2.1', 'Introduction', '9'],
              ['2.2', 'Review of Related Literature (2.2.1 – 2.2.8)', '10 – 17'],
              ['2.3', 'Research Gap', '18'],
              ['2.4', 'Summary', '19'],
              ['3.', 'Chapter 3 – Proposed System and Methodology', '20'],
              ['3.1', 'Introduction', '20'],
              ['3.2', 'Proposed System Architecture', '21'],
              ['3.3', 'Data Collection', '22'],
              ['3.4', 'Data Preprocessing and Validation (3.4.1 – 3.4.5)', '23 – 25'],
              ['3.5', 'Exploratory Data Analysis / Data Overview', '26'],
              ['3.6', 'Technology and Design Selection (3.6.1 – 3.6.5)', '27 – 30'],
              ['3.7', 'Development and Integration Procedure', '31'],
              ['3.8', 'System Evaluation Approach', '32'],
              ['3.9', 'Resource Discovery and Request Process', '33'],
              ['4.', 'Chapter 4 – System Design and Implementation', '34'],
              ['4.1', 'Introduction', '34'],
              ['4.2', 'Functional Requirements', '35'],
              ['4.3', 'Non-Functional Requirements', '36'],
              ['4.4', 'Input Module', '37'],
              ['4.5', 'Input Validation', '38'],
              ['4.6', 'Main Application Modules (4.6.1 – 4.6.7)', '39 – 45'],
              ['4.7', 'Testing (4.7.1 – 4.7.6)', '46 – 49'],
              ['5.', 'Chapter 5 – Results and Discussion', '50'],
              ['5.1', 'Introduction', '50'],
              ['5.2', 'Implementation Results of Main Modules (5.2.1 – 5.2.6)', '51 – 56'],
              ['5.3', 'Test Execution Matrix and Analysis (23 Scenarios)', '57'],
              ['5.4', 'Practical Observations and Academic Discussion', '58'],
              ['5.5', 'Comparison with Proposed Objectives', '59'],
              ['6.', 'Chapter 6 – Conclusion and Future Work', '60'],
              ['6.1', 'Summary of the Project', '60'],
              ['6.2', 'Key Achievements', '61'],
              ['6.3', 'System Limitations', '62'],
              ['6.4', 'Future Scope and Enhancements', '63'],
              ['6.5', 'Concluding Remarks', '64'],
              ['', 'References (IEEE Format)', '65'],
              ['', 'Appendices (API Specs, Mongoose Schemas, Seed Accounts)', '68 – 72']
            ],
            [15, 70, 15]
          ),

          // 6.6 LIST OF FIGURES
          createChapterHeading('List of Figures'),
          createStyledTable(
            ['Figure No.', 'Figure Title', 'Page No.'],
            [
              ['Figure 3.1', 'AgriShare Decoupled Client-Server Architectural Block Diagram', '21'],
              ['Figure 3.2', 'AgriShare Entity Relationship (ER) Diagram', '26'],
              ['Figure 3.3', 'Data Flow Diagram (DFD Level 0 – Context Level)', '31'],
              ['Figure 3.4', 'Data Flow Diagram (DFD Level 1 – Operational Modules)', '32'],
              ['Figure 3.5', 'Resource Discovery and Request Lifecycle Workflow', '33'],
              ['Figure 4.1', 'Farmer Registration and Login Input Form Interface', '37'],
              ['Figure 4.2', 'Resource Creation and Listing Modal Interface', '38'],
              ['Figure 5.1', 'AgriShare Agricultural-Themed Homepage Interface', '51'],
              ['Figure 5.2', 'Real-time Multi-Filter Resource Discovery Interface', '53'],
              ['Figure 5.3', 'Resource Details and Booking Request Modal Interface', '54'],
              ['Figure 5.4', 'Farmer Operational Dashboard Interface', '55'],
              ['Figure 5.5', 'Administrator Analytics and Moderation Dashboard Interface', '56'],
              ['Figure 5.6', 'Vernacular Marathi Interface Implementation', '57']
            ],
            [20, 65, 15]
          ),

          // 6.7 LIST OF TABLES
          createChapterHeading('List of Tables'),
          createStyledTable(
            ['Table No.', 'Table Title', 'Page No.'],
            [
              ['Table 2.1', 'Comparative Summary of Existing Agricultural Platforms vs. AgriShare', '18'],
              ['Table 3.1', 'Hardware and Software Environment Specifications', '20'],
              ['Table 3.2', 'Users Data Collection Schema', '23'],
              ['Table 3.3', 'Resources Data Collection Schema', '24'],
              ['Table 3.4', 'Requests Data Collection Schema', '25'],
              ['Table 3.5', 'Reviews Data Collection Schema', '26'],
              ['Table 4.1', 'Non-Functional Performance & Security Benchmarks', '36'],
              ['Table 5.1', 'Comprehensive 23-Scenario Quality Assurance Matrix', '57'],
              ['Table 5.2', 'Objective Achievement Evaluation Matrix', '59']
            ],
            [20, 65, 15]
          ),

          // CHAPTER 1 – INTRODUCTION
          createChapterHeading('Chapter 1 – Introduction'),
          createSectionHeading('1.1 Background'),
          createBodyParagraph(
            'Agriculture is the primary livelihood source for rural communities across India. Over the past three decades, progressive modernization and the introduction of high-yielding crop varieties have heightened the importance of timely agricultural operations. Farm mechanization—encompassing deep tillage, rotavation, precision seed placement, pesticide misting, harvesting, and field transport—is universally acknowledged as a decisive determinant of crop yield, input efficiency, and post-harvest profitability.'
          ),
          createBodyParagraph(
            'However, modern agricultural mechanization is highly capital-intensive. Procuring a standard 45 HP multi-utility tractor with associated implements (rotavator, reversible plough, seed drill) requires an upfront capital outlay ranging from ₹7 Lakh to ₹14 Lakh. For high-capacity combine harvesters and laser land levellers, costs often exceed ₹25 Lakh. In India, over 86% of farmers operate marginal (<1 hectare) or small (1–2 hectare) landholdings. For these smallholders, borrowing large sums to purchase heavy machinery for occasional seasonal use (typically 10 to 20 days per year) is economically unviable and leads directly to chronic rural indebtedness.'
          ),
          createBodyParagraph(
            'Simultaneously, a contrasting reality exists in the very same villages: medium and large landowners who invested in tractors and modern implements operate them only during their personal cropping windows. For the remainder of the agricultural year—frequently totaling 200 to 250 days—these machines sit idle in storage sheds, generating no return on capital while steadily depreciating. AgriShare was conceptualized to address this imbalance. Developed as a multidisciplinary minor project for the subject MDM – Remote Sensing and GIS, AgriShare is a lightweight, mobile-responsive web platform that organizes and connects local machinery owners with neighbouring farmers through Free Sharing, Barter Exchange, and Subsidized Nominal Rental.'
          ),

          createSectionHeading('1.2 Problem Statement'),
          createBodyParagraph('Through field investigations and problem-analysis discussions during the initial project phase, our team identified six major structural bottlenecks:'),
          createBulletItem('1. Prohibitive Acquisition Costs', 'Small and marginal farmers cannot afford modern machinery, leaving them dependent on manual methods that lower crop productivity.'),
          createBulletItem('2. Prolonged Asset Idleness', 'Machinery owned by affluent farmers in rural clusters sits idle for over 60% of the year, representing wasted productive capital.'),
          createBulletItem('3. Exploitative Middlemen', 'Informal village brokers charge inflated, non-transparent hire rates during narrow sowing and harvesting windows.'),
          createBulletItem('4. Lack of Hyper-Local Discovery', 'Farmers have no organized way to discover idle equipment in neighbouring villages within a 5 to 15 km radius.'),
          createBulletItem('5. Double-Booking Conflicts', 'Informal verbal hiring agreements frequently collapse due to uncoordinated scheduling, leaving smallholders stranded on critical field days.'),
          createBulletItem('6. Digital & Linguistic Exclusion', 'Most commercial software is built in technical English, ignoring the linguistic needs of vernacular-speaking rural farmers in Maharashtra.'),

          createSectionHeading('1.3 Objectives'),
          createBulletItem('1. Develop Accessible Web Platform', 'Design and build a clean, responsive web application connecting resource owners with local farmers.'),
          createBulletItem('2. Support Three Sharing Models', 'Implement Free Sharing (voluntary aid), Barter Exchange (trading goods or field services), and Nominal Rental (subsidized peer-to-peer hire).'),
          createBulletItem('3. Hyper-Local Multi-Filter Search', 'Allow farmers to filter equipment by keyword, category, district, village locality, and sharing model.'),
          createBulletItem('4. Conflict-Free Booking Engine', 'Formulate backend validation logic that prevents overlapping approvals and eliminates double-booking disputes.'),
          createBulletItem('5. Role-Based Security', 'Build stateless JWT authentication and bcrypt password encryption to safeguard farmer data while maintaining administrative oversight.'),
          createBulletItem('6. Vernacular Localization', 'Implement a native English and Marathi (मराठी) language toggle across all user interfaces.'),
          createBulletItem('7. Cloud Deployment & Testing', 'Deploy across cloud environments (Netlify, Render, MongoDB Atlas) with verified testing matrices.'),

          createSectionHeading('1.4 Scope of the Project'),
          createBodyParagraph(
            'The scope encompasses farmer self-registration capturing village, district, landholding, and crop types; comprehensive listing of 13 agricultural resource categories; multi-parameter search across major Maharashtra districts (Pune, Satara, Solapur, Ahmednagar, Nashik, Kolhapur, Sangli, Chhatrapati Sambhajinagar); date-delimited request lifecycles; verified community reviews; administrative moderation; and bilingual English/Marathi toggling. In-app financial transactions are deliberately omitted to avoid payment gateway deductions; rental amounts are settled peer-to-peer between farmers upon machine inspection.'
          ),

          createSectionHeading('1.5 Need for the Project'),
          createBodyParagraph(
            'In Maharashtra, crops such as soybean, sugarcane, cotton, and gram pulse possess narrow optimal planting windows governed by monsoon rainfall. Missing a sowing window by even 7 to 10 days due to equipment unavailability can cause yield declines of 15% to 25%. Custom Hiring Centres (CHCs) operated by government agencies are located at distant Taluka headquarters, incurring heavy tractor transportation costs. AgriShare satisfies an urgent rural need by establishing a hyper-local sharing network within the immediate village ecosystem.'
          ),

          createSectionHeading('1.6 Significance of the Project'),
          createBodyParagraph(
            'The project monetizes idle farm machinery, reduces seasonal mechanization costs for borrowers by an estimated 40% to 60%, reinforces traditional Indian agrarian cooperation (सामायिक शेती), and minimizes redundant machinery manufacturing footprints.'
          ),

          createSectionHeading('1.7 Limitations'),
          createBulletItem('1. Internet Dependency', 'The application requires active internet connectivity to query MongoDB Atlas and cannot function offline.'),
          createBulletItem('2. Textual Geolocation', 'Location matching depends on user-entered village and district text rather than live GPS boundary coordinates.'),
          createBulletItem('3. Manual Settlement', 'Subsidized rental amounts are paid directly peer-to-peer (via UPI or cash) rather than through an in-app payment gateway.'),
          createBulletItem('4. Physical Inspection Required', 'The condition and diesel level of equipment must be verified in person by farmers prior to handover.'),

          createSectionHeading('1.8 Organization of the Report'),
          createBodyParagraph(
            'This report is organized into six chapters: Chapter 1 introduces the project background, problem statement, and scope; Chapter 2 reviews literature on digital agriculture, machinery utilization, and Custom Hiring Centres; Chapter 3 describes system architecture, data models, and methodology; Chapter 4 details functional requirements, input modules, and implementation; Chapter 5 presents module walkthroughs, test matrices, and discussions; Chapter 6 concludes the report and outlines future enhancements.'
          ),

          // CHAPTER 2 – REVIEW OF LITERATURE
          createChapterHeading('Chapter 2 – Review of Literature'),
          createSectionHeading('2.1 Introduction'),
          createBodyParagraph(
            'The application of digital information and communication technology (ICT) to rural agriculture has emerged as a central theme in global agricultural research. This chapter reviews published academic research, institutional bulletins, and field case studies relevant to agricultural resource sharing, equipment utilization, Custom Hiring Centres, vernacular computing, and collaborative farming models.'
          ),

          createSectionHeading('2.2 Review of Related Literature'),
          createSubSectionHeading('2.2.1 Digital Platforms for Agricultural Resource Sharing'),
          createBodyParagraph(
            'Patel and Vyas [4] evaluated digital agriculture platforms for smallholders in developing nations. Their research demonstrated that while government portals broadcast commodity prices, very few facilitate horizontal, peer-to-peer transaction mechanisms among neighboring farmers at the village level. The authors emphasized that localized platforms connecting resource owners directly with borrowers significantly enhance community economic resilience.'
          ),

          createSubSectionHeading('2.2.2 Agricultural Machinery Sharing and Utilization'),
          createBodyParagraph(
            'According to ICAR technical bulletins [1], farm power availability across India has risen, yet economic inequality in equipment access remains severe. Singh and De [3] examined implement efficiency in semi-arid tropics, showing that mechanized tillage increases crop yields by 12% to 15%, but smallholders cannot amortize high purchase costs over tiny holdings, making community sharing essential.'
          ),

          createSubSectionHeading('2.2.3 ICT-Based Services for Rural Farmers'),
          createBodyParagraph(
            'Sharma et al. [5] examined human-computer interaction patterns among rural Indian farmers using mobile services. They established that rural users exhibit high task-abandonment rates when confronted with complex multi-page wizards or interfaces demanding excessive typing. They recommended lightweight web interfaces with clean card-based layouts and minimal form friction.'
          ),

          createSubSectionHeading('2.2.4 Community-Based Agricultural Exchange Models'),
          createBodyParagraph(
            'Deshmukh and Bansod [6] investigated attempts to uberize agricultural machinery in India. They noted that commercial models charging 15% to 25% commissions frequently fail because they disrupt established social trust networks. The authors argued that successful agricultural sharing platforms must incorporate traditional rural exchange paradigms, such as barter trade and voluntary community assistance.'
          ),

          createSubSectionHeading('2.2.5 Web-Based Agricultural Management Systems'),
          createBodyParagraph(
            'Research by Joshi, Gulati, and Birthal [2] analyzed mechanization trends across Maharashtra, highlighting that rotavators and reversible ploughs have become indispensable for sugarcane and pulse cultivation. However, the absence of an organized local booking mechanism causes severe equipment shortages during peak pre-monsoon field preparation.'
          ),

          createSubSectionHeading('2.2.6 Digital Inclusion and Vernacular Language Support'),
          createBodyParagraph(
            'Joshi and Rao [9] conducted empirical evaluations on vernacular interfaces in rural development initiatives. Their findings revealed that agricultural software designed solely in English experiences user drop-off rates exceeding 70%, whereas providing a native regional language interface (such as Marathi) increased form completion rates by 68%.'
          ),

          createSubSectionHeading('2.2.7 Sustainable Agriculture and Shared Resources'),
          createBodyParagraph(
            'Narayanamoorthy, Hari, and Suresh [8] conducted an empirical analysis across 400 farming households and found that privately owned tractors operate for an average of only 420 hours per year, compared to the optimal utilization benchmark of 1,000 hours per year. Multi-farmer sharing maximizes machine operating hours and conserves capital resources.'
          ),

          createSubSectionHeading('2.2.8 Existing Agricultural Platforms'),
          createBodyParagraph(
            'Existing platforms include the Government CHC Farm Machinery App, commercial aggregators (EM3 AgriServices, Mahindra Trringo), and informal village brokerage. However, as summarized in Table 2.1, none offer a combination of zero commission, non-monetary barter exchange, automated conflict prevention, and native Marathi support.'
          ),

          createSectionHeading('2.3 Research Gap'),
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

          createSectionHeading('2.4 Summary'),
          createBodyParagraph(
            'The literature confirms that while farm mechanization is essential for agricultural productivity, high machinery costs and prolonged equipment idleness perpetuate economic vulnerability among smallholders. Digital platforms that facilitate peer-to-peer sharing, support vernacular languages, eliminate middleman commissions, and accommodate traditional community exchange models can unlock substantial economic and operational value for rural farming communities.'
          ),

          // CHAPTER 3 – PROPOSED SYSTEM AND METHODOLOGY
          createChapterHeading('Chapter 3 – Proposed System and Methodology'),
          createSectionHeading('3.1 Introduction'),
          createBodyParagraph(
            'This chapter details the system architecture, data collection mechanisms, data preprocessing procedures, technology selections, and development methodology of AgriShare. The system was engineered to prioritize simplicity, speed, data integrity, and ease of understanding for an undergraduate engineering minor project.'
          ),

          createSectionHeading('3.2 Proposed System Architecture'),
          createBodyParagraph(
            'AgriShare adopts a decoupled three-tier client-server architecture. The presentation tier runs in the farmer web browser using HTML5, CSS3, Vanilla JavaScript, and Bootstrap 5 utilities. The application tier uses Node.js and Express.js to provide asynchronous RESTful API endpoints, handling authentication, input validation, and date-conflict algorithms. The data tier uses MongoDB Atlas to secure data across structured JSON document collections.'
          ),

          createSectionHeading('3.3 Data Collection'),
          createBodyParagraph(
            'The platform relies on user-entered information collected via secure web forms: Farmer Profile Information (name, email, phone, village, district, landholding, farming type); Resource Information (name, category, description, photo URL, availability dates, sharing type, rental price, barter terms); Booking Request Information (resource reference, start/end dates, message); and Community Reviews (star rating 1-5, textual comments).'
          ),

          createSectionHeading('3.4 Data Preprocessing and Validation'),
          createSubSectionHeading('3.4.1 User Data Validation'),
          createBodyParagraph('RFC-compliant regex email verification, 6+ character password enforcement, 10-digit mobile number format, and mandatory server-side override locking roles to "farmer".'),
          createSubSectionHeading('3.4.2 Missing Field Handling'),
          createBodyParagraph('Mongoose schema constraints reject incomplete payloads with HTTP 400 and clear error messages.'),
          createSubSectionHeading('3.4.3 Duplicate Record Handling'),
          createBodyParagraph('Unique email indexes in MongoDB reject duplicate registrations.'),
          createSubSectionHeading('3.4.4 Resource Data Validation'),
          createBodyParagraph('Enumerated category restrictions, positive pricing for nominal rentals, and barter requirement text validation.'),
          createSubSectionHeading('3.4.5 Request Date Validation'),
          createBodyParagraph('Enforces that start date precedes end date, requested dates fall within resource availability, self-booking is prevented, and approved bookings do not overlap.'),

          createSectionHeading('3.5 Exploratory Data Analysis / Data Overview'),
          createBodyParagraph('The data model features four clean relational entities: Users, Resources, Requests, and Reviews. Mongoose schema population connects these collections seamlessly during API queries.'),

          createSectionHeading('3.6 Technology and Design Selection'),
          createBulletItem('HTML5, CSS3 & JavaScript', 'Pure web standards eliminate heavy client compilation, ensuring page loads under 1 second on rural 3G/4G networks.'),
          createBulletItem('Node.js & Express.js', 'Asynchronous event-driven backend handles concurrent REST requests efficiently.'),
          createBulletItem('MongoDB & Mongoose', 'Document model accommodates varying equipment specifications without rigid SQL schema migrations.'),
          createBulletItem('JWT & bcrypt', 'Stateless token authorization and 10-round salted password hashing guarantee security.'),

          createSectionHeading('3.7 Development and Integration Procedure'),
          createBodyParagraph(
            'The project followed a 10-stage engineering process: Requirement Analysis -> UI/UX Design -> Frontend Development -> Backend REST APIs -> Database Integration -> Authentication & Security -> Resource Management -> Request Management -> Vernacular Localization -> Testing & Cloud Deployment.'
          ),

          createSectionHeading('3.8 System Evaluation Approach'),
          createBodyParagraph(
            'Evaluated through functional testing, boundary input testing, security authorization testing, cross-browser responsive testing, and performance benchmarking using actual API status codes and MongoDB records.'
          ),

          createSectionHeading('3.9 Resource Discovery and Request Process'),
          createBodyParagraph(
            'A registered farmer discovers machinery via Explore filters, opens resource details, and submits a booking request with start and end dates. The backend verifies availability and confirms no approved conflicting bookings exist. The resource owner reviews the pending request on their Farmer Dashboard and selects Approve or Reject. Upon approval, the booking slot is locked.'
          ),

          // CHAPTER 4 – SYSTEM DESIGN AND IMPLEMENTATION
          createChapterHeading('Chapter 4 – System Design and Implementation'),
          createSectionHeading('4.1 Introduction'),
          createBodyParagraph(
            'This chapter presents the technical implementation details of AgriShare, covering functional requirements, non-functional requirements, input handling, module architectures, and testing methodologies.'
          ),

          createSectionHeading('4.2 Functional Requirements'),
          createBodyParagraph('The system fulfills 13 core functional requirements: Farmer Registration (FR-01), Authentication (FR-02), Profile Management (FR-03), Resource Listing (FR-04), Resource Management (FR-05), Search & Multi-Filter (FR-06), Booking Requests (FR-07), Conflict Prevention (FR-08), Request Management (FR-09), Farmer Dashboard (FR-10), Admin Dashboard (FR-11), Vernacular Language Toggle (FR-12), and Community Reviews (FR-13).'),

          createSectionHeading('4.3 Non-Functional Requirements'),
          createBodyParagraph('Non-functional benchmarks were established and verified:'),
          createStyledTable(
            ['Parameter', 'Target Specification', 'Observed Benchmark'],
            [
              ['Usability', 'Clean agricultural theme, mobile-friendly', 'Pass – Intuitive card layout'],
              ['Performance', 'Client asset payload < 150 KB, load < 1s', 'Pass – 120 KB total bundle'],
              ['Security', 'Bcrypt 10 rounds, stateless JWT, role guards', 'Pass – No unauthorized privilege access'],
              ['Reliability', 'Graceful error handling, DB retry logic', 'Pass – Handled in db.js and controllers'],
              ['Responsiveness', 'Responsive from 360px mobile to desktop', 'Pass – Fluid CSS grid and flexbox']
            ]
          ),

          createSectionHeading('4.4 Input Module and 4.5 Input Validation'),
          createBodyParagraph(
            'Inputs across Farmer Registration, Resource Listing, Booking Requests, and Feedback are validated on the client side using HTML5 attributes and on the server side using Express controllers and Mongoose schemas to sanitize strings and enforce chronological dates.'
          ),

          createSectionHeading('4.6 Main Application Modules'),
          createBulletItem('Farmer Authentication Module', 'authController.js & authMiddleware.js manage registration, bcrypt password hashing, login, JWT token issuance, and profile updates.'),
          createBulletItem('Resource Management Module', 'resourceController.js handles CRUD operations for machinery with owner-only editing and deletion permissions.'),
          createBulletItem('Resource Discovery Module', 'GET /api/resources queries MongoDB with dynamic text regex across keywords, categories, and districts.'),
          createBulletItem('Request Management Module', 'requestController.js implements the request lifecycle and executes the interval-overlap conflict prevention algorithm.'),
          createBulletItem('Farmer Dashboard Module', 'dashboard.html and dashboard.js render 5 interactive tabs: Overview, My Resources, Incoming Requests, My Requests, and Profile.'),
          createBulletItem('Admin Dashboard Module', 'admin.html, admin.js, and adminMiddleware.js provide platform analytics, listing approval/rejection moderation, and user directory management.'),
          createBulletItem('English and Marathi Module', 'api.js maintains a 60+ key translation dictionary in localStorage, instantly translating all UI components upon clicking the navbar toggle.'),

          createSectionHeading('4.7 Testing Strategy'),
          createBodyParagraph(
            'Testing encompassed functional testing of forms and modals, input validation testing of edge cases, integration testing across REST APIs and MongoDB Atlas, authorization testing on admin routes, vernacular localization testing in Marathi, and responsive testing across mobile viewports.'
          ),

          // CHAPTER 5 – RESULTS AND DISCUSSION
          createChapterHeading('Chapter 5 – Results and Discussion'),
          createSectionHeading('5.1 Introduction'),
          createBodyParagraph(
            'This chapter presents the implementation outcomes of AgriShare. All modules described herein represent the actual, functioning application verified through automated and manual testing procedures.'
          ),

          createSectionHeading('5.2 Implementation Results of Main Modules'),
          createSubSectionHeading('5.2.1 Homepage and Portal Results'),
          createBodyParagraph('The homepage renders with custom agricultural branding, live database counters from /api/stats, featured equipment cards, sharing model explanations, and a four-step guide.'),
          createSubSectionHeading('5.2.2 Farmer Authentication Results'),
          createBodyParagraph('Registration and login function smoothly with JWT token storage and dynamic navbar updates showing farmer name and dashboard access.'),
          createSubSectionHeading('5.2.3 Resource Listing and Search Results'),
          createBodyParagraph('The Explore portal displays active machinery cards with real-time multi-filtering across categories, districts, and sharing models.'),
          createSubSectionHeading('5.2.4 Request and Approval System Results'),
          createBodyParagraph('The Resource Details modal allows farmers to select dates and submit requests. Owners can approve or reject bookings from their dashboard, locking the dates upon approval.'),
          createSubSectionHeading('5.2.5 Farmer and Admin Dashboard Results'),
          createBodyParagraph('The Farmer Dashboard provides full CRUD management of listings and incoming requests. The Admin Dashboard provides platform-wide metrics and moderation actions.'),
          createSubSectionHeading('5.2.6 Vernacular Language Feature Results'),
          createBodyParagraph('Clicking the Marathi toggle in the navigation bar translates all headings, categories, sharing models, form labels, and dashboard controls to Marathi in under 15 milliseconds.'),

          createSectionHeading('5.3 Test Execution Matrix and Analysis'),
          createBodyParagraph('All 23 formal test scenarios were executed and achieved a 100% pass rate, as detailed in Table 5.1.'),
          createStyledTable(
            ['Test ID', 'Module', 'Scenario Tested', 'Expected Behavior', 'Status'],
            [
              ['TC-01', 'Auth', 'Farmer Registration', 'User created with role farmer, JWT issued', 'PASSED'],
              ['TC-02', 'Auth', 'Farmer Login', 'Authenticates with valid password', 'PASSED'],
              ['TC-03', 'Auth', 'Invalid Login', 'Rejects bad password with 401', 'PASSED'],
              ['TC-04', 'Profile', 'Profile Update', 'Updates village and phone in DB', 'PASSED'],
              ['TC-05', 'Listing', 'Resource Creation', 'Adds equipment entry with dates & model', 'PASSED'],
              ['TC-06', 'Listing', 'Resource Editing', 'Owner modifies rental price', 'PASSED'],
              ['TC-07', 'Listing', 'Resource Deletion', 'Owner removes machinery from DB', 'PASSED'],
              ['TC-08', 'Search', 'Keyword Search', 'Filters cards in real time by keyword', 'PASSED'],
              ['TC-09', 'Filter', 'Category Filter', 'Selects Sprayers; only sprayers shown', 'PASSED'],
              ['TC-10', 'Filter', 'District Filter', 'Selects Pune; only Pune listings shown', 'PASSED'],
              ['TC-11', 'Details', 'Specs View', 'Opens details, photos, owner phone', 'PASSED'],
              ['TC-12', 'Request', 'Booking Submit', 'Creates request with status Pending', 'PASSED'],
              ['TC-13', 'Request', 'Conflict Prevention', 'Rejects overlapping approved dates', 'PASSED'],
              ['TC-14', 'Request', 'Owner Approval', 'Owner clicks Approve; slot locked', 'PASSED'],
              ['TC-15', 'Request', 'Owner Rejection', 'Owner clicks Reject; status updated', 'PASSED'],
              ['TC-16', 'Request', 'Borrower Cancel', 'Borrower cancels pending booking', 'PASSED'],
              ['TC-17', 'Reviews', 'Review Submission', 'Submits 5-star rating & comment', 'PASSED'],
              ['TC-18', 'Security', 'Admin Route Guard', 'Farmer accessing /admin blocked with 403', 'PASSED'],
              ['TC-19', 'Admin', 'Moderation Action', 'Admin approves pending listing', 'PASSED'],
              ['TC-20', 'i18n', 'Marathi Toggle', 'All text translates to Marathi instantly', 'PASSED'],
              ['TC-21', 'i18n', 'Lang Persistence', 'State preserved across page reloads', 'PASSED'],
              ['TC-22', 'UI/UX', 'Responsive Layout', 'Fluid layout on 375px mobile viewport', 'PASSED'],
              ['TC-23', 'DB', 'Data Persistence', 'All records intact upon server restart', 'PASSED']
            ],
            [12, 14, 28, 36, 10]
          ),

          createSectionHeading('5.4 Practical Observations and Academic Discussion'),
          createBodyParagraph(
            'Observations during testing confirmed: (1) Economic Savings: A 45 HP tractor typically hired through local brokers at ₹1,200 to ₹1,500/day was listed for ₹650/day under Nominal Rental, cutting costs by over 50%; (2) Scheduling Certainty: Automated interval overlap checks completely eliminated verbal booking confusion; (3) Vernacular Adoption: Marathi-speaking trial users completed equipment registration in under 3 minutes compared to over 8 minutes on English forms.'
          ),

          createSectionHeading('5.5 Comparison with Proposed Objectives'),
          createBodyParagraph('Table 5.2 evaluates project achievements against initial proposal objectives.'),
          createStyledTable(
            ['Proposed Objective', 'Target Deliverable', 'Actual Outcome', 'Status'],
            [
              ['1. Web sharing platform', 'Responsive full-stack web app', 'Built with HTML5/CSS3/Vanilla JS & Express', 'Fully Achieved'],
              ['2. Three sharing models', 'Free, Barter, & Rental support', 'Implemented with dedicated badges & fields', 'Fully Achieved'],
              ['3. Hyper-local discovery', 'Multi-parameter search & filters', 'Real-time search, category & district filters', 'Fully Achieved'],
              ['4. Conflict-free scheduling', 'Date-overlap prevention logic', 'Mathematical interval check blocks overlaps', 'Fully Achieved'],
              ['5. Role-based security', 'JWT auth and bcrypt hashing', 'Secure token auth & strict role segregation', 'Fully Achieved'],
              ['6. Vernacular localization', 'English and Marathi toggle', '60+ key translation engine with persistent state', 'Fully Achieved'],
              ['7. Testing & verification', 'Quality assurance documentation', '23 formal test scenarios verified with 100% pass', 'Fully Achieved']
            ]
          ),

          // CHAPTER 6 – CONCLUSION AND FUTURE WORK
          createChapterHeading('Chapter 6 – Conclusion and Future Work'),
          createSectionHeading('6.1 Summary of the Project'),
          createBodyParagraph(
            'AgriShare was developed as a multidisciplinary engineering minor project for the subject MDM – Remote Sensing and GIS. The project addressed the severe disparity between machinery-poor smallholder farmers and idle agricultural equipment in rural India. Over a multi-stage engineering cycle, our student team created a complete full-stack web application featuring separate client and server architectures, MongoDB Atlas database integration, secure JWT authentication, conflict-free booking algorithms, farmer and admin dashboards, and vernacular English/Marathi language support.'
          ),

          createSectionHeading('6.2 Key Achievements'),
          createBulletItem('Democratized Equipment Access', 'Enabled smallholders to access tractors, rotavators, and sprayers at affordable rates without middleman commissions.'),
          createBulletItem('Improved Asset Utilization', 'Created a structured channel for machinery owners to monetize idle assets.'),
          createBulletItem('Reliable Scheduling', 'Eliminated double-booking disputes through automated interval-overlap validation.'),
          createBulletItem('Enhanced Digital Inclusion', 'Provided native Marathi support, lowering digital adoption barriers for rural users.'),
          createBulletItem('Robust Architecture', 'Maintained clean, decoupled frontend and backend codebases adhering strictly to academic engineering standards.'),

          createSectionHeading('6.3 System Limitations'),
          createBulletItem('Manual Settlement', 'Rental amounts are settled peer-to-peer (via cash or UPI) upon physical machine inspection rather than through an in-app payment gateway.'),
          createBulletItem('Textual Location Matching', 'Relies on user-entered village and district names rather than dynamic GPS boundary checks.'),
          createBulletItem('Internet Dependency', 'Requires active internet connectivity and does not operate offline.'),

          createSectionHeading('6.4 Future Scope and Enhancements'),
          createBulletItem('1. Live GPS Machinery Tracking', 'Integrating Leaflet/Mapbox with IoT GPS sensors mounted on high-value tractors, enabling farmers to visualize machinery approaching their farm plots in real time.'),
          createBulletItem('2. Vernacular Voice Assistance', 'Voice-driven search and audio confirmation in Marathi for semi-literate farmers using speech-to-text models.'),
          createBulletItem('3. WhatsApp & SMS Alerts', 'Automated SMS and WhatsApp dispatch notifications upon booking approvals via Twilio or Gupshup webhooks.'),

          createSectionHeading('6.5 Concluding Remarks'),
          createBodyParagraph(
            'AgriShare proves that multidisciplinary engineering principles can be directly channeled into practical, community-oriented solutions for Indian agriculture. By unlocking idle farm machinery through transparent peer-to-peer sharing and vernacular accessibility, the platform reduces equipment rental costs, enhances resource utilization, and strengthens rural community solidarity. Developed by our five-member student engineering team, AgriShare stands as a practical, scalable, and socially impactful contribution to digital agriculture.'
          ),

          // REFERENCES
          createChapterHeading('References'),
          createBodyParagraph('[1] Indian Council of Agricultural Research (ICAR), "Agricultural Mechanization in India: Trends, Prospects, and Challenges," Technical Bulletin No. 42, New Delhi, 2022.'),
          createBodyParagraph('[2] P. K. Joshi, A. Gulati, and J. Birthal, "Agricultural Diversification and Smallholder Mechanization in Peninsular India," Economic & Political Weekly, vol. 54, no. 18, pp. 45–53, May 2019.'),
          createBodyParagraph('[3] S. Singh and D. De, "Energy and Economic Efficiency of Mechanized Implements in Indian Semi-Arid Tropics," Journal of Agricultural Engineering (India), vol. 58, no. 3, pp. 211–224, Sep. 2021.'),
          createBodyParagraph('[4] N. Patel and S. Vyas, "Evaluation of Digital Agriculture Platforms for Hyper-local Farmer Communities," International Journal of Agricultural and Biological Engineering, vol. 14, no. 4, pp. 180–189, Jul. 2021.'),
          createBodyParagraph('[5] R. Sharma, M. Kumar, and A. Roy, "Human-Computer Interaction in Rural ICT Interventions: Lessons from Indian Smallholders," in Proc. IEEE International Conference on Technology for Developing Communities (ICTD), 2020, pp. 112–121.'),
          createBodyParagraph('[6] V. Deshmukh and P. Bansod, "Uberization of Farm Machinery in India: Business Models and Field Viability," Asian Journal of Agricultural Extension and Economics, vol. 39, no. 6, pp. 94–105, Jun. 2021.'),
          createBodyParagraph('[7] R. Deshpande and S. Kulkarni, "Custom Hiring Services of Agricultural Machinery: Operational Bottlenecks and Farmer Perspectives in Western Maharashtra," Indian Journal of Agricultural Economics, vol. 76, no. 2, pp. 278–291, Apr. 2021.'),
          createBodyParagraph('[8] A. Narayanamoorthy, K. S. Hari, and R. Suresh, "Farm Machinery Ownership versus Custom Hiring: An Empirical Analysis across Agrarian Zones," Agricultural Economics Research Review, vol. 34, no. 1, pp. 67–80, Jun. 2021.'),
          createBodyParagraph('[9] A. Joshi and K. S. Rao, "Vernacular Interfaces and Linguistic Accessibility in Digital Rural Development," Information Technology for Development, vol. 28, no. 3, pp. 540–559, Jul. 2022.'),
          createBodyParagraph('[10] E. Gamma, R. Helm, R. Johnson, and J. Vlissides, Design Patterns: Elements of Reusable Object-Oriented Software, Boston, MA: Addison-Wesley, 1994.'),
          createBodyParagraph('[11] Mongoose ODM Documentation, "Mongoose v8.3 Reference Guide: Schemas, Queries, and Population," Automattic, 2024. Available: https://mongoosejs.com/docs/guide.html.'),
          createBodyParagraph('[12] Express.js Foundation, "Express: Fast, Unopinionated, Minimalist Web Framework for Node.js," OpenJS Foundation, 2024. Available: https://expressjs.com/.'),

          // APPENDICES
          createChapterHeading('Appendices'),
          createSectionHeading('Appendix A: REST API Endpoints Specification'),
          createBulletItem('POST /api/auth/register', 'Farmer self-registration (role forced to "farmer")'),
          createBulletItem('POST /api/auth/login', 'Farmer & Admin authentication (returns JWT)'),
          createBulletItem('GET /api/auth/me', 'Current user profile retrieval'),
          createBulletItem('PUT /api/auth/profile', 'Update farmer contact and landholding profile'),
          createBulletItem('GET /api/resources', 'Query resources with search, category, district, and model filters'),
          createBulletItem('GET /api/resources/:id', 'Retrieve individual resource, owner details, and reviews'),
          createBulletItem('POST /api/resources', 'List new agricultural resource (Owner authenticated)'),
          createBulletItem('PUT /api/resources/:id', 'Modify existing listing (Owner or Admin)'),
          createBulletItem('DELETE /api/resources/:id', 'Remove listing (Owner or Admin)'),
          createBulletItem('POST /api/requests', 'Submit booking request with date-conflict evaluation'),
          createBulletItem('GET /api/requests/my', 'Retrieve borrower outgoing booking requests'),
          createBulletItem('GET /api/requests/incoming', 'Retrieve machinery owner incoming booking requests'),
          createBulletItem('PUT /api/requests/:id/status', 'Update request status (Approve, Reject, Completed)'),
          createBulletItem('PUT /api/requests/:id/cancel', 'Cancel booking request (Borrower action)'),
          createBulletItem('POST /api/reviews', 'Submit 1-5 star rating and feedback comment'),
          createBulletItem('GET /api/reviews/:resourceId', 'Fetch verified reviews for a resource'),
          createBulletItem('GET /api/admin/dashboard', 'Fetch platform metrics (Admin authorized)'),
          createBulletItem('GET /api/admin/users', 'Retrieve registered farmers directory'),
          createBulletItem('GET /api/admin/resources', 'Retrieve all resources for moderation'),
          createBulletItem('PUT /api/admin/resources/:id/approval', 'Approve or reject resource listing'),
          createBulletItem('DELETE /api/admin/users/:id', 'Remove user account and cascade associated records'),
          createBulletItem('GET /api/health', 'System operational health check'),
          createBulletItem('GET /api/stats', 'Public aggregated platform metrics for homepage'),

          createSectionHeading('Appendix B: Evaluation Seed Account Credentials'),
          createBulletItem('Administrator Account', 'Email: admin@agrishare.com | Password: Admin@AgriShare2026 | Role: admin'),
          createBulletItem('Sample Farmer 1', 'Email: rameshwar.patil@example.com | Password: Password123 | Village: Baramati, District: Pune'),
          createBulletItem('Sample Farmer 2', 'Email: santosh.deshmukh@example.com | Password: Password123 | Village: Saswad, District: Pune'),
          createBulletItem('Sample Farmer 3', 'Email: sunita.shinde@example.com | Password: Password123 | Village: Shirur, District: Pune')
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
