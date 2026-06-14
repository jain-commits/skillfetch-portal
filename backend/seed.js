const mongoose = require('mongoose');
const axios = require('axios'); // Used to fetch the images on the backend
const { User, Job, Application } = require('./models');

// ==========================================
// DUMMY DATA POOLS FOR GENERATION
// ==========================================

const companies = [
  'Tata Consultancy Services', 'Infosys', 'Wipro', 'HCL Technologies', 'Tech Mahindra', 
  'LTIMindtree', 'Mphasis', 'Persistent Systems', 'Coforge', 'Oracle Financial Services',
  'Hexaware Technologies', 'KPIT Technologies', 'Birlasoft', 'Zensar Technologies', 
  'Cyient', 'Sonata Software', 'Newgen Software', 'Ramco Systems', 'Sasken Technologies', 
  'eClerx', 'Flipkart', 'Paytm', 'PhonePe', 'Zomato', 'Swiggy', 'Ola', 'Razorpay', 
  'CRED', 'Meesho', 'Myntra', 'Nykaa', 'Freshworks', 'Zoho', 'BrowserStack', 'Postman', 
  'Unacademy', 'upGrad', 'NoBroker', 'Policybazaar', 'Lenskart', 'Reliance Jio', 
  'Bharti Airtel', 'Vodafone Idea', 'BSNL', 'Tata Communications', 'Microsoft', 
  'Google', 'Apple', 'Amazon', 'Meta', 'IBM', 'Oracle', 'Salesforce', 'Adobe', 'SAP', 
  'Intel', 'AMD', 'NVIDIA', 'Cisco', 'Dell Technologies', 'HP', 'Lenovo', 'Accenture', 
  'Capgemini', 'Cognizant', 'OpenAI', 'Netflix', 'Spotify', 'Uber', 'Samsung', 'Sony'
];

const companyDomains = {
  'Tata Consultancy Services': 'tcs.com', 'Infosys': 'infosys.com', 'Wipro': 'wipro.com', 
  'HCL Technologies': 'hcltech.com', 'Tech Mahindra': 'techmahindra.com', 'LTIMindtree': 'ltimindtree.com', 
  'Mphasis': 'mphasis.com', 'Persistent Systems': 'persistent.com', 'Coforge': 'coforge.com', 
  'Oracle Financial Services': 'oracle.com', 'Hexaware Technologies': 'hexaware.com', 
  'KPIT Technologies': 'kpit.com', 'Birlasoft': 'birlasoft.com', 'Zensar Technologies': 'zensar.com', 
  'Cyient': 'cyient.com', 'Sonata Software': 'sonata-software.com', 'Newgen Software': 'newgensoft.com', 
  'Ramco Systems': 'ramco.com', 'Sasken Technologies': 'sasken.com', 'eClerx': 'eclerx.com', 
  'Flipkart': 'flipkart.com', 'Paytm': 'paytm.com', 'PhonePe': 'phonepe.com', 'Zomato': 'zomato.com', 
  'Swiggy': 'swiggy.com', 'Ola': 'olacabs.com', 'Razorpay': 'razorpay.com', 'CRED': 'cred.club', 
  'Meesho': 'meesho.com', 'Myntra': 'myntra.com', 'Nykaa': 'nykaa.com', 'Freshworks': 'freshworks.com', 
  'Zoho': 'zoho.com', 'BrowserStack': 'browserstack.com', 'Postman': 'postman.com', 'Unacademy': 'unacademy.com', 
  'upGrad': 'upgrad.com', 'NoBroker': 'nobroker.in', 'Policybazaar': 'policybazaar.com', 'Lenskart': 'lenskart.com', 
  'Reliance Jio': 'jio.com', 'Bharti Airtel': 'airtel.in', 'Vodafone Idea': 'myvi.in', 'BSNL': 'bsnl.co.in', 
  'Tata Communications': 'tatacommunications.com', 'Microsoft': 'microsoft.com', 'Google': 'google.com', 
  'Apple': 'apple.com', 'Amazon': 'amazon.com', 'Meta': 'meta.com', 'IBM': 'ibm.com', 'Oracle': 'oracle.com', 
  'Salesforce': 'salesforce.com', 'Adobe': 'adobe.com', 'SAP': 'sap.com', 'Intel': 'intel.com', 'AMD': 'amd.com', 
  'NVIDIA': 'nvidia.com', 'Cisco': 'cisco.com', 'Dell Technologies': 'dell.com', 'HP': 'hp.com', 
  'Lenovo': 'lenovo.com', 'Accenture': 'accenture.com', 'Capgemini': 'capgemini.com', 'Cognizant': 'cognizant.com', 
  'OpenAI': 'openai.com', 'Netflix': 'netflix.com', 'Spotify': 'spotify.com', 'Uber': 'uber.com', 
  'Samsung': 'samsung.com', 'Sony': 'sony.com'
};

