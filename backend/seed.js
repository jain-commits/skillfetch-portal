const mongoose = require('mongoose');
const axios = require('axios'); 
const { User, Job, Application, Connection, Story } = require('./models');

const dummyPdfBuffer = Buffer.from(
  '%PDF-1.4\n' +
  '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
  '2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n' +
  '3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n' +
  '4 0 obj<</Length 50>>stream\n' +
  'BT /F1 12 Tf 72 712 Td (SkillFetch Resume - Sample PDF) Tj ET\n' +
  'endstream\n' +
  'endobj\n' +
  'xref\n' +
  '0 5\n' +
  '0000000000 65535 f\n' +
  '0000000009 00000 n\n' +
  '0000000052 00000 n\n' +
  '0000000096 00000 n\n' +
  '0000000192 00000 n\n' +
  'trailer\n' +
  '<</Size 5/Root 1 0 R>>\n' +
  'startxref\n' +
  '291\n' +
  '%%EOF'
);

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
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 3000 });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const contentType = response.headers['content-type'] || 'image/png';
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0056b3&color=fff&size=128`;
  }
}

// 50 India-focused career stories
const careerStories = [
  { title: "The Rise of GCCs in India: A Hub for High-Paying Tech Jobs", summary: "Global Capability Centers are expanding rapidly in Bangalore and Hyderabad, offering premium compensation packages.", content: "Global Capability Centers (GCCs) have transformed from cost centers to innovation cores for multinational corporations. India now hosts over 1,600 GCCs employing more than 1.6 million professionals. Cities like Bangalore, Hyderabad, Pune, and Chennai are seeing a surge in recruitment for advanced roles in AI, cloud architecture, and cybersecurity. GCCs offer competitive packages, often outperforming local service providers by 30-40%.", author: "Rohan Sen", readTime: "4 min read" },
  { title: "Why Bangalore Remains India's Premier Tech Launchpad", summary: "Despite infrastructure challenges, Bangalore's unparalleled talent density and startup ecosystem keep it at the top.", content: "Known as the Silicon Valley of India, Bangalore continues to attract the country's best engineers and venture capital. With thousands of startups, unicorns, and multinational research labs, the city remains the top hub for software engineers. While cities like Kochi, Trivandrum, and Pune are catching up, Bangalore's networking opportunities and tech events are unmatched.", author: "Ananya Iyer", readTime: "5 min read" },
  { title: "The Emergence of Pune and Hyderabad as Cyber Security Hubs", summary: "National security needs and enterprise cloud shifts have led to massive hiring in cybersecurity across these cities.", content: "Pune and Hyderabad are experiencing a massive hiring boom in cyber forensics, security operations centers (SOC), and cloud security. Many defense contractors and fintech firms have opened centers here, boosting the average starting salary for certified cybersecurity specialists to ₹8-12 LPA for fresh graduates.", author: "Amit Verma", readTime: "3 min read" },
  { title: "How to Negotiate Your CTC: A Guide for Indian IT Professionals", summary: "Understanding basic salary components like basic, HRA, special allowances, and variable pay can help you negotiate better.", content: "Negotiating your CTC (Cost to Company) requires a thorough understanding of the salary slip. Make sure to distinguish between fixed base pay, variables, performance bonuses, and long-term benefits like ESOPs and gratuity. Industry experts suggest highlighting your key skills, certs, and project results during HR rounds rather than just asking for a percentage raise.", author: "Priya Sharma", readTime: "5 min read" },
  { title: "Kochi and Trivandrum: Kerala's Tech Corridors See Double-Digit Growth", summary: "Lower cost of living and high quality of life are attracting remote workers and top tech firms to Kerala's IT parks.", content: "Infopark Kochi and Technopark Trivandrum are recording record growth rates. A shift toward hybrid work and government support has led to major tech brands establishing operations in Kerala. Professionals enjoy a balanced lifestyle, scenic settings, and lower rents compared to traditional tier-1 metros.", author: "Jithin Mathew", readTime: "4 min read" },
  { title: "The Growing Demand for AI and Prompt Engineers in Mumbai's Finance Sector", summary: "Investment banks and fintech institutions in India's financial capital are actively recruiting AI prompt engineers.", content: "Mumbai's financial services industry is integrating Generative AI into fraud detection, risk management, and customer advisory. There is an increasing demand for developers who can bridge the gap between financial models and Large Language Models, leading to a new breed of AI prompt engineers in the financial capital.", author: "Sneha Patil", readTime: "4 min read" },
  { title: "How the New Tax Regime Impacts Tech Salaries in India", summary: "A breakdown of tax slab updates and their direct impact on the take-home pay of tech professionals.", content: "The Indian Union Budget's modifications to the New Tax Regime aim to put more disposable income in the hands of taxpayers. For mid-level techies earning between ₹7 Lakh and ₹15 Lakh, the changes offer considerable savings, reducing tax burdens and increasing monthly take-home salary, which in turn boosts local tech sector spend.", author: "Vikram Mehta", readTime: "3 min read" },
  { title: "Top 10 Technical Skills Indian Startups are Looking for in 2026", summary: "From React and Next.js to Rust, Docker, and Kubernetes, these are the technologies driving startup job descriptions.", content: "The job market has matured, and startups are seeking highly modular skills. Key tech stacks include the MERN stack, Next.js, FastAPI, Rust for high-performance systems, Go for microservices, and DevOps skills like Docker, Terraform, and Kubernetes. Soft skills, especially remote coordination, are equally valued.", author: "Rishabh Das", readTime: "6 min read" },
  { title: "Work From Home vs. Hybrid: What Indian Tech Companies are Deciding", summary: "Major tech giants are calling employees back 3 days a week, but startups continue to offer flexible hybrid schedules.", content: "While IT service firms are mandating physical office presence to foster collaboration and IP security, product startups and GCCs are adopting structured hybrid schedules (2-3 days in office). Employee surveys indicate that flexibility remains a top priority when choosing a new employer.", author: "Kavita Rao", readTime: "4 min read" },
  { title: "Why Green Jobs are the Next Big Thing in India's Renewable Shift", summary: "Solar developers, EV grid engineers, and ESG auditors are seeing unprecedented demand for their expertise.", content: "India's target of reaching net-zero carbon emissions is accelerating the green economy. High-growth roles include Battery Management System (BMS) engineers, solar installation planners, and corporate ESG (Environmental, Social, and Governance) compliance auditors. Salaries in this sector have grown by 25% year-on-year.", author: "Rajesh Nair", readTime: "4 min read" },
  { title: "Transitioning from Service-Based to Product-Based Companies", summary: "A step-by-step roadmap to cross the bridge and land roles at product companies.", content: "Moving from a service-oriented company to a product-oriented one requires a shift in mindset. Product firms focus heavily on deep problem-solving, System Design, and Data Structures. Candidates should build strong portfolios, contribute to open-source, and focus on coding platforms like LeetCode and HackerRank.", author: "Fasil V", readTime: "5 min read" },
  { title: "Electric Vehicle Sector to Create Over 10 Lakh Jobs in India by 2030", summary: "The EV boom is creating jobs not just in manufacturing, but also in software, battery tech, and charging networks.", content: "The shift toward clean transport is driving hiring across the EV value chain. India's EV companies are hiring thermal engineers, embedded software developers, and charging network operations managers. Traditional auto hubs like Chennai and Pune are pivoting rapidly to support this growth.", author: "Ajay S", readTime: "4 min read" },
  { title: "The Gig Economy: Freelance Software Development Trends in India", summary: "Freelancing is no longer just a side hustle; many Indian developers are building successful full-time careers.", content: "With platforms like Upwork and Toptal, Indian developers are working for international clients. High demand exists for full-stack developers, mobile app experts, and cloud architects. Successful freelancers highlight the importance of communication, time management, and direct contract agreements.", author: "Jain Jose", readTime: "4 min read" },
  { title: "Why Python Remains the King of Data Science and Machine Learning", summary: "Python's rich library ecosystem keeps it at the core of all AI developments in Indian technology centers.", content: "From Pandas and NumPy to PyTorch and TensorFlow, Python is the foundation of data engineering and machine learning. Recruiters in Bangalore and Hyderabad suggest that while SQL is essential, a deep understanding of Python and mathematical statistics is what sets candidates apart.", author: "Karthi S", readTime: "3 min read" },
  { title: "How to Build a Portfolio that Grabs the Attention of Tech Recruiters", summary: "Create real-world, working applications instead of generic todo list apps to showcase your capabilities.", content: "A recruiter spends less than 30 seconds on a resume. To stand out, candidates must link to deployed, functional projects. Describe the problem solved, architectural decisions, and include clear documentation on GitHub. A portfolio with 2 unique projects is better than 10 generic ones.", author: "Dixon Anto", readTime: "4 min read" },
  { title: "The Role of System Design in Senior Tech Interviews", summary: "Why understanding load balancing, caching, and database sharding is critical for senior engineering roles.", content: "For developers with 5+ years of experience, interviews shift from coding syntax to system architecture. Candidates must explain how to build scalable, fault-tolerant systems. Focus on message queues like Kafka, memory caches like Redis, and SQL vs. NoSQL choices.", author: "Rohan Sen", readTime: "5 min read" },
  { title: "Understanding ESOPs: How Equity Compensation Works in Indian Startups", summary: "ESOPs can be highly lucrative, but you must understand vesting schedules, strike prices, and tax implications.", content: "Employee Stock Ownership Plans (ESOPs) are a key tool to attract top talent. However, many candidates don't read the fine print. Ensure you understand the vesting cliff, the exercise period, and how tax is calculated upon exercise to maximize your equity earnings.", author: "Neha Gupta", readTime: "5 min read" },
  { title: "Why Cloud Certifications (AWS, Azure, GCP) are Highly Valued", summary: "Get certified to validate your cloud computing skills and boost your job search prospects.", content: "Cloud migrations are at an all-time high. Having certifications like AWS Solutions Architect or Azure Administrator proves your knowledge. Recruiters use these certifications to filter candidates, particularly for DevOps, SRE, and cloud migration roles.", author: "Suresh Kumar", readTime: "4 min read" },
  { title: "How to Master Technical Communication for Remote Global Teams", summary: "Writing clear pull request descriptions, documentation, and asynchronous updates is vital in remote setups.", content: "As more Indian engineers work for global remote companies, written communication has become a core technical skill. Be concise, document assumptions, and use diagrams to explain complex ideas. Good communication reduces bugs and builds trust in remote environments.", author: "Deepa Nair", readTime: "4 min read" },
  { title: "Data Science vs. Data Engineering: Which Path is Right for You?", summary: "Data Science builds models, while Data Engineering builds the pipelines. Understand the key differences.", content: "Many fresh graduates confuse the two fields. Data Engineering is software engineering focused on data pipelines, ETL, and warehousing (Spark, Snowflake). Data Science focuses on modeling, statistics, and machine learning (Python, R). Choose based on your interest in software design vs. math.", author: "Arun Paul", readTime: "4 min read" },
  { title: "Why Rust is Gaining Traction in Indian FinTech Companies", summary: "Rust's memory safety and performance make it the preferred language for high-speed transaction engines.", content: "High-frequency trading firms and payment gateways are adopting Rust to replace legacy C++ systems. The language provides unmatched performance with zero memory leaks, reducing server infrastructure costs and latency for critical financial systems.", author: "Vijay K", readTime: "4 min read" },
  { title: "Gig Workers Rights and Policy Changes in India's Tech Space", summary: "An analysis of how upcoming regulations aim to protect and provide social security to gig workers.", content: "The Indian government is implementing new labor codes to provide social security, health benefits, and insurance to gig workers and freelancers. Tech companies are adjusting their contractor models to comply with these worker-centric regulations.", author: "Maya Devi", readTime: "5 min read" },
  { title: "Why Product Management has Become a Highly Coveted Job in India", summary: "Bridging business, technology, and user experience, PMs are the mini-CEOs of tech products.", content: "With the boom in consumer internet apps, PMs are critical to coordinate engineering and design. The role requires strong analytical skills, empathy, and strategic thinking. Transitioning from engineering to product management is a common and lucrative path.", author: "Siddharth Roy", readTime: "4 min read" },
  { title: "Women in Tech: Mentorship and Leadership Programs in Indian Metros", summary: "Highlighting initiatives and groups designed to support female tech professionals in their career growth.", content: "Organizations like Women Who Code and Lean In are active in major tech hubs, providing mentorship, coding bootcamps, and leadership training. Many corporations are setting diversity hiring targets, making it a great time for women to step into leadership roles.", author: "Rani Joseph", readTime: "4 min read" },
  { title: "How to Prepare for the Technical Screening Round at Top Startups", summary: "Expect live coding, debugging, and API integration tasks during startup technical filters.", content: "Startups move fast and need engineers who can write clean, production-ready code immediately. Technical screens often involve writing a small server, integrating third-party APIs, or live coding on platforms like Zoom. Practice time-boxed tasks to succeed.", author: "Alok Singh", readTime: "3 min read" },
  { title: "The Impact of 5G Rollout on IoT and Telecom Jobs in India", summary: "The deployment of 5G infrastructure is creating a massive demand for network planners and IoT architects.", content: "Telecom companies and industrial manufacturers are hiring for 5G network integration, radio frequency planning, and IoT application development. Cities with early 5G rollouts are seeing localized hiring booms in advanced communications.", author: "George Kutty", readTime: "4 min read" },
  { title: "Mental Health Initiatives: How Tech Companies are Combating Burnout", summary: "Wellness allowances, mandatory leaves, and therapy sessions are becoming standard benefits.", content: "Long hours and tight deadlines often lead to burnout. In response, progressive Indian IT firms are introducing mental health days, counseling services, and strict policies against after-hours communications to ensure work-life balance.", author: "Tara Menon", readTime: "4 min read" },
  { title: "The Rise of Low-Code and No-Code Platforms in Corporate India", summary: "Will low-code tools replace developers, or will they enable them to focus on complex engineering?", content: "Platforms like OutSystems, Webflow, and PowerApps are widely adopted by enterprises to build internal tools quickly. Experts suggest this shifts developer tasks from basic UI creation to complex API integrations, database design, and cloud scalability.", author: "Kiran Jacob", readTime: "4 min read" },
  { title: "How Universities in Kerala are Partnering with IT Parks for Placements", summary: "Structured internship programs are bridging the industry-academia gap in Cochin and Trivandrum.", content: "Universities are aligning their computer science curriculums with the needs of IT companies in Infopark and Technopark. This partnership ensures students work on real-world projects during their studies, boosting immediate employment post-graduation.", author: "Sonia Varghese", readTime: "4 min read" },
  { title: "Why Cyber Security Professionals command the Highest Salary Premium", summary: "A lack of qualified specialists has led to a bidding war for top-tier security talent in India.", content: "With data breaches on the rise, organizations are investing heavily in security. The demand for security architects, ethical hackers, and compliance managers far exceeds supply. Professionals with certifications like CISSP or CEH command high salary premiums.", author: "Joseph Sunny", readTime: "4 min read" },
  { title: "Transitioning from QA/Testing to Software Development", summary: "Tips and strategies for manual and automation testers looking to move to full-stack roles.", content: "Many testers want to build features rather than test them. Start by learning programming languages deeply, contribute to developer tasks, and build automation frameworks from scratch. Show developers you understand system architecture, not just test cases.", author: "Anjali Das", readTime: "4 min read" },
  { title: "The Future of Devops: Platform Engineering as the Next Evolution", summary: "Platform engineering aims to improve developer experience by providing self-service portals.", content: "As cloud systems become complex, companies are building Internal Developer Platforms (IDPs). This allows developers to spin up environments and deploy code without waiting for operations teams, making Platform Engineering a highly sought-after specialization.", author: "Binu Mathew", readTime: "4 min read" },
  { title: "Why FinTech Startups are actively hiring iOS and Android Native Developers", summary: "Providing high-security, fast mobile applications is critical for consumer trust in finance.", content: "Web-wrapper apps are no longer sufficient for fintech. Companies are rebuilding their apps natively using Swift and Kotlin to ensure cryptographic security, smooth animations, and biometrics integration, leading to high demand for native mobile devs.", author: "Shaji P", readTime: "3 min read" },
  { title: "How to Build an ATS-Friendly Resume for Indian Corporate Openings", summary: "Use simple layouts, standard headers, and target keywords to ensure your resume reaches a human.", content: "Applicant Tracking Systems (ATS) screen resumes before recruiters see them. Avoid complex tables, graphics, and custom fonts. Use bullet points and match keywords from the job description directly in your skills and experience sections.", author: "Sandhya Nair", readTime: "4 min read" },
  { title: "Why Database Optimization (SQL Tuning) is a Core Skill for Backend Devs", summary: "Slow queries cause server crashes. Master indexes, execution plans, and queries to write scalable code.", content: "Most application bottlenecks are in the database. Product companies look for backend engineers who can optimize complex SQL queries, design proper indexes, and understand database clustering. Tuning queries can reduce server costs by 50%.", author: "Pradeep G", readTime: "4 min read" },
  { title: "Understanding Docker and Containers: A Beginner's Guide for Freshers", summary: "Docker ensures your application runs the same way on your laptop as it does in production.", content: "Containers package code with all dependencies. Learning how to write a Dockerfile and manage basic container tasks is now an essential skill for entry-level developers. It solves the 'it works on my machine' problem permanently.", author: "Vivek R", readTime: "4 min read" },
  { title: "The Growth of AgriTech Startups and New Tech Roles in Rural India", summary: "Leveraging IoT, drone imagery, and predictive analytics to revolutionize farming is creating jobs.", content: "AgriTech startups are deploying technology in rural areas. Developers, data analysts, and IoT hardware engineers are working on crop monitoring, supply chain optimization, and market forecasting tools, creating impactful career opportunities.", author: "Devan Nair", readTime: "4 min read" },
  { title: "Why Microservices Architecture has Become the Standard for Enterprise Apps", summary: "Breaking monoliths into independent services improves deployment speeds and system reliability.", content: "Microservices allow teams to deploy features independently. However, they introduce networking and data consistency challenges. Engineers must learn gRPC, REST, and event-driven concepts (Kafka, RabbitMQ) to build modern microservice backends.", author: "Gireesh K", readTime: "5 min read" },
  { title: "How to Prepare for a System Design Interview in 4 Weeks", summary: "A structured study guide covering system design basics, caching, load balancing, and storage.", content: "System design interviews evaluate your architecture skills. Week 1: learn basic components (web servers, databases). Week 2: scale database (sharding, replication). Week 3: implement caching and load balancing. Week 4: mock interviews and system case studies.", author: "Hari Prasadh", readTime: "5 min read" },
  { title: "The Rise of HealthTech Startups and Careers in Digital Healthcare", summary: "Telemedicine, AI diagnosis, and electronic health records are driving hiring in healthcare IT.", content: "Startups are digitizing healthcare in India. There is an increasing demand for security-conscious developers, machine learning experts for diagnostic scans, and product designers who understand doctor-patient interaction workflows.", author: "Dr. Elizabeth Thomas", readTime: "4 min read" },
  { title: "Why Web Accessibility (WCAG) is Crucial for Modern Frontend Developers", summary: "Learn to build inclusive websites that are usable by everyone, including people with disabilities.", content: "Web accessibility ensures that websites work with screen readers and keyboard navigation. Standard practices like proper semantic HTML, ARIA labels, and color contrast ratios are now required in global product development teams.", author: "Reshma R", readTime: "4 min read" },
  { title: "Understanding API Gateways and Rate Limiting in Microservices", summary: "API gateways manage traffic, authenticate requests, and protect services from DDoS attacks.", content: "In a microservices setup, the API gateway is the single entry point. Implementing rate limiting (using Redis or Kong) ensures that no single user can overwhelm your backend services, maintaining high availability for all users.", author: "Manu Gopal", readTime: "4 min read" },
  { title: "The Career Path of a Developer: Junior to Tech Lead and Architect", summary: "Understand the expectations and skills required at each level of the software engineering career.", content: "Engineering career paths split into individual contributor (Architect) and management (Tech Lead/EM) tracks. Junior developers focus on coding tasks. Mid-level devs own features. Senior devs design systems and mentor others. Choose your path early.", author: "Santhosh M", readTime: "5 min read" },
  { title: "How to Build a Successful Career in Technical Writing", summary: "Documentation is code. Good technical writers are critical to developer tools and open-source projects.", content: "Technical writing involves documenting APIs, writing tutorials, and managing developer documentation. The role requires a strong understanding of coding concepts and exceptional writing skills, and offers great pay at product-first firms.", author: "Mary Philip", readTime: "4 min read" },
  { title: "Why Continuous Integration and Continuous Deployment (CI/CD) is Vital", summary: "Automating testing and deployment pipelines helps companies release features daily with minimal bugs.", content: "CI/CD tools like GitHub Actions, GitLab CI, and Jenkins are the backbone of modern operations. Automating test runs and container deployment ensures code changes are verified and shipped safely, reducing manual release errors.", author: "Subin Sunny", readTime: "4 min read" },
  { title: "The Impact of Artificial Intelligence on the Future of Coding Jobs", summary: "AI tools like GitHub Copilot are assistants, not replacements. Developers must learn to pair program with AI.", content: "Generative AI can draft boilerplate code, write test scripts, and debug syntax. However, human engineers are still needed to design architectures, solve complex business logic, and verify security, shifting developer roles to higher-level design.", author: "Prof. Krishnan Nair", readTime: "5 min read" },
  { title: "Why Indian Developers are Contributing to International Open Source Projects", summary: "Open-source contributions build global credibility, improve coding skills, and attract remote employers.", content: "Contributing to repositories like Linux, React, or Kubernetes showcases your code to a global audience. It serves as an active, verified resume that can lead to direct sponsorship or job offers from foreign startups looking for top talent.", author: "Jeevan K", readTime: "4 min read" },
  { title: "How to Choose Between a Boot Camp, a Degree, or Self-Teaching in Tech", summary: "Evaluate costs, timeline, and learning style to find your optimal path into software development.", content: "A computer science degree teaches theory, bootcamps focus on immediate job skills, and self-teaching offers flexibility. Indian recruiters are shifting toward skill-based hiring, meaning your projects and coding test results matter more than your degree.", author: "Sumi Alex", readTime: "4 min read" },
  { title: "The Rise of EdTech for Professionals: Upskilling Platforms in India", summary: "Indian professionals are spending heavily on executive MBA and advanced engineering courses online.", content: "Continuous learning is essential as technologies change. Platforms like upGrad, Great Learning, and Scaler Academy offer cohort-based learning for working professionals. Focus on programs that offer mentor sessions and capstone projects.", author: "Rahul Dev", readTime: "4 min read" },
  { title: "Why System Reliability (SRE) is the Backbone of High-Traffic Websites", summary: "SREs combine operations and software engineering to maintain server health and query performance.", content: "Site Reliability Engineers write code to automate operations, manage infrastructure scaling, and configure logging and alerts (Grafana, Datadog). SREs are critical during high-traffic events, ensuring services scale automatically under load.", author: "Vinod Kumar", readTime: "4 min read" }
];

// Seed process
async function seedDatabase() {
  try {
    console.log('Checking database state...');
    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();
    const storyCount = await Story.countDocuments();

    if (userCount > 0 || jobCount > 0 || storyCount > 0) {
      console.log(`📊 DB already contains data (${userCount} users, ${jobCount} jobs, ${storyCount} stories). Skipping seeding to preserve all data.`);
      return;
    }

    console.log('Database is empty. Starting Database Seed Process...');

    // 1. SEED USERS (with default avatars & headlines)
    console.log('🧹 Clearing old users...');
    await User.deleteMany({});
    
    const adminUser = new User({ 
      name: 'System Admin', 
      email: 'admin@jobportal.com', 
      password: 'admin123', 
      role: 'admin', 
      isSuspended: false,
      avatar: 'avatar1',
      headline: 'Platform Administrator | SkillFetch Security'
    });
    await adminUser.save();

    const employerUser = new User({ 
      name: 'Ajay S (Employer)', 
      email: 'employer@jobportal.com', 
      password: 'employer123', 
      role: 'employer', 
      isSuspended: false, 
      companyName: 'Aura Tech Inc', 
      companyLocation: 'San Francisco', 
      companyDesc: 'Creative software agency.',
      avatar: 'avatar2',
      companyLogo: 'https://ui-avatars.com/api/?name=Aura+Tech&background=0056b3&color=fff&size=128',
      headline: 'Talent Acquisition Director at Aura Tech Inc'
    });
    await employerUser.save();

    const candidates = [
      {
        name: 'Fasil V',
        email: 'fasil@jobportal.com',
        password: 'fasil123',
        role: 'candidate',
        phone: '987-654-3210',
        location: 'Old Lakkidi, Ottappalam, Kerala',
        bio: 'Passionate Frontend Developer focused on React, UI/UX, and animations. Open to full-stack roles.',
        skills: 'React, Angular, HTML, CSS, JavaScript, TailwindCSS',
        education: 'B.Tech in Computer Science',
        experience: '2 years as React developer',
        avatar: 'avatar3',
        headline: 'Frontend Engineer | React & UX Specialist | Open to Work',
        resumeName: 'fasil_resume.pdf',
        resume: {
          data: dummyPdfBuffer,
          contentType: 'application/pdf',
          name: 'fasil_resume.pdf'
        }
      },
      {
        name: 'Dixon Anto',
        email: 'dixon@jobportal.com',
        password: 'dixon123',
        role: 'candidate',
        phone: '994-654-3211',
        location: 'Palakkad, Kerala',
        bio: 'Backend enthusiast specializing in scalable Node.js microservices and database clustering.',
        skills: 'Node.js, Express, MongoDB, Redis, Docker, Go',
        education: 'MCA, Kerala University',
        experience: '3 years in backend microservices',
        avatar: 'avatar4',
        headline: 'Backend Engineer | Node.js & Redis Expert | Systems Architect',
        resumeName: 'dixon_resume.pdf',
        resume: {
          data: dummyPdfBuffer,
          contentType: 'application/pdf',
          name: 'dixon_resume.pdf'
        }
      },
      {
        name: 'Karthi S',
        email: 'karthi@jobportal.com',
        password: 'karthi123',
        role: 'candidate',
        phone: '988-654-3212',
        location: 'Ottapalam, Kerala',
        bio: 'Data Engineer focused on big data ETL pipelines and Snowflake warehousing. Passionate about machine learning.',
        skills: 'Python, Spark, Airflow, Snowflake, SQL, Pandas',
        education: 'MS in Data Science',
        experience: '1 year Data Engineer at TCS',
        avatar: 'avatar5',
        headline: 'Data Engineer | Apache Spark & Python Developer',
        resumeName: 'karthi_resume.pdf',
        resume: {
          data: dummyPdfBuffer,
          contentType: 'application/pdf',
          name: 'karthi_resume.pdf'
        }
      },
      {
        name: 'Jain ',
        email: 'jain@jobportal.com',
        password: 'jain123',
        role: 'candidate',
        phone: '989-654-3213',
        location: 'Pattambi, Kerala',
        bio: 'Full Stack Developer with a knack for systems design and fast prototype releases.',
        skills: 'MongoDB, Express, React, Node.js, Next.js, AWS',
        education: 'B.Sc. in Computer Science',
        experience: '2.5 years MERN stack developer',
        avatar: 'avatar6',
        headline: 'Full Stack MERN Developer | Cloud Architect',
        resumeName: 'jain_resume.pdf',
        resume: {
          data: dummyPdfBuffer,
          contentType: 'application/pdf',
          name: 'jain_resume.pdf'
        }
      },
      {
        name: 'Deepa Nair',
        email: 'deepa@jobportal.com',
        password: 'deepa123',
        role: 'candidate',
        phone: '977-654-3214',
        location: 'Mumbai, Maharashtra',
        bio: 'UI/UX Designer who bridges user research and front-end interface development.',
        skills: 'Figma, Adobe Creative Suite, CSS, HTML, Wireframing',
        education: 'BFA in Visual Design',
        experience: '3 years UI/UX Product Designer',
        avatar: 'avatar7',
        headline: 'Product UI/UX Designer | Figma Specialist',
        resumeName: 'deepa_resume.pdf',
        resume: {
          data: dummyPdfBuffer,
          contentType: 'application/pdf',
          name: 'deepa_resume.pdf'
        }
      }
    ];

    const seededCandidates = [];
    for (const cand of candidates) {
      const userObj = new User(cand);
      await userObj.save();
      seededCandidates.push(userObj);
      console.log(`👤 Seeded Candidate: ${cand.name}`);
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

    // Custom hand-crafted jobs can also be appended
    const additionalJobsToSeed = [
      { title: "Senior Web Designer", companyName: "CreativePulse Agency", category: "Design & Creative", type: "Full-time", location: "New York, NY", salaryRange: "$80,000 - $110,000", experienceLevel: "Senior", skillsRequired: "Figma, Adobe XD, HTML, CSS", description: "<p>We are seeking a visionary Web Designer to craft stunning, user-centric interfaces for our global clients.</p>", qualifications: "BFA in Design or equivalent, 5+ years of agency experience." },
      { title: "UI/UX Product Designer", companyName: "FinTech Innovators", category: "Design & Creative", type: "Remote", location: "Remote", salaryRange: "$90,000 - $125,000", experienceLevel: "Mid-Level", skillsRequired: "Sketch, InVision, Wireframing, Prototyping", description: "<p>Join our core product team to improve the usability and aesthetic of our financial dashboard.</p>", qualifications: "3+ years designing complex SaaS products. Strong portfolio required." },
      { title: "Android Mobile Engineer", companyName: "HealthTrack", category: "Mobile Development", type: "Full-time", location: "Remote", salaryRange: "$110,000 - $140,000", experienceLevel: "Mid-Level", skillsRequired: "Kotlin, Android SDK, MVVM, Coroutines", description: "<p>Build life-saving features for our health tracking Android application used by millions.</p>", qualifications: "3+ years in native Android development. Published apps in the Play Store." },
      { title: "Frontend React Developer", companyName: "CloudCRM", category: "Frontend Development", type: "Full-time", location: "Remote", salaryRange: "$100,000 - $130,000", experienceLevel: "Mid-Level", skillsRequired: "React, Redux Toolkit, Tailwind CSS, TypeScript", description: "<p>Develop complex single-page applications for our flagship CRM software.</p>", qualifications: "3+ years working with React and modern frontend build tools." },
      { title: "Node.js Backend Engineer", companyName: "API Forge", category: "Backend Development", type: "Full-time", location: "Remote", salaryRange: "$110,000 - $145,000", experienceLevel: "Mid-Level", skillsRequired: "Node.js, Express, MongoDB, Redis", description: "<p>Design and build scalable RESTful APIs handling millions of requests per day.</p>", qualifications: "3+ years of backend Node.js experience." }
    ];

    for (const customJob of additionalJobsToSeed) {
      jobsToInsert.push({
        ...customJob,
        employerId: employerUser._id,
        source: 'SkillFetch',
        companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(customJob.companyName)}&background=0056b3&color=fff&size=128`
      });
    }

    const insertedJobs = await Job.insertMany(jobsToInsert);
    console.log(`✅ Successfully stored ${insertedJobs.length} jobs inside MongoDB!`);

    // 4. SEED APPLICATION
    await Application.deleteMany({});
    console.log('🧹 Cleared old applications.');
    if (insertedJobs.length > 0 && seededCandidates.length > 0) {
      const application = new Application({ 
        jobId: insertedJobs[0]._id, 
        candidateId: seededCandidates[0]._id, 
        status: 'Applied', 
        coverLetter: 'Applying with database-backed profile data.' 
      });
      await application.save();
      console.log('📝 Seeded sample application.');
    }

    // 5. SEED CONNECTIONS
    await Connection.deleteMany({});
    console.log('🧹 Cleared old connections.');
    // Dixon requests connection to Fasil
    if (seededCandidates.length > 1) {
      const conn1 = new Connection({
        senderId: seededCandidates[1]._id,
        receiverId: seededCandidates[0]._id,
        status: 'pending'
      });
      await conn1.save();

      // Karthi and Fasil are already connected
      const conn2 = new Connection({
        senderId: seededCandidates[2]._id,
        receiverId: seededCandidates[0]._id,
        status: 'accepted'
      });
      await conn2.save();
      console.log('🔗 Seeded sample connections.');
    }

    // 6. SEED INDIA-FOCUSED STORIES
    await Story.deleteMany({});
    console.log('🧹 Cleared old stories.');
    await Story.insertMany(careerStories);
    console.log(`📰 Successfully seeded ${careerStories.length} India-focused stories!`);

    console.log('🚀 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
}

module.exports = seedDatabase;