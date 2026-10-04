// Everything the page says lives here. Components only decide how it looks.
// Text wrapped in **double stars** is rendered bold.

export const PROFILE = {
  first: "Harshad",
  last: "Kalantri",
  name: "Harshad Kalantri",
  title: "Backend Engineer",
  email: "harshadkalantri@gmail.com",
  location: "Hyderabad, India",
  resume: import.meta.env.BASE_URL + "Harshad-Kalantri-Resume.pdf",
  resumeName: "Harshad-Kalantri-Resume.pdf",
  github: "https://github.com/harshadkalantri97",
  linkedin: "https://www.linkedin.com/in/harshad-kalantri",
  cert: "https://success.simplilearn.com/3f941561-8270-47a5-a1e8-e145dc6c98a4",
  web3formsKey: "6256b0bd-592e-4cd1-8945-eaba366a317b",
};

// cursor: the tech symbol the custom cursor shows while it is over that section
export const HERO_CURSOR = ">_";
export const SECTIONS = [
  { id: "experience", label: "Experience", cursor: "-o-" },
  { id: "skills", label: "Skills", cursor: "::" },
  { id: "achievements", label: "Impact", cursor: "++" },
  { id: "playground", label: "Playground", cursor: "{ }" },
  { id: "projects", label: "Projects", cursor: "</>" },
  { id: "education", label: "Education", cursor: "[x]" },
  { id: "contact", label: "Contact", cursor: "@" },
];

export const ROLES = [
  "Software Development Engineer",
  "Java / Spring backend specialist",
  "Parser & ETL builder",
  "Docker + CI/CD practitioner",
  "JVM performance tuner",
];

export const STATS = [
  { n: 5, suffix: "+ yrs", label: "Backend engineering" },
  { n: 65, suffix: "%", label: "Adapter quality lift" },
  { n: 80, suffix: "%", label: "Faster adapter analysis" },
  { n: 45, suffix: "%", label: "Parser speed-up" },
];

export const EXPERIENCE = [
  {
    logo: "MO",
    role: "Software Engineer",
    company: "MYCOM OSI",
    facts: ["Oct 2021 - Present", "Gurgaon, India", "Full-time"],
    blurb: "Software for network assurance, automation and analytics - lifting telecom performance and reliability.",
    points: [
      "Built high-performance **parsers and record processors** in core and advanced Java, raising adapter software quality performance by **65%**",
      "Designed **ETL workflows in SQL** - queries, stored procedures and performance tuning - to transform, validate and analyse data",
      "Shipped standalone internal tooling (CLI, desktop and web) that automated workflows and improved developer productivity, raising scalability by **35%**",
      "Containerised Java services with **Docker** for consistent, repeatable and secure deploys across environments",
      "Applied **multithreading, concurrency, JVM tuning and memory management** to cut latency and raise throughput",
      "Built and maintained **REST APIs and integration adapters**, backed by unit/integration tests and CI/CD pipelines",
      "Partnered cross-functionally with **Product, QA and Ops** to ship production-ready components with clean, testable code and full documentation",
    ],
    tags: ["Java", "Spring", "SQL", "Docker", "Concurrency", "JVM Tuning", "CI/CD", "ETL"],
  },
  {
    logo: "AC",
    role: "Technical Consultant",
    company: "Azri Consultancy",
    facts: ["Aug 2019 - Jul 2020", "Hyderabad, India", "Consulting"],
    blurb: "Technical consulting for enterprise applications and NGOs.",
    points: [
      "Produced **25+ articles** demystifying technology for social good, letting non-technical stakeholders adopt apps for community impact",
      "Wrote technical documentation for enterprise applications serving major organisations and NGOs",
      "Documented software features, **API integrations** and implementations alongside development teams",
      "Maintained technical content across multiple platforms, keeping it accurate and consistent for community-driven initiatives",
      "Created content bridging engineering teams and end users, improving adoption of emerging technology",
    ],
    tags: ["Technical Writing", "API Docs", "Enterprise Apps"],
  },
  {
    logo: "IN",
    role: "Technical Intern",
    company: "INSOFE",
    facts: ["Jan 2019 - Jun 2019", "Hyderabad, India", "Internship"],
    blurb: "Premier data science and big-data analytics institute - Carnegie Mellon University certified - focused on applied engineering education.",
    points: [
      "Grew the technical blog across data science, ML, AI, big data and visualisation for **3,000+ alumni** and corporate clients globally",
      "Authored articles on machine learning, statistical analysis and big data for students and professionals",
      "Researched and documented emerging trends in AI and analytics for thought-leadership content",
    ],
    tags: ["Data Science", "ML", "Content"],
  },
];

export const SKILL_CATS = ["All", "Languages", "Core Java", "Frameworks", "Backend", "Concurrency", "DevOps", "Tools", "Practice"];

export const SKILLS = [
  ["Java", "Languages"], ["SQL", "Languages"], ["JavaScript", "Languages"],
  ["Spring", "Frameworks"], ["Hibernate", "Frameworks"],
  ["REST APIs", "Backend"], ["Microservices", "Backend"], ["ETL", "Backend"],
  ["Data Parsing", "Backend"], ["JSON/XML Parsing", "Backend"], ["CSV Parsing", "Backend"],
  ["Internal Tools", "Backend"],
  ["Docker", "DevOps"], ["Jenkins", "DevOps"], ["CI/CD", "DevOps"], ["AWS", "DevOps"],
  ["Git", "Tools"], ["Maven", "Tools"], ["Gradle", "Tools"], ["Linux", "Tools"], ["JUnit", "Tools"],
  ["Multithreading", "Concurrency"], ["Thread Safety", "Concurrency"],
  ["JVM Tuning", "Concurrency"], ["Memory Management", "Concurrency"],
  ["OOP", "Core Java"], ["Collections", "Core Java"], ["Streams", "Core Java"],
  ["Generics", "Core Java"], ["Exception Handling", "Core Java"], ["DSA", "Core Java"],
  ["Agile/Scrum", "Practice"], ["SDLC", "Practice"], ["Troubleshooting", "Practice"],
].map(([name, cat]) => ({ name, cat }));