const locations = [
  'Bangalore, Karnataka', 'Bangalore, Karnataka', 'Bangalore, Karnataka', 
  'Trivandrum, Kerala', 'Trivandrum, Kerala', 'Kochi, Kerala', 'Kochi, Kerala', 
  'Kozhikode, Kerala', 'Chennai, Tamil Nadu', 'Hyderabad, Telangana', 
  'Pune, Maharashtra', 'Mumbai, Maharashtra', 'Gurugram, Haryana', 'Noida, UP',
  'Remote - India'
];

const jobTitles = [
  { title: 'Frontend Developer', category: 'Software Development', skills: 'React, Angular, HTML, CSS, JavaScript' },
  { title: 'Backend Engineer', category: 'Software Development', skills: 'Node.js, Express, Python, Java, Spring Boot' },
  { title: 'Full Stack Developer', category: 'Software Development', skills: 'MERN Stack, REST APIs, MongoDB, SQL' },
  { title: 'Data Scientist', category: 'Data Science & Analytics', skills: 'Python, Machine Learning, Pandas, SQL' },
  { title: 'DevOps Engineer', category: 'DevOps & Cloud', skills: 'AWS, Docker, Kubernetes, CI/CD, Jenkins' },
  { title: 'UI/UX Designer', category: 'Design & UX', skills: 'Figma, Adobe XD, Sketch, Wireframing' },
  { title: 'Product Manager', category: 'Product Management', skills: 'Agile, Scrum, Roadmap Planning, Jira' },
  { title: 'Android Developer', category: 'Software Development', skills: 'Kotlin, Java, Android Studio' },
  { title: 'iOS Developer', category: 'Software Development', skills: 'Swift, Objective-C, Xcode' },
  { title: 'Cloud Architect', category: 'DevOps & Cloud', skills: 'AWS, Azure, GCP, System Design' }
];

const types = ['Full-time', 'Full-time', 'Contract', 'Internship'];
const levels = ['Junior', 'Mid-Level', 'Senior'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateSalary = (level) => {
  let min = level === 'Junior' ? 4 : level === 'Mid-Level' ? 8 : 18;
  let max = min + (level === 'Junior' ? 3 : level === 'Mid-Level' ? 6 : 12);
  return `₹${min},00,000 - ₹${max},00,000 INR`;
};

// HELPER FUNCTION: Downloads image on the server and converts it to a Base64 Data URI
async function downloadLogoAsBase64(domain, companyName) {
  try {
    if (!domain) throw new Error("No domain");
    const url = `https://logo.clearbit.com/${domain}`;
    
    // Download image as binary arraybuffer
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'] || 'image/png';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    // Fallback directly to a pre-rendered text avatar link if the download fails
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0056b3&color=fff&size=128`;
  }
}

// ==========================================
// NEW HAND-CRAFTED IT/SOFTWARE JOBS
// ==========================================
const additionalJobsToSeed = [
  // --- WEB DESIGN & UI/UX ---
  { title: "Senior Web Designer", companyName: "CreativePulse Agency", category: "Design & Creative", type: "Full-time", location: "New York, NY", salaryRange: "$80,000 - $110,000", experienceLevel: "Senior", skillsRequired: "Figma, Adobe XD, HTML, CSS", description: "<p>We are seeking a visionary Web Designer to craft stunning, user-centric interfaces for our global clients.</p><ul><li>Design responsive web layouts</li><li>Collaborate with frontend teams</li><li>Conduct UX research</li></ul>", qualifications: "BFA in Design or equivalent, 5+ years of agency experience." },
  { title: "UI/UX Product Designer", companyName: "FinTech Innovators", category: "Design & Creative", type: "Remote", location: "Remote", salaryRange: "$90,000 - $125,000", experienceLevel: "Mid-Level", skillsRequired: "Sketch, InVision, Wireframing, Prototyping", description: "<p>Join our core product team to improve the usability and aesthetic of our financial dashboard.</p>", qualifications: "3+ years designing complex SaaS products. Strong portfolio required." },
  { title: "Junior Web/Graphic Designer", companyName: "LocalEats App", category: "Design & Creative", type: "Part-time", location: "Austin, TX", salaryRange: "$40,000 - $55,000", experienceLevel: "Junior", skillsRequired: "Photoshop, Illustrator, Webflow", description: "<p>Help us create engaging marketing websites and app assets for local restaurants.</p>", qualifications: "Degree in Graphic Design, strong understanding of typography and color theory." },
  { title: "Interaction Designer", companyName: "NextGen Gaming", category: "Design & Creative", type: "Full-time", location: "Seattle, WA", salaryRange: "$100,000 - $140,000", experienceLevel: "Mid-Level", skillsRequired: "Figma, Principle, After Effects", description: "<p>Create fluid micro-interactions and animations for our gaming community web portal.</p>", qualifications: "Experience with motion design and interactive web elements." },
  { title: "Accessibility Specialist (UX)", companyName: "GovTech Solutions", category: "Design & Creative", type: "Contract", location: "Washington, D.C.", salaryRange: "$70,000 - $90,000", experienceLevel: "Mid-Level", skillsRequired: "WCAG 2.1, ARIA, Screen Readers, HTML", description: "<p>Audit and redesign public-facing websites to ensure 100% ADA compliance and usability for all.</p>", qualifications: "Deep knowledge of web accessibility standards." },

  // --- ANDROID DEVELOPMENT ---
  { title: "Android Mobile Engineer", companyName: "HealthTrack", category: "Mobile Development", type: "Full-time", location: "Remote", salaryRange: "$110,000 - $140,000", experienceLevel: "Mid-Level", skillsRequired: "Kotlin, Android SDK, MVVM, Coroutines", description: "<p>Build life-saving features for our health tracking Android application used by millions.</p>", qualifications: "3+ years in native Android development. Published apps in the Play Store." },
  { title: "Senior Android Developer", companyName: "RideShare Co.", category: "Mobile Development", type: "Full-time", location: "San Francisco, CA", salaryRange: "$150,000 - $190,000", experienceLevel: "Senior", skillsRequired: "Kotlin, Java, Jetpack Compose, Dagger/Hilt", description: "<p>Lead a squad of mobile engineers optimizing our driver-facing Android app for real-time geolocation.</p>", qualifications: "6+ years Android experience, strong background in app architecture." },
  { title: "Android Developer Intern", companyName: "EdTech World", category: "Mobile Development", type: "Internship", location: "Boston, MA", salaryRange: "$20/hr", experienceLevel: "Junior", skillsRequired: "Java, Kotlin basics, Android Studio", description: "<p>Learn and contribute to our language-learning app alongside senior mobile engineers.</p>", qualifications: "Currently pursuing a BS in Computer Science." },
  { title: "Android UI/App Developer", companyName: "StreamFlix", category: "Mobile Development", type: "Full-time", location: "Los Angeles, CA", salaryRange: "$120,000 - $150,000", experienceLevel: "Mid-Level", skillsRequired: "Kotlin, ExoPlayer, Android TV", description: "<p>Focus on delivering a seamless, high-performance video streaming experience on Android mobile and TV.</p>", qualifications: "Experience with media playback and complex UI on Android." },
  { title: "React Native Developer (Android Focus)", companyName: "E-Shop Global", category: "Mobile Development", type: "Contract", location: "Remote", salaryRange: "$90,000 - $120,000", experienceLevel: "Mid-Level", skillsRequired: "React Native, Redux, Android Native Modules", description: "<p>Bridge the gap between our React Native codebase and native Android OS features.</p>", qualifications: "Strong JavaScript skills and experience linking native Android libraries." },

  // --- iOS DEVELOPMENT ---
  { title: "iOS App Developer", companyName: "FitLife Apps", category: "Mobile Development", type: "Full-time", location: "Denver, CO", salaryRange: "$105,000 - $135,000", experienceLevel: "Mid-Level", skillsRequired: "Swift, UIKit, CoreBluetooth", description: "<p>Develop features to sync our iOS app with external Bluetooth fitness hardware.</p>", qualifications: "3+ years of iOS development. Experience with hardware integration is a plus." },
  { title: "Lead iOS Engineer", companyName: "SecureBank", category: "Mobile Development", type: "Full-time", location: "New York, NY", salaryRange: "$160,000 - $200,000", experienceLevel: "Senior", skillsRequired: "Swift, SwiftUI, Combine, Security", description: "<p>Architect the next generation of our mobile banking app using SwiftUI and Combine.</p>", qualifications: "7+ years in iOS. Deep understanding of mobile security protocols." },
  { title: "Junior iOS Developer", companyName: "TravelBuddy", category: "Mobile Development", type: "Full-time", location: "Miami, FL", salaryRange: "$70,000 - $90,000", experienceLevel: "Junior", skillsRequired: "Swift, MapKit, CoreLocation", description: "<p>Help build interactive maps and routing features for our travel companion application.</p>", qualifications: "Bootcamp graduate or BS in CS. 1 published iOS app (can be a personal project)." },
  { title: "iOS UI Engineer", companyName: "PhotoMagic App", category: "Mobile Development", type: "Contract", location: "Remote", salaryRange: "$60 - $80/hr", experienceLevel: "Mid-Level", skillsRequired: "SwiftUI, CoreGraphics, CoreImage", description: "<p>Create highly custom, buttery-smooth photo editing interfaces using SwiftUI.</p>", qualifications: "Strong eye for design and deep knowledge of Apple's rendering frameworks." },
  { title: "Flutter Developer (iOS/Android)", companyName: "Startup Launchpad", category: "Mobile Development", type: "Full-time", location: "Chicago, IL", salaryRange: "$95,000 - $125,000", experienceLevel: "Mid-Level", skillsRequired: "Dart, Flutter, iOS Deployment", description: "<p>Build cross-platform MVPs for early-stage startups with a focus on native-like iOS performance.</p>", qualifications: "2+ years of Flutter experience and knowledge of App Store Connect." },

  // --- FRONTEND DEVELOPMENT ---
  { title: "Frontend React Developer", companyName: "CloudCRM", category: "Frontend Development", type: "Full-time", location: "Remote", salaryRange: "$100,000 - $130,000", experienceLevel: "Mid-Level", skillsRequired: "React, Redux Toolkit, Tailwind CSS, TypeScript", description: "<p>Develop complex single-page applications for our flagship CRM software.</p>", qualifications: "3+ years working with React and modern frontend build tools." },
  { title: "Senior Vue.js Engineer", companyName: "DataDash", category: "Frontend Development", type: "Full-time", location: "Toronto, ON", salaryRange: "$120,000 - $150,000", experienceLevel: "Senior", skillsRequired: "Vue 3, Pinia, Vite, Chart.js", description: "<p>Architect our high-performance data visualization dashboards using Vue 3 and Composition API.</p>", qualifications: "5+ years frontend experience, mastery of Vue ecosystem." },
  { title: "Web Accessibility Engineer", companyName: "Inclusive Web", category: "Frontend Development", type: "Contract", location: "Remote", salaryRange: "$80,000 - $110,000", experienceLevel: "Mid-Level", skillsRequired: "HTML5, ARIA, JavaScript, Jest", description: "<p>Refactor existing React components to meet strict WCAG 2.1 AA compliance.</p>", qualifications: "Experience with screen readers and keyboard navigation testing." },
  { title: "Angular Developer", companyName: "Enterprise Solutions Tech", category: "Frontend Development", type: "Full-time", location: "Dallas, TX", salaryRange: "$105,000 - $135,000", experienceLevel: "Mid-Level", skillsRequired: "Angular 14+, RxJS, TypeScript, SCSS", description: "<p>Maintain and expand our large-scale internal ERP systems using modern Angular practices.</p>", qualifications: "Strong OOP concepts and extensive experience with RxJS streams." },
  { title: "Junior Frontend Developer", companyName: "Digital Marketing Pro", category: "Frontend Development", type: "Part-time", location: "Remote", salaryRange: "$45,000 - $60,000", experienceLevel: "Junior", skillsRequired: "HTML, CSS, JavaScript, WordPress", description: "<p>Build pixel-perfect landing pages and email templates for our marketing campaigns.</p>", qualifications: "Basic understanding of DOM manipulation and CSS Flexbox/Grid." },

  // --- BACKEND DEVELOPMENT ---
  { title: "Node.js Backend Engineer", companyName: "API Forge", category: "Backend Development", type: "Full-time", location: "Remote", salaryRange: "$110,000 - $145,000", experienceLevel: "Mid-Level", skillsRequired: "Node.js, Express, MongoDB, Redis", description: "<p>Design and build scalable RESTful APIs handling millions of requests per day.</p>", qualifications: "3+ years of backend Node.js experience. Knowledge of caching strategies." },
  { title: "Senior Python/Django Developer", companyName: "NewsCorp Digital", category: "Backend Development", type: "Full-time", location: "New York, NY", salaryRange: "$140,000 - $180,000", experienceLevel: "Senior", skillsRequired: "Python, Django, PostgreSQL, Celery", description: "<p>Lead the backend infrastructure for our high-traffic content delivery and syndication platform.</p>", qualifications: "6+ years Python experience. Expertise in database query optimization." },
  { title: "Java Spring Boot Engineer", companyName: "Global Logistics", category: "Backend Development", type: "Full-time", location: "Atlanta, GA", salaryRange: "$115,000 - $150,000", experienceLevel: "Mid-Level", skillsRequired: "Java, Spring Boot, Microservices, Kafka", description: "<p>Develop microservices for our real-time supply chain tracking system.</p>", qualifications: "Solid understanding of Java 11+, Spring framework, and event-driven architecture." },
  { title: "Go (Golang) Developer", companyName: "CloudScale Systems", category: "Backend Development", type: "Remote", location: "Remote", salaryRange: "$130,000 - $165,000", experienceLevel: "Senior", skillsRequired: "Golang, gRPC, Docker, Kubernetes", description: "<p>Rewrite legacy Ruby services into highly concurrent and efficient Go microservices.</p>", qualifications: "Experience in building distributed systems using Go." },
  { title: "Junior PHP/Laravel Developer", companyName: "WebShop Creatives", category: "Backend Development", type: "Full-time", location: "Orlando, FL", salaryRange: "$60,000 - $80,000", experienceLevel: "Junior", skillsRequired: "PHP, Laravel, MySQL, Git", description: "<p>Assist in building custom e-commerce backend plugins and integrating third-party payment gateways.</p>", qualifications: "Understanding of MVC architecture and basic relational databases." },

  // --- FULL STACK DEVELOPMENT ---
  { title: "Full Stack Developer (MERN)", companyName: "Startup Hub", category: "Full Stack Development", type: "Full-time", location: "Austin, TX", salaryRange: "$100,000 - $130,000", experienceLevel: "Mid-Level", skillsRequired: "MongoDB, Express, React, Node.js", description: "<p>Own features end-to-end, from crafting the React UI to defining the MongoDB schemas.</p>", qualifications: "Proven experience building full-stack applications with the MERN stack." },
  { title: "Senior Full Stack Engineer (Next.js)", companyName: "E-Commerce Plus", category: "Full Stack Development", type: "Remote", location: "Remote", salaryRange: "$130,000 - $160,000", experienceLevel: "Senior", skillsRequired: "Next.js, TypeScript, Prisma, PostgreSQL", description: "<p>Lead the transition of our storefront to a headless Next.js architecture with SSR/SSG.</p>", qualifications: "5+ years experience. Strong understanding of server-side rendering and API routes." },
  { title: "Full Stack Python Developer", companyName: "HealthAI", category: "Full Stack Development", type: "Full-time", location: "Boston, MA", salaryRange: "$110,000 - $140,000", experienceLevel: "Mid-Level", skillsRequired: "Python, FastAPI, React, Docker", description: "<p>Build internal tools and dashboards that interface directly with our machine learning models.</p>", qualifications: "Experience connecting React frontends to Python/FastAPI backends." },
  { title: "C# / .NET Full Stack Developer", companyName: "Enterprise Finance Hub", category: "Full Stack Development", type: "Full-time", location: "Charlotte, NC", salaryRange: "$115,000 - $145,000", experienceLevel: "Mid-Level", skillsRequired: "C#, .NET Core, Angular, SQL Server", description: "<p>Develop secure, robust internal banking applications using the Microsoft technology stack.</p>", qualifications: "4+ years working in corporate environments with .NET and Angular." },
  { title: "Junior Full Stack Dev", companyName: "TechForGood Non-Profit", category: "Full Stack Development", type: "Contract", location: "Remote", salaryRange: "$55,000 - $75,000", experienceLevel: "Junior", skillsRequired: "JavaScript, React, Firebase", description: "<p>Help build scalable web platforms to coordinate volunteer efforts globally using Firebase.</p>", qualifications: "Personal projects demonstrating full-stack capability using serverless/BaaS." },

  // --- CLOUD / DEVOPS ---
  { title: "Cloud Infrastructure Engineer", companyName: "NetOps Global", category: "Cloud & DevOps", type: "Full-time", location: "Remote", salaryRange: "$130,000 - $170,000", experienceLevel: "Senior", skillsRequired: "AWS, Terraform, CI/CD, Linux", description: "<p>Design and deploy infrastructure as code (IaC) to support highly available microservices.</p>", qualifications: "AWS Certified Solutions Architect. 4+ years of DevOps experience." },
  { title: "DevOps Engineer", companyName: "SaaS Builders", category: "Cloud & DevOps", type: "Full-time", location: "Seattle, WA", salaryRange: "$120,000 - $150,000", experienceLevel: "Mid-Level", skillsRequired: "Docker, Kubernetes, GitHub Actions, Python", description: "<p>Streamline our developer experience by optimizing deployment pipelines and container orchestration.</p>", qualifications: "Hands-on experience managing Kubernetes clusters in production." },
  { title: "Site Reliability Engineer (SRE)", companyName: "FinTech Innovators", category: "Cloud & DevOps", type: "Full-time", location: "New York, NY", salaryRange: "$140,000 - $180,000", experienceLevel: "Senior", skillsRequired: "Prometheus, Grafana, AWS, Go/Python", description: "<p>Ensure 99.99% uptime for our core transaction systems. Lead incident response and post-mortems.</p>", qualifications: "Deep understanding of observability, networking, and system performance tuning." },
  { title: "Azure Cloud Architect", companyName: "CorpSolutions", category: "Cloud & DevOps", type: "Contract", location: "Dallas, TX", salaryRange: "$80 - $110/hr", experienceLevel: "Senior", skillsRequired: "Azure, ARM Templates, Azure DevOps", description: "<p>Migrate legacy on-premise Windows applications into a modern Azure cloud environment.</p>", qualifications: "10+ years IT experience, recent focus on Microsoft Azure migrations." },
  { title: "Junior Cloud Administrator", companyName: "HostWeb Inc", category: "Cloud & DevOps", type: "Full-time", location: "Remote", salaryRange: "$65,000 - $85,000", experienceLevel: "Junior", skillsRequired: "Linux Admin, Bash scripting, AWS EC2", description: "<p>Monitor server health, manage backups, and handle level 2 support escalations for cloud servers.</p>", qualifications: "CompTIA Linux+ or AWS Cloud Practitioner certification." },

  // --- DATA / AI / ML ---
  { title: "Data Scientist", companyName: "Retail Analytics", category: "Data Science & AI", type: "Full-time", location: "Chicago, IL", salaryRange: "$110,000 - $145,000", experienceLevel: "Mid-Level", skillsRequired: "Python, Pandas, Scikit-Learn, SQL", description: "<p>Analyze consumer purchasing behavior to build predictive models for inventory management.</p>", qualifications: "MS in Statistics, Computer Science, or Data Science." },
  { title: "Machine Learning Engineer", companyName: "Visionary AI", category: "Data Science & AI", type: "Full-time", location: "San Jose, CA", salaryRange: "$150,000 - $190,000", experienceLevel: "Senior", skillsRequired: "PyTorch, TensorFlow, Computer Vision", description: "<p>Develop and deploy state-of-the-art computer vision models for autonomous drone navigation.</p>", qualifications: "Ph.D. or MS with 4+ years industry experience in Deep Learning." },
  { title: "Data Analyst", companyName: "Media Streamers", category: "Data Science & AI", type: "Full-time", location: "Remote", salaryRange: "$75,000 - $95,000", experienceLevel: "Junior", skillsRequired: "SQL, Tableau, Excel, Basic Python", description: "<p>Create visual dashboards and daily reports tracking user engagement and retention metrics.</p>", qualifications: "Strong analytical skills and proficiency in data visualization tools." },
  { title: "Data Engineer", companyName: "BigData Corp", category: "Data Science & AI", type: "Full-time", location: "Austin, TX", salaryRange: "$125,000 - $160,000", experienceLevel: "Mid-Level", skillsRequired: "Apache Spark, Airflow, Snowflake, Python", description: "<p>Build scalable ETL pipelines to ingest terabytes of raw data into our Snowflake data warehouse.</p>", qualifications: "Experience with distributed data processing and cloud data warehouses." },
  { title: "AI Prompt Engineer / NLP Specialist", companyName: "ChatBot Solutions", category: "Data Science & AI", type: "Contract", location: "Remote", salaryRange: "$90,000 - $120,000", experienceLevel: "Mid-Level", skillsRequired: "OpenAI API, Prompting, Python, LangChain", description: "<p>Optimize LLM prompts and integrate LangChain to build intelligent customer support agents.</p>", qualifications: "Experience working with GPT-based models and natural language processing." },

  // --- QA / TESTING ---
  { title: "QA Automation Engineer", companyName: "QualityFirst Soft", category: "QA & Testing", type: "Full-time", location: "Remote", salaryRange: "$90,000 - $120,000", experienceLevel: "Mid-Level", skillsRequired: "Selenium, Cypress, JavaScript, CI/CD", description: "<p>Build end-to-end automated testing suites for our primary web application using Cypress.</p>", qualifications: "3+ years writing automated test scripts in JavaScript/TypeScript." },
  { title: "Software Test Engineer (Manual)", companyName: "GameStudios", category: "QA & Testing", type: "Contract", location: "Los Angeles, CA", salaryRange: "$50,000 - $70,000", experienceLevel: "Junior", skillsRequired: "Jira, Bug Tracking, Test Cases", description: "<p>Playtest unreleased game builds, identify bugs, and write detailed reproduction steps in Jira.</p>", qualifications: "High attention to detail and passion for gaming software." },
  { title: "SDET (Software Dev Engineer in Test)", companyName: "SecureBank", category: "QA & Testing", type: "Full-time", location: "New York, NY", salaryRange: "$130,000 - $160,000", experienceLevel: "Senior", skillsRequired: "Java, Appium, Selenium, RestAssured", description: "<p>Architect the testing framework for both our mobile and backend API banking services.</p>", qualifications: "Ability to write production-level code to test production code." },
  { title: "Performance / Load Tester", companyName: "EventTix", category: "QA & Testing", type: "Full-time", location: "Remote", salaryRange: "$100,000 - $130,000", experienceLevel: "Mid-Level", skillsRequired: "JMeter, Gatling, AWS, Datadog", description: "<p>Simulate high-traffic events to ensure our ticketing system can handle massive traffic spikes.</p>", qualifications: "Experience designing load/stress tests and analyzing server bottlenecks." },
  { title: "Mobile QA Tester", companyName: "AppMakers", category: "QA & Testing", type: "Part-time", location: "Denver, CO", salaryRange: "$30/hr", experienceLevel: "Junior", skillsRequired: "iOS/Android testing, TestFlight, ADB", description: "<p>Test daily beta builds of native apps on physical iOS and Android devices.</p>", qualifications: "Familiarity with mobile operating systems and mobile debugging tools." },

  // --- CYBERSECURITY / IT SUPPORT ---
  { title: "Cybersecurity Analyst", companyName: "DefendTech", category: "IT & Security", type: "Full-time", location: "Washington, D.C.", salaryRange: "$95,000 - $125,000", experienceLevel: "Mid-Level", skillsRequired: "SIEM, Network Security, Incident Response", description: "<p>Monitor network traffic for anomalies, investigate security breaches, and fortify defenses.</p>", qualifications: "Security+, CEH, or CISSP certification preferred." },
  { title: "Penetration Tester (Ethical Hacker)", companyName: "RedTeam Consulting", category: "IT & Security", type: "Contract", location: "Remote", salaryRange: "$120,000 - $160,000", experienceLevel: "Senior", skillsRequired: "Kali Linux, Metasploit, Burp Suite, WebSec", description: "<p>Conduct authorized simulated cyberattacks on client infrastructure to identify vulnerabilities.</p>", qualifications: "OSCP certification and 5+ years of proven pentesting experience." },
  { title: "IT Support Specialist", companyName: "Corporate Office Co.", category: "IT & Security", type: "Full-time", location: "Chicago, IL", salaryRange: "$55,000 - $75,000", experienceLevel: "Junior", skillsRequired: "Windows OS, Active Directory, Office 365, Troubleshooting", description: "<p>Provide tier 1 and 2 helpdesk support to internal employees for hardware and software issues.</p>", qualifications: "Excellent communication skills and A+ certification." },
  { title: "Network Engineer", companyName: "Telecom Next", category: "IT & Security", type: "Full-time", location: "Atlanta, GA", salaryRange: "$90,000 - $120,000", experienceLevel: "Mid-Level", skillsRequired: "Cisco, Routing, Switching, Firewalls", description: "<p>Design, implement, and maintain enterprise local and wide area networks.</p>", qualifications: "CCNA or CCNP certification required. Experience with enterprise routers/switches." },
  { title: "Identity & Access Management (IAM) Engineer", companyName: "Global FinServ", category: "IT & Security", type: "Full-time", location: "Remote", salaryRange: "$110,000 - $140,000", experienceLevel: "Senior", skillsRequired: "Okta, Active Directory, SAML, OAuth", description: "<p>Manage SSO and RBAC solutions to ensure secure access to enterprise applications.</p>", qualifications: "Experience deploying and managing enterprise IAM solutions like Okta or Ping." }
];

async function seedDatabase() {
  try {
    console.log('Starting Database Seed Process...');

    // 1. SEED USERS (Kept completely intact)
    let adminUser = await User.findOne({ email: 'admin@jobportal.com' });
    if (!adminUser) {
      adminUser = new User({ name: 'System Admin', email: 'admin@jobportal.com', password: 'admin123', role: 'admin', isSuspended: false });
      await adminUser.save();
    }
    let candidateUser = await User.findOne({ email: 'fasil@jobportal.com' });
    if (!candidateUser) {
      candidateUser = new User({ name: 'Fasil V (Candidate)', email: 'fasil@jobportal.com', password: 'fasil123', role: 'candidate', isSuspended: false, phone: '123-456-7890', location: 'New York', bio: 'Web developer.', skills: 'React, HTML, CSS', education: 'BS Computer Science', experience: '1 year React Dev', resumeName: 'fasil_resume.pdf' });
      await candidateUser.save();
    }
    let employerUser = await User.findOne({ email: 'employer@jobportal.com' });
    if (!employerUser) {
      employerUser = new User({ name: 'Ajay S (Employer)', email: 'employer@jobportal.com', password: 'employer123', role: 'employer', isSuspended: false, companyName: 'Aura Tech Inc', companyLocation: 'San Francisco', companyDesc: 'Creative software agency.' });
      await employerUser.save();
    }

    // 2. PRE-DOWNLOAD UNIQUE LOGOS TO MEMORY TO SPEED UP INSERTS
    console.log('Fetching and encoding company logos directly into server memory...');
    const logoCache = {};
    for (const company of companies) {
      const domain = companyDomains[company];
      logoCache[company] = await downloadLogoAsBase64(domain, company);
    }
    console.log('🎯 All logos converted to database-ready strings.');

    // 3. GENERATE 100 JOBS WITH EMBEDDED LOGOS
    await Job.deleteMany({});
    console.log('🧹 Cleared old job postings.');

    const jobsToInsert = [];
    for (let i = 0; i < 100; i++) {
      const level = getRandom(levels);
      const roleData = getRandom(jobTitles);
      const company = getRandom(companies);
      const type = getRandom(types);
      
      let finalTitle = type === 'Internship' ? `${roleData.title} Intern` : `${level} ${roleData.title}`;

      jobsToInsert.push({
        employerId: employerUser._id,
        companyName: company,
        companyLogo: logoCache[company], 
        title: finalTitle,
        category: roleData.category,
        description: `<strong>About the Role:</strong><br/>${company} is looking for a talented ${finalTitle}. You will design, develop, and maintain efficient code while collaborating with global product squads.`,
        qualifications: `Bachelor's degree in Engineering, Computer Science or equivalent technical field. Strong grasp of programming fundamentals.`,
        salaryRange: type === 'Internship' ? '₹20,000 - ₹35,000 / month' : generateSalary(level),
        location: getRandom(locations),
        type: type,
        experienceLevel: level,
        skillsRequired: roleData.skills,
        source: 'SkillFetch'
      });
    }

    // 4. APPEND THE 50 CUSTOM IT JOBS
    for (const customJob of additionalJobsToSeed) {
      jobsToInsert.push({
        ...customJob,
        employerId: employerUser._id,
        source: 'SkillFetch',
        // Fallback UI Avatar for custom companies
        companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(customJob.companyName)}&background=0056b3&color=fff&size=128`
      });
    }

    const insertedJobs = await Job.insertMany(jobsToInsert);
    console.log(`✅ Successfully stored ${insertedJobs.length} jobs with built-in images inside MongoDB!`);

    // 5. SEED APPLICATION
    const appCount = await Application.countDocuments();
    if (appCount === 0 && insertedJobs.length > 0 && candidateUser) {
      const application = new Application({ jobId: insertedJobs[0]._id, candidateId: candidateUser._id, status: 'Applied', coverLetter: 'Applying with database-backed profile data.' });
      await application.save();
    }

    console.log('🚀 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
}

module.exports = seedDatabase;