export const COMPETENCIES = [
  { icon: "code", title: "Backend Development", text: "Java/Spring services with REST APIs, integration adapters, microservices and SQL-driven ETL workflows." },
  { icon: "bolt", title: "Performance Optimisation", text: "Multithreading, concurrency control, JVM tuning and memory management to cut latency and raise throughput." },
  { icon: "monitor", title: "DevOps & Infrastructure", text: "Docker containerisation, Jenkins pipelines and CI/CD for repeatable deploys across environments." },
  { icon: "db", title: "Data Management", text: "SQL optimisation, complex data parsing and database performance tuning over high-volume network data." },
];

export const CASES = [
  {
    icon: "search",
    title: "IAR Scanner",
    role: "Led development",
    problem: "Identifying the properties and mechanisms inside adapter packages was a manual read-through - slow, and it did not scale across a large adapter estate.",
    approach: "Spearheaded an application that scans IAR adapter packages and surfaces their properties and mechanisms automatically, turning a manual inspection into a repeatable query.",
    result: "**80% improvement** in identifying adapter properties and mechanisms.",
    tags: ["Java", "Static Analysis", "Internal Tooling"],
  },
  {
    icon: "code",
    title: "Generic JSON Parser",
    role: "Designed & built",
    problem: "Multi-level JSON arriving from varied network sources did not map cleanly onto database-ready records, and per-source parsers multiplied maintenance.",
    approach: "Built one streaming parser that reads JSON token by token straight into a compact row buffer, with no intermediate object tree. Parent fields are reused across array rows instead of copied, a DBID level setting maps each branch of the hierarchy into its own data block, and JSON Lines input is detected automatically.",
    result: "**45% performance gain** over the existing JSON parsers it replaced.",
    tags: ["Java", "JSON", "Data Modelling", "Performance"],
  },
  {
    icon: "monitor",
    title: "Docker Migration",
    role: "Supervised rollout",
    problem: "Server-hosted workloads drifted between dev, test and prod, and environment setup was eating into feature delivery time.",
    approach: "Supervised moving data and services on servers into a Docker environment, containerising Java services so deploys became consistent, repeatable and secure across every environment.",
    result: "**30% shorter development cycle** for new software features.",
    tags: ["Docker", "CI/CD", "Linux"],
  },
  {
    icon: "db",
    title: "SNMP Counter Search",
    role: "Designed",
    problem: "Counter attributes and details lived scattered across individual SNMP-based adapters, with no single place to look them up.",
    approach: "Designed a centralised counters database and search tool that exposes attributes and counter detail from SNMP-based adapters through one interface.",
    result: "One canonical lookup for SNMP counters across the adapter estate.",
    tags: ["SNMP", "SQL", "Search"],
  },
];

export const PROJECTS = [
  {
    badge: "SS",
    title: "Sporty Shoes",
    text: "E-commerce store for an online sports retailer, built on a Java full-stack with complete front-end and back-end functionality over MySQL.",
    tags: ["Java", "Spring", "Hibernate", "MySQL", "HTML", "CSS", "JavaScript"],
    href: "https://github.com/harshadkalantri97/Sporty-Shoes-Phase3",
  },
  {
    badge: "IBA",
    title: "ICIN Banking Application",
    text: "Full-stack web application with a bank simulation supporting core banking features, running on AWS infrastructure.",
    tags: ["Java", "AWS", "HTML", "CSS", "JavaScript"],
    href: "https://github.com/harshadkalantri97/ICINBankingAppSimplilearn",
  },
];

export const CREDENTIALS = [
  {
    icon: "cap",
    kicker: "Education",
    title: "B.Tech, Computer Science",
    org: "BML Munjal University",
    facts: ["2015 - 2019", "Gurgaon, Haryana"],
    note: "Four-year engineering degree; class of 2019. Grounding in data structures, algorithms and object-oriented design that the backend work still runs on.",
  },
  {
    icon: "award",
    kicker: "Certification",
    title: "Full Stack Java Developer",
    org: "Simplilearn - Master's Program",
    facts: ["Graduated 11 Jun 2021", "ID 33577055"],
    note: "Completed all mandated coursework and industry projects **with distinction** - front-end and back-end development in Java, Spring Boot and modern web technologies.",
    link: { href: PROFILE.cert, label: "Verify credential" },
  },
  {
    icon: "doc",
    kicker: "Technical writing",
    title: "25+ published articles",
    org: "Azri Consultancy & INSOFE",
    facts: ["2019 - 2020", "Archives offline"],
    note: "Wrote and maintained technical content on **machine learning, statistical analysis, big data and AI** for INSOFE - a Carnegie Mellon certified institute serving 3,000+ alumni - and on **technology for social good** for Azri's enterprise and NGO clients. Both publications have since been taken down, so no live links remain.",
  },
  {
    icon: "lang",
    kicker: "Languages",
    title: "English & Hindi",
    org: "Native proficiency in both",
    facts: ["Full professional working"],
    note: "Comfortable writing specs, documentation and customer-facing material in English - four years of it in production, plus the technical-writing background above.",
  },
];
