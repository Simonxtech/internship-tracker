/**
 * =============================================================
 *  public/js/quiz.js — Frontend-Logik für das Career Assessment
 * =============================================================
 *
 *  Diese Datei enthält:
 *    - Alle Fragen mit Scoring für 50 Karriere-Kategorien
 *    - Die Quiz-Logik (Fragen anzeigen, Antworten verarbeiten)
 *    - Ergebnis-Anzeige mit Charts
 *    - Speichern/Laden per /api/quiz/results
 * =============================================================
 */

// =============================================================
//  STATISCHE DATEN: Beschreibungen der 50 Karriere-Kategorien
// =============================================================

var careerDesc = {
    "Strategy Consulting": "Advises executives on corporate strategy, growth, and high-level decisions.",
    "IT Consulting": "Aligns technology strategy with business processes and implements tech solutions.",
    "Digital Transformation Consulting": "Guides companies through digitalization and modernizing business models.",
    "Inhouse Consulting": "Internal strategy teams solving critical problems exclusively for their corporation.",
    "M&A Consulting": "Advises on mergers, acquisitions, and post-merger integrations.",
    "Risk Consulting": "Helps organizations identify, manage, and mitigate operational and strategic risks.",
    "Sustainability Consulting": "Advises businesses on ESG principles, green initiatives, and sustainability.",
    "Public Sector Consulting": "Advises governments, NGOs, and public institutions on policy, digitalization, and efficiency.",
    "Investment Banking": "Raises capital and provides strategic M&A advisory services.",
    "Private Equity": "Invests in private companies or buyouts to restructure and sell for profit.",
    "Venture Capital": "Provides funding and strategic support to high-growth startups.",
    "Asset Management": "Manages investments and portfolios on behalf of clients or institutions.",
    "Hedge Fund": "Uses complex investment strategies and risk management to generate high returns.",
    "Corporate Finance": "Manages a company's financial activities, funding, and capital structuring.",
    "FP&A": "Financial Planning & Analysis — budgeting, forecasting, and driving financial decisions.",
    "Controlling": "Focuses on financial reporting, cost management, and internal controls.",
    "Risk Management (Finance)": "Identifies and mitigates financial risks (credit, market, liquidity).",
    "Quant Finance": "Applies advanced mathematical models and algorithms to price securities and trade.",
    "Real Estate Finance": "Finances, values, and manages commercial and residential real estate investments.",
    "Impact Investing": "Invests in companies and funds that generate measurable social or environmental impact alongside financial returns.",
    "Brand Management": "Develops and maintains the perception and strategy of a brand.",
    "Performance Marketing": "Drives measurable campaigns and advertising based on ROI/CPA.",
    "Growth Hacking": "Uses creative, low-cost strategies to rapidly acquire and retain customers.",
    "CRM / Lifecycle Marketing": "Manages customer retention, loyalty programs, and lifetime value.",
    "Product Marketing": "Positions and launches products, bridging the gap between product and sales.",
    "Content Marketing": "Creates valuable media and content to attract and engage target audiences.",
    "SEO / SEM": "Optimizes online presence to increase organic and paid search visibility.",
    "Marketing Analytics": "Analyzes campaign data and user behavior to optimize marketing ROI.",
    "Revenue Operations": "Aligns sales, marketing, and customer success through data, processes, and technology to drive predictable revenue growth.",
    "Customer Success Management": "Ensures clients achieve their desired outcomes, driving retention, upselling, and long-term relationships.",
    "Product Management": "Guides the lifecycle of a product from conception through launch and iteration.",
    "Product Strategy": "Defines the long-term vision, market positioning, and roadmap for products.",
    "UX / UI Strategy": "Focuses on user experience research, design systems, and interface functionality.",
    "Data Product Management": "Builds products heavily reliant on data pipelines, analytics, and algorithms.",
    "AI Product Management": "Specializes in developing artificial intelligence and machine learning products.",
    "Tech Business Analyst": "Bridges the gap between IT and business using data analytics to assess processes.",
    "Innovation Management": "Scouts emerging technologies, runs corporate accelerators, and drives internal innovation programs.",
    "Talent Acquisition": "Strategically identifies, attracts, and hires top talent for the organization.",
    "HR Business Partner": "Aligns HR strategy with business goals and supports leadership teams.",
    "Learning & Development": "Focuses on employee growth, training programs, and upskilling.",
    "Organizational Development": "Improves organizational structure, culture, and change management processes.",
    "Employer Branding": "Builds and promotes a company's reputation as an attractive employer.",
    "Compensation & Benefits": "Designs salary structures, bonus systems, and benefit packages.",
    "Founder": "Creates and builds new businesses from the ground up.",
    "Early-stage Startup Generalist": "Wears multiple hats in a young startup, driving initial traction and ops.",
    "Business Development (Startup)": "Builds partnerships, tests market channels, and drives initial revenue.",
    "Venture Builder": "Systematically builds, launches, and scales multiple startups inside a studio.",
    "Corporate Development": "Drives inorganic growth via acquisitions, partnerships, and strategic investments from within a corporation.",
    "Supply Chain Management": "Plans, optimizes, and manages the end-to-end flow of goods, information, and finances across global supply networks."
};


// =============================================================
//  DETAIL-DATEN FÜR DAS MODAL (Gehalt, Positionen, Skills)
// =============================================================

var careerDetails = {
    "Strategy Consulting": { pos: "Junior Consultant, Business Analyst, Associate", skills: "Structured problem-solving, PowerPoint, Excel, Client communication", salary: "€55k–€75k" },
    "Investment Banking": { pos: "Analyst, Associate", skills: "Financial modeling, DCF/LBO valuation, Excel, Pitch decks", salary: "€65k–€90k + bonus" },
    "Private Equity": { pos: "Analyst, Associate (usually post-IB)", skills: "LBO modeling, Due diligence, Industry analysis", salary: "€70k–€100k + carry" },
    "Product Management": { pos: "Associate PM, Junior PM, Product Analyst", skills: "User research, Roadmapping, Stakeholder management, SQL", salary: "€48k–€65k" },
    "Brand Management": { pos: "Junior Brand Manager, Brand Analyst", skills: "Consumer insights, Campaign planning, P&L basics", salary: "€42k–€55k" },
    "Founder": { pos: "CEO, Co-Founder", skills: "Vision, Resilience, Fundraising, Sales, Product sense", salary: "€0–unlimited" },
    "Venture Capital": { pos: "Analyst, Associate, Scout", skills: "Deal sourcing, Due diligence, Networking, Market analysis", salary: "€55k–€80k" },
    "HR Business Partner": { pos: "Junior HRBP, HR Generalist, People Partner", skills: "Employee relations, Org design, Coaching", salary: "€45k–€60k" },
    "Growth Hacking": { pos: "Growth Manager, Growth Analyst", skills: "A/B testing, Analytics, Funnel optimization, Creativity", salary: "€45k–€65k" },
    "M&A Consulting": { pos: "M&A Analyst, Transaction Advisory Associate", skills: "Valuation, Due diligence, Financial modeling", salary: "€55k–€75k" },
    "Corporate Finance": { pos: "Financial Analyst, Treasury Analyst", skills: "Cash flow analysis, Capital markets, Risk assessment", salary: "€48k–€62k" },
    "Corporate Development": { pos: "Corp Dev Analyst, Strategic Partnerships Associate", skills: "M&A process, Valuation, Strategic thinking, Negotiation", salary: "€55k–€75k" },
    "Public Sector Consulting": { pos: "Consultant, Policy Analyst, Project Manager", skills: "Stakeholder management, Policy analysis, Public procurement", salary: "€45k–€60k" },
    "Supply Chain Management": { pos: "Supply Chain Analyst, Logistics Coordinator, Procurement Specialist", skills: "ERP systems, Forecasting, Supplier management, Process optimization", salary: "€42k–€58k" },
    "Real Estate Finance": { pos: "RE Analyst, Investment Associate, Asset Manager", skills: "Property valuation, DCF, Market analysis, Lease modeling", salary: "€50k–€70k" },
    "Impact Investing": { pos: "Impact Analyst, ESG Associate, Fund Associate", skills: "Impact measurement, ESG frameworks, Financial analysis, Due diligence", salary: "€48k–€65k" },
    "Employer Branding": { pos: "Employer Branding Manager, Talent Marketing Specialist", skills: "Content creation, Social media, EVP development, Analytics", salary: "€40k–€55k" },
    "Compensation & Benefits": { pos: "C&B Analyst, Total Rewards Specialist", skills: "Benchmarking, Excel, Labor law basics, Salary band design", salary: "€45k–€60k" },
    "Revenue Operations": { pos: "RevOps Analyst, Sales Operations Associate", skills: "CRM (Salesforce/HubSpot), Data analysis, Process design", salary: "€45k–€60k" },
    "Customer Success Management": { pos: "CSM, Onboarding Specialist, Account Manager", skills: "Relationship building, Product knowledge, Upselling, Churn analysis", salary: "€42k–€55k" },
    "Innovation Management": { pos: "Innovation Manager, Corporate Venture Associate, Trend Scout", skills: "Design Thinking, Startup ecosystem knowledge, Prototyping", salary: "€48k–€65k" },
    "Quant Finance": { pos: "Quant Analyst, Quant Developer", skills: "Python/R, Stochastic calculus, Statistics, ML", salary: "€60k–€90k" },
    "Marketing Analytics": { pos: "Marketing Analyst, Data Analyst (Marketing)", skills: "SQL, Google Analytics, A/B testing, Data visualization", salary: "€42k–€58k" },
    "Learning & Development": { pos: "L&D Coordinator, Training Specialist", skills: "Instructional design, Facilitation, Needs analysis", salary: "€40k–€55k" }
};


// =============================================================
//  PROFILE: Dominanter Antwort-Typ → Persönlichkeitsprofil
// =============================================================

var quizProfiles = {
    A: { emoji: "🧠", type: "The Strategist", desc: "You are a strategic thinker who thrives on solving complex, high-level problems. You see the big picture, connect the dots, and love advising on critical decisions. Frameworks and structured analysis are your natural tools." },
    B: { emoji: "📈", type: "The Analyst", desc: "You are a numbers person at heart. Financial models, data analysis, and quantitative reasoning give you clarity. You thrive where precision matters and decisions are backed by hard evidence." },
    C: { emoji: "🎨", type: "The Creative", desc: "You are a creative strategist who turns ideas into impactful campaigns and experiences. You thrive where experimentation is valued, conventional thinking is challenged, and originality wins." },
    D: { emoji: "🤝", type: "The People Person", desc: "You are a natural connector and leader. You understand what motivates people and build your career around developing others, shaping culture, and creating environments where everyone can flourish." },
    E: { emoji: "🔨", type: "The Builder", desc: "You are a maker at heart. Whether it's a product, a startup, or a new feature — you want to create something tangible. Iteration, ownership, and seeing your ideas come to life is what drives you." }
};


// =============================================================
//  20 FRAGEN MIT SCORING
// =============================================================

var quizQuestions = [
    {
        text: "1. You have a free Saturday. What sounds most appealing?",
        options: { A: "Reading a business case study or strategy book", B: "Tracking stock prices or analyzing a company's financials", C: "Brainstorming a marketing campaign for a product you love", D: "Organizing a group activity or helping a friend with a career problem", E: "Working on a side project or building a prototype" },
        scoring: { A: {"Strategy Consulting": 2, "Inhouse Consulting": 1, "Public Sector Consulting": 1}, B: {"Investment Banking": 2, "Quant Finance": 1, "Real Estate Finance": 1, "FP&A": 1}, C: {"Brand Management": 2, "Content Marketing": 1, "Growth Hacking": 1, "Employer Branding": 1}, D: {"HR Business Partner": 2, "Talent Acquisition": 1, "Learning & Development": 1, "Customer Success Management": 1}, E: {"Product Management": 2, "Founder": 2, "Venture Builder": 1, "Innovation Management": 1} }
    },
    {
        text: "2. In a group project, what role do you naturally take?",
        options: { A: "The one who creates the structure and divides tasks", B: "The one who digs into the data and builds the spreadsheet", C: "The one who designs the presentation and makes it look great", D: "The one who keeps the team motivated and resolves conflicts", E: "The one who builds the actual deliverable or demo" },
        scoring: { A: {"Strategy Consulting": 2, "IT Consulting": 1, "Supply Chain Management": 1, "Revenue Operations": 1}, B: {"Quant Finance": 2, "Controlling": 1, "Marketing Analytics": 1, "Compensation & Benefits": 1}, C: {"UX / UI Strategy": 2, "Brand Management": 1, "Employer Branding": 1}, D: {"Organizational Development": 2, "HR Business Partner": 1, "Customer Success Management": 1}, E: {"Product Strategy": 2, "Data Product Management": 1, "AI Product Management": 1, "Innovation Management": 1} }
    },
    {
        text: "3. Which type of challenge gets you most excited?",
        options: { A: "Figuring out why a company is losing market share", B: "Deciding whether an investment is worth the risk", C: "Finding a creative way to double a brand's social media following", D: "Helping someone discover their strengths and grow professionally", E: "Turning a rough idea into a working product people actually use" },
        scoring: { A: {"Strategy Consulting": 2, "Corporate Development": 1, "Digital Transformation Consulting": 1}, B: {"Investment Banking": 2, "FP&A": 1, "Impact Investing": 1, "Real Estate Finance": 1}, C: {"Growth Hacking": 2, "Performance Marketing": 2, "Product Marketing": 1}, D: {"Learning & Development": 2, "HR Business Partner": 1, "Organizational Development": 1}, E: {"Founder": 2, "Venture Builder": 2, "Early-stage Startup Generalist": 1} }
    },
    {
        text: "4. Which skill do people most often compliment you on?",
        options: { A: "Breaking down complex problems into clear steps", B: "Being precise and good with numbers", C: "Coming up with original ideas nobody else thinks of", D: "Making people feel heard and understood", E: "Getting things done quickly and efficiently" },
        scoring: { A: {"IT Consulting": 2, "Risk Consulting": 1, "Tech Business Analyst": 1}, B: {"Hedge Fund": 2, "Quant Finance": 1, "Asset Management": 1, "Compensation & Benefits": 1}, C: {"Brand Management": 2, "Content Marketing": 1, "UX / UI Strategy": 1, "Innovation Management": 1}, D: {"Talent Acquisition": 2, "HR Business Partner": 1, "Customer Success Management": 2}, E: {"Early-stage Startup Generalist": 2, "Business Development (Startup)": 1, "Revenue Operations": 1, "Supply Chain Management": 1} }
    },
    {
        text: "5. Which work situation would you handle best?",
        options: { A: "Tight deadlines and high-stakes client presentations", B: "Spending a full day reviewing documents and spreadsheets carefully", C: "Not knowing if your idea will work and having to pivot quickly", D: "Mediating a disagreement between two senior colleagues", E: "Testing five different versions of something to find what works best" },
        scoring: { A: {"Investment Banking": 2, "M&A Consulting": 1, "Hedge Fund": 1}, B: {"Controlling": 2, "Risk Management (Finance)": 2, "Compensation & Benefits": 1}, C: {"Founder": 2, "Venture Capital": 2, "Impact Investing": 1}, D: {"HR Business Partner": 2, "Organizational Development": 1, "Employer Branding": 1}, E: {"Product Management": 2, "UX / UI Strategy": 1, "Growth Hacking": 1} }
    },
    {
        text: "6. Which internship description sounds most interesting?",
        options: { A: "Support the CFO's team with budgeting and quarterly reporting", B: "Help the sales team pitch to new enterprise clients", C: "Analyze user data to improve the company's app experience", D: "Develop a creative go-to-market plan for a product launch" },
        scoring: { A: {"Corporate Finance": 2, "FP&A": 1, "Controlling": 1}, B: {"Business Development (Startup)": 2, "Customer Success Management": 1, "Revenue Operations": 1}, C: {"Tech Business Analyst": 2, "Data Product Management": 1, "Marketing Analytics": 1}, D: {"Product Marketing": 2, "Growth Hacking": 1, "Innovation Management": 1} }
    },
    {
        text: "7. Which daily task would you enjoy most?",
        options: { A: "Preparing a strategic recommendation for a CEO", B: "Building a financial model to value an acquisition target", C: "Designing and launching an ad campaign across multiple channels", D: "Running a workshop to align a leadership team on company culture", E: "Prioritizing the feature backlog for the next product sprint" },
        scoring: { A: {"Strategy Consulting": 2, "Public Sector Consulting": 1, "Inhouse Consulting": 1}, B: {"Private Equity": 2, "Investment Banking": 1, "Corporate Development": 2, "Real Estate Finance": 1}, C: {"Performance Marketing": 2, "SEO / SEM": 1, "Brand Management": 1}, D: {"Organizational Development": 2, "Learning & Development": 1, "Employer Branding": 1}, E: {"Product Management": 2, "AI Product Management": 1, "Data Product Management": 1} }
    },
    {
        text: "8. How do you approach a problem you've never seen before?",
        options: { A: "Form a hypothesis first, then test it systematically", B: "Gather all available data and look for patterns", C: "Try a bunch of quick experiments and see what sticks", D: "Talk to people involved and understand their perspectives", E: "Build a rough prototype and iterate from there" },
        scoring: { A: {"Strategy Consulting": 2, "Product Strategy": 1, "Risk Consulting": 1}, B: {"Marketing Analytics": 2, "FP&A": 1, "Quant Finance": 1, "Revenue Operations": 1}, C: {"Growth Hacking": 2, "Performance Marketing": 1, "Early-stage Startup Generalist": 1}, D: {"HR Business Partner": 2, "Customer Success Management": 1, "Talent Acquisition": 1}, E: {"Product Management": 2, "UX / UI Strategy": 1, "Venture Builder": 1, "Innovation Management": 1} }
    },
    {
        text: "9. Which topic could you talk about for hours?",
        options: { A: "How industries are changing and which companies will win", B: "How to evaluate whether a startup or property is worth investing in", C: "Why certain brands have cult followings and others don't", D: "What makes a great team culture and how to build one", E: "How a product goes from idea to millions of users" },
        scoring: { A: {"Hedge Fund": 2, "Asset Management": 1, "Strategy Consulting": 1, "Supply Chain Management": 1}, B: {"Private Equity": 2, "Venture Capital": 1, "Real Estate Finance": 2, "Impact Investing": 1}, C: {"CRM / Lifecycle Marketing": 2, "Brand Management": 1, "Employer Branding": 1}, D: {"HR Business Partner": 2, "Talent Acquisition": 1, "Learning & Development": 1}, E: {"Product Management": 2, "Product Strategy": 1, "AI Product Management": 1} }
    },
    {
        text: "10. What kind of company culture would you thrive in?",
        options: { A: "Competitive and fast-paced with high expectations", B: "Analytical and data-driven where decisions are evidence-based", C: "Creative and experimental where new ideas are celebrated", D: "Warm and supportive where people genuinely care about each other", E: "Entrepreneurial and product-focused with lots of ownership" },
        scoring: { A: {"Investment Banking": 2, "Private Equity": 1, "Strategy Consulting": 1}, B: {"Marketing Analytics": 2, "Data Product Management": 1, "Quant Finance": 1, "Revenue Operations": 1}, C: {"Brand Management": 2, "Content Marketing": 1, "UX / UI Strategy": 1, "Innovation Management": 1}, D: {"Learning & Development": 2, "Organizational Development": 1, "Employer Branding": 1, "Customer Success Management": 1}, E: {"Founder": 1, "Product Management": 2, "Early-stage Startup Generalist": 1} }
    },
    {
        text: "11. When making a big decision, what do you rely on most?",
        options: { A: "A structured framework and logical reasoning", B: "Hard data, numbers, and financial projections", C: "Gut feeling and pattern recognition from experience", D: "Input from people I trust and respect", E: "Running a small test to see real results before committing" },
        scoring: { A: {"IT Consulting": 2, "Risk Consulting": 1, "Public Sector Consulting": 1}, B: {"Controlling": 2, "FP&A": 1, "Compensation & Benefits": 1}, C: {"Founder": 2, "Content Marketing": 1, "Brand Management": 1}, D: {"Organizational Development": 2, "HR Business Partner": 1, "Customer Success Management": 1}, E: {"Growth Hacking": 2, "Performance Marketing": 1, "UX / UI Strategy": 1} }
    },
    {
        text: "12. You're preparing for an important job interview. What's your approach?",
        options: { A: "Deep-dive into the company's strategy, competitors, and recent news", B: "Practice articulating my experiences clearly and confidently", C: "Prepare structured, logical answers using the STAR method", D: "Bring an original idea or mini-project to stand out from other candidates" },
        scoring: { A: {"Strategy Consulting": 2, "Corporate Development": 1, "Inhouse Consulting": 1}, B: {"Talent Acquisition": 2, "Employer Branding": 1, "Brand Management": 1}, C: {"Tech Business Analyst": 2, "FP&A": 1, "Supply Chain Management": 1}, D: {"Growth Hacking": 2, "Founder": 1, "Innovation Management": 1} }
    },
    {
        text: "13. Which of these job descriptions excites you most?",
        options: { A: "Help C-level executives make better strategic decisions", B: "Execute complex financial transactions worth millions", C: "Build a brand that consumers love and identify with", D: "Design leadership development programs that transform careers", E: "Own a product roadmap and ship features that users love" },
        scoring: { A: {"Strategy Consulting": 2, "Digital Transformation Consulting": 1, "Public Sector Consulting": 1}, B: {"M&A Consulting": 2, "Investment Banking": 1, "Corporate Development": 1, "Real Estate Finance": 1}, C: {"Brand Management": 2, "Product Marketing": 1, "CRM / Lifecycle Marketing": 1}, D: {"Learning & Development": 2, "Employer Branding": 1, "Compensation & Benefits": 1}, E: {"Product Management": 2, "Product Strategy": 1, "Venture Builder": 1} }
    },
    {
        text: "14. What's the biggest challenge you'd struggle with?",
        options: { A: "Having to focus on tiny details for days without seeing the big picture", B: "Having to come up with creative ideas under pressure", C: "Following strict processes with no room for improvisation", D: "Having to deliver tough feedback or fire someone", E: "Staying focused on one project when many exciting things are happening" },
        scoring: { A: {"Founder": 2, "Strategy Consulting": 1, "Business Development (Startup)": 1}, B: {"Controlling": 2, "Risk Management (Finance)": 1, "Compensation & Benefits": 1}, C: {"Content Marketing": 2, "Innovation Management": 1, "Growth Hacking": 1}, D: {"Learning & Development": 2, "HR Business Partner": 1, "Talent Acquisition": 1}, E: {"Early-stage Startup Generalist": 2, "Venture Builder": 1, "Venture Capital": 1} }
    },
    {
        text: "15. Which type of work would you actively avoid?",
        options: { A: "Repetitive, predictable daily routines with no variety", B: "High-risk situations where failure has big consequences", C: "Anything that requires heavy number-crunching all day", D: "Working alone without any team interaction", E: "Large corporate bureaucracy with slow decision-making" },
        scoring: { A: {"Strategy Consulting": 2, "Founder": 1, "Innovation Management": 1}, B: {"Controlling": 2, "Inhouse Consulting": 1, "Supply Chain Management": 1}, C: {"Content Marketing": 2, "Employer Branding": 1, "Brand Management": 1}, D: {"HR Business Partner": 2, "Customer Success Management": 1, "Revenue Operations": 1}, E: {"Venture Capital": 2, "Founder": 1, "Venture Builder": 1} }
    },
    {
        text: "16. What drives you most in the long run?",
        options: { A: "Making a meaningful impact on society or the environment", B: "Building serious wealth and financial independence", C: "Constantly learning, growing, and taking on new challenges", D: "Empowering others and watching them succeed", E: "Creating something tangible that people use every day" },
        scoring: { A: {"Sustainability Consulting": 2, "Impact Investing": 2, "Public Sector Consulting": 1}, B: {"Investment Banking": 2, "Private Equity": 1, "Hedge Fund": 1, "Real Estate Finance": 1}, C: {"Growth Hacking": 2, "Early-stage Startup Generalist": 1, "Innovation Management": 1}, D: {"HR Business Partner": 2, "Learning & Development": 1, "Employer Branding": 1}, E: {"Product Management": 2, "Data Product Management": 1, "AI Product Management": 1} }
    },
    {
        text: "17. If you could pick any department to work in, which would it be?",
        options: { A: "Strategy or Consulting", B: "Finance or Controlling", C: "Marketing or Communications", D: "Human Resources or People & Culture", E: "Product or Technology" },
        scoring: { A: {"Strategy Consulting": 2, "Digital Transformation Consulting": 1, "Corporate Development": 1}, B: {"Corporate Finance": 2, "Asset Management": 1, "Real Estate Finance": 1}, C: {"Brand Management": 2, "Performance Marketing": 1, "Employer Branding": 1}, D: {"HR Business Partner": 2, "Compensation & Benefits": 1, "Organizational Development": 1}, E: {"Product Management": 2, "Tech Business Analyst": 1, "Innovation Management": 1} }
    },
    {
        text: "18. Which topic would you most want to master?",
        options: { A: "Competitive strategy and how markets evolve", B: "How to value companies, properties, and structure deals", C: "Consumer psychology and what makes people buy", D: "Leadership theory and how to build high-performing teams", E: "How to build and scale technology products" },
        scoring: { A: {"Strategy Consulting": 2, "Inhouse Consulting": 1, "Supply Chain Management": 1}, B: {"Investment Banking": 2, "Real Estate Finance": 2, "Corporate Development": 1, "Private Equity": 1}, C: {"Brand Management": 2, "Product Marketing": 1, "CRM / Lifecycle Marketing": 1}, D: {"Organizational Development": 2, "Learning & Development": 1, "Employer Branding": 1}, E: {"AI Product Management": 2, "Tech Business Analyst": 1, "Innovation Management": 1} }
    },
    {
        text: "19. Which description fits you best?",
        options: { A: "I'm a generalist who can adapt to any situation", B: "I'm a specialist who goes deep on financial topics", C: "I'm a creative thinker who sees opportunities others miss", D: "I'm a natural leader who brings out the best in people", E: "I'm a hands-on builder who learns by doing" },
        scoring: { A: {"Early-stage Startup Generalist": 2, "Inhouse Consulting": 1, "Revenue Operations": 1}, B: {"Corporate Finance": 2, "FP&A": 1, "Controlling": 1, "Compensation & Benefits": 1}, C: {"Brand Management": 2, "Content Marketing": 1, "Innovation Management": 1}, D: {"HR Business Partner": 2, "Organizational Development": 1, "Customer Success Management": 1}, E: {"Founder": 2, "Venture Builder": 1, "Product Management": 1} }
    },
    {
        text: "20. Where do you see yourself in 10 years?",
        options: { A: "Partner at a top consulting firm or advisory boutique", B: "Managing my own investment fund or real estate portfolio", C: "Running my own company or launching new ventures", D: "Leading a large organization as CEO, COO, or Chief People Officer", E: "VP of Product or CTO at a major tech company" },
        scoring: { A: {"Strategy Consulting": 2, "M&A Consulting": 1, "Public Sector Consulting": 1}, B: {"Private Equity": 2, "Venture Capital": 1, "Real Estate Finance": 2, "Impact Investing": 1}, C: {"Founder": 2, "Venture Builder": 1, "Early-stage Startup Generalist": 1}, D: {"Organizational Development": 2, "HR Business Partner": 1, "Employer Branding": 1}, E: {"Product Strategy": 2, "Product Management": 1, "AI Product Management": 1} }
    }
];


// =============================================================
//  ZUSTANDSVARIABLEN
// =============================================================

var currentQ = 0;          // Aktueller Frage-Index
var scores = {};           // Score pro Karriere-Kategorie
var history = [];          // Gewählte Antworten (pro Frage)
var cBar = null;           // Chart.js Bar-Chart Instanz
var cRadar = null;         // Chart.js Radar-Chart Instanz
var cPie = null;           // Chart.js Pie-Chart Instanz


/**
 * Setzt alle Scores auf 0 zurück (Initialisierung und Neustart).
 */
function resetScores() {
    scores = {};
    var keys = Object.keys(careerDesc);
    for (var i = 0; i < keys.length; i++) {
        scores[keys[i]] = 0;
    }
}
resetScores();


// =============================================================
//  SEITE INITIALISIEREN
// =============================================================

/**
 * Seite initialisieren: Login prüfen, Navigation aufbauen,
 * dann prüfen ob ein früheres Ergebnis existiert.
 */
async function initQuizPage() {
    var currentUser = await initPage('page7');
    if (!currentUser) {
        return;
    }

    // Früheres Ergebnis laden und ggf. Banner anzeigen
    await loadPreviousResult();
}


/**
 * Lädt ein früheres Quiz-Ergebnis vom Server.
 * Wenn eines existiert, zeigt es einen Banner auf dem Intro-Screen.
 */
async function loadPreviousResult() {
    try {
        var response = await fetch('/api/quiz/results');
        var result = await response.json();

        if (result.success && result.quizResult) {
            var saved = result.quizResult;
            var banner = document.getElementById('quizPrevBanner');
            var date = saved.savedAt ? new Date(saved.savedAt).toLocaleDateString('en-GB') : '';
            banner.innerHTML = 'You completed this assessment before'
                + (date ? ' on ' + date : '')
                + '. Your result: <strong>' + escapeHtml(saved.profileEmoji + ' ' + saved.profileType) + '</strong>. '
                + '<button class="btn btn-secondary btn-sm" style="display:inline-flex; margin-left:8px;" onclick="restoreFromSaved(' + JSON.stringify(saved.answers).replace(/"/g, '&quot;') + ')">View Previous Results</button>';
            banner.style.display = 'block';
        }
    } catch (e) {
        // Kein vorheriges Ergebnis oder Netzwerkfehler — einfach ignorieren
    }
}


// =============================================================
//  QUIZ STARTEN
// =============================================================

/**
 * Startet das Quiz: Intro verstecken, Quiz-Bereich anzeigen.
 */
function startQuiz() {
    resetScores();
    currentQ = 0;
    history = [];

    document.getElementById('quizIntro').style.display = 'none';
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizSection').style.display = 'block';
    showQuestion();
}


/**
 * Stellt das Quiz nach Abschluss zurück auf den Intro-Screen.
 */
function restartQuiz() {
    document.getElementById('quizResults').style.display = 'none';
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('quizIntro').style.display = 'block';
    // Charts aufräumen
    if (cBar) { cBar.destroy(); cBar = null; }
    if (cRadar) { cRadar.destroy(); cRadar = null; }
    if (cPie) { cPie.destroy(); cPie = null; }
}


// =============================================================
//  FRAGEN ANZEIGEN
// =============================================================

/**
 * Zeigt die aktuelle Frage an.
 */
function showQuestion() {
    var q = quizQuestions[currentQ];
    var pct = Math.round((currentQ / quizQuestions.length) * 100);

    document.getElementById('quizProgBar').style.width = pct + '%';
    document.getElementById('quizProgPct').textContent = pct + '%';
    document.getElementById('quizQNum').textContent = currentQ + 1;
    document.getElementById('quizQText').textContent = q.text;

    // Antwort-Buttons aufbauen
    var container = document.getElementById('quizQOpts');
    container.innerHTML = '';

    var optionKeys = Object.keys(q.options);
    for (var i = 0; i < optionKeys.length; i++) {
        var key = optionKeys[i];
        var btn = document.createElement('button');
        btn.className = 'quiz-option-btn';

        // Wenn diese Option die aktuelle Antwort ist, markieren
        if (history[currentQ] && history[currentQ].key === key) {
            btn.className += ' selected';
        }

        btn.innerHTML = '<strong>' + key + ')</strong> ' + escapeHtml(q.options[key]);

        // Closure damit jeder Button seinen eigenen key kennt
        (function (k, el) {
            el.onclick = function () { pickAnswer(k, el); };
        })(key, btn);

        container.appendChild(btn);
    }

    // Vorherige Antwort anzeigen (wenn vorhanden)
    var prevDiv = document.getElementById('quizPrevAns');
    if (history[currentQ]) {
        prevDiv.style.display = 'block';
        prevDiv.innerHTML = 'Previous answer: <strong>' + history[currentQ].key + ') ' + escapeHtml(history[currentQ].text) + '</strong>';
    } else {
        prevDiv.style.display = 'none';
    }

    // Zurück-Button: Bei Frage 1 deaktivieren
    var backBtn = document.getElementById('quizBackBtn');
    backBtn.disabled = (currentQ === 0);
    backBtn.style.opacity = (currentQ === 0) ? '0.5' : '1';
}


/**
 * Wird aufgerufen wenn der User eine Antwort auswählt.
 * Aktualisiert den Score und geht zur nächsten Frage.
 */
function pickAnswer(key, btnEl) {
    var q = quizQuestions[currentQ];

    // Alten Score dieser Frage zurückrechnen (falls Frage wiederholt beantwortet)
    if (history[currentQ]) {
        var oldScoring = q.scoring[history[currentQ].key];
        if (oldScoring) {
            var oldKeys = Object.keys(oldScoring);
            for (var i = 0; i < oldKeys.length; i++) {
                scores[oldKeys[i]] -= oldScoring[oldKeys[i]];
            }
        }
    }

    // Neuen Score addieren
    var newScoring = q.scoring[key];
    if (newScoring) {
        var newKeys = Object.keys(newScoring);
        for (var j = 0; j < newKeys.length; j++) {
            scores[newKeys[j]] += newScoring[newKeys[j]];
        }
    }

    // Antwort speichern
    history[currentQ] = { key: key, text: q.options[key] };

    // Button kurz visuell bestätigen, dann weiter
    btnEl.style.background = 'rgba(99,102,241,0.15)';
    btnEl.style.borderColor = 'var(--accent)';
    var box = document.getElementById('quizQBox');
    box.classList.add('slide-out');

    setTimeout(function () {
        box.classList.remove('slide-out');
        currentQ++;
        if (currentQ < quizQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 250);
}


/**
 * Geht zur vorherigen Frage zurück.
 */
function quizGoBack() {
    if (currentQ > 0) {
        currentQ--;
        showQuestion();
    }
}


// =============================================================
//  ERGEBNISSE ANZEIGEN
// =============================================================

/**
 * Berechnet und zeigt die Ergebnisse an.
 * Speichert das Ergebnis außerdem per POST auf dem Server.
 */
async function showResults() {
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('quizResults').style.display = 'block';

    // Fortschrittsbalken auf 100% setzen
    document.getElementById('quizProgBar').style.width = '100%';
    document.getElementById('quizProgPct').textContent = '100%';

    // Scores sortieren (nur Kategorien mit Score > 0)
    var sorted = [];
    var allKeys = Object.keys(scores);
    for (var i = 0; i < allKeys.length; i++) {
        if (scores[allKeys[i]] > 0) {
            sorted.push([allKeys[i], scores[allKeys[i]]]);
        }
    }
    sorted.sort(function (a, b) { return b[1] - a[1]; });

    // Profil rendern
    renderProfile();

    // Top-3-Karten rendern
    renderTopCards(sorted);

    // Score-Tabelle rendern
    renderScoreTable(sorted);

    // Antworten rendern
    renderAnswers();

    // Charts rendern
    renderCharts(sorted);

    // Konfetti
    launchConfetti();

    // Ergebnis auf dem Server speichern
    await saveResults();
}


/**
 * Stellt ein früheres Ergebnis aus einem Array von Antworten wieder her.
 * Wird aufgerufen wenn der User auf "View Previous Results" klickt.
 *
 * @param {Array} answers - Array mit Antwort-Keys (z.B. ["A", "B", "E", ...])
 */
function restoreFromSaved(answers) {
    resetScores();
    history = [];

    // Scores aus gespeicherten Antworten berechnen
    for (var i = 0; i < answers.length && i < quizQuestions.length; i++) {
        var key = answers[i];
        if (!key || key === 'X') {
            history.push(null);
            continue;
        }
        var q = quizQuestions[i];
        if (q.options[key]) {
            var sc = q.scoring[key];
            if (sc) {
                var ck = Object.keys(sc);
                for (var j = 0; j < ck.length; j++) {
                    scores[ck[j]] += sc[ck[j]];
                }
            }
            history.push({ key: key, text: q.options[key] });
        } else {
            history.push(null);
        }
    }

    currentQ = quizQuestions.length;
    document.getElementById('quizIntro').style.display = 'none';
    showResults();
}


// =============================================================
//  PROFIL BERECHNEN
// =============================================================

/**
 * Ermittelt den dominanten Antwort-Typ (A-E) und zeigt das Profil an.
 */
function renderProfile() {
    var counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (var i = 0; i < history.length; i++) {
        if (history[i] && counts[history[i].key] !== undefined) {
            counts[history[i].key]++;
        }
    }

    // Dominanten Typ finden
    var dominant = 'A';
    var maxCount = 0;
    var typeKeys = Object.keys(counts);
    for (var j = 0; j < typeKeys.length; j++) {
        if (counts[typeKeys[j]] > maxCount) {
            maxCount = counts[typeKeys[j]];
            dominant = typeKeys[j];
        }
    }

    var profile = quizProfiles[dominant];
    document.getElementById('quizProfEmoji').textContent = profile.emoji;
    document.getElementById('quizProfType').textContent = profile.type;
    document.getElementById('quizProfDesc').textContent = profile.desc;
}


// =============================================================
//  TOP-3-KARTEN
// =============================================================

/**
 * Zeigt die drei besten Karriere-Matches als Karten.
 *
 * @param {Array} sorted - Sortierte Liste [[karriere, score], ...]
 */
function renderTopCards(sorted) {
    var container = document.getElementById('quizTopCards');
    container.innerHTML = '';

    var top3 = sorted.slice(0, 3);
    for (var t = 0; t < top3.length; t++) {
        var career = top3[t][0];
        var score = top3[t][1];

        // Gründe für dieses Ergebnis sammeln
        var reasons = getReasons(career);
        var reasonsHtml = '';
        for (var r = 0; r < reasons.length; r++) {
            reasonsHtml += reasons[r] + '<br>';
        }
        if (!reasonsHtml) {
            reasonsHtml = 'Multiple contributions from various answers.';
        }

        var accId = 'quizAcc' + t;
        var card = document.createElement('div');
        card.className = 'quiz-result-card quiz-fade-in';
        card.innerHTML = '<h3>#' + (t + 1) + ': ' + escapeHtml(career) + ' (Score: ' + score + ')</h3>'
            + '<p>' + escapeHtml(careerDesc[career] || '') + '</p>'
            + '<button class="quiz-acc-btn" onclick="quizToggleAcc(\'' + accId + '\')">Why this result?</button>'
            + '<div class="quiz-acc-body" id="' + accId + '">' + reasonsHtml + '</div>';
        container.appendChild(card);
    }
}


/**
 * Gibt die Gründe zurück warum eine Karriere-Kategorie Punkte bekommen hat.
 * (Welche Fragen/Antworten haben dazu beigetragen)
 */
function getReasons(career) {
    var reasons = [];
    for (var i = 0; i < history.length; i++) {
        if (!history[i]) { continue; }
        var sc = quizQuestions[i].scoring[history[i].key];
        if (sc && sc[career]) {
            reasons.push('Q' + (i + 1) + ': <strong>' + history[i].key + ') ' + escapeHtml(history[i].text) + '</strong> (+' + sc[career] + ')');
        }
    }
    return reasons;
}


// =============================================================
//  SCORE-TABELLE
// =============================================================

/**
 * Baut die vollständige Score-Tabelle auf.
 */
function renderScoreTable(sorted) {
    var tbody = document.getElementById('quizScoreTable');
    tbody.innerHTML = '';

    for (var s = 0; s < sorted.length; s++) {
        var careerName = sorted[s][0];
        var careerScore = sorted[s][1];
        var tr = document.createElement('tr');
        tr.innerHTML = '<td onclick="openCareerModal(\'' + careerName.replace(/'/g, "\\'") + '\')">' + escapeHtml(careerName) + '</td>'
            + '<td style="text-align:center; font-weight:700;">' + careerScore + '</td>';
        tbody.appendChild(tr);
    }
}


// =============================================================
//  ANTWORTEN ANZEIGEN
// =============================================================

/**
 * Zeigt alle Fragen mit der jeweiligen Antwort im Akkordeon an.
 */
function renderAnswers() {
    var html = '';
    for (var i = 0; i < quizQuestions.length; i++) {
        var a = history[i];
        var answerText = a
            ? '<strong>' + a.key + ')</strong> ' + escapeHtml(a.text)
            : '<em>Not answered</em>';
        // Fragenummer aus dem Text entfernen (z.B. "1. " am Anfang)
        var questionText = quizQuestions[i].text.replace(/^\d+\.\s*/, '');
        html += '<div style="padding:6px 0; border-bottom:1px solid var(--border);">'
            + '<span style="color:var(--text-light); font-size:12px;">Q' + (i + 1) + ':</span> '
            + escapeHtml(questionText)
            + '<br>' + answerText + '</div>';
    }
    document.getElementById('quizAnswersAcc').innerHTML = html;
}


// =============================================================
//  AKKORDEON
// =============================================================

/**
 * Klappt ein Akkordeon auf oder zu.
 */
function quizToggleAcc(id) {
    document.getElementById(id).classList.toggle('open');
}


// =============================================================
//  CAREER DETAIL MODAL
// =============================================================

/**
 * Öffnet das Detail-Modal für eine Karriere-Kategorie.
 */
function openCareerModal(career) {
    document.getElementById('modalTitle').textContent = career;
    document.getElementById('modalDesc').textContent = careerDesc[career] || '—';

    var d = careerDetails[career];
    document.getElementById('modalPos').textContent = d ? d.pos : 'Details available for top careers.';
    document.getElementById('modalSkills').textContent = d ? d.skills : '—';
    document.getElementById('modalSalary').textContent = d ? d.salary : '—';

    document.getElementById('quizModal').classList.add('open');
}


/**
 * Schließt das Modal wenn der User außerhalb klickt.
 */
function closeCareerModal(e) {
    if (e.target === document.getElementById('quizModal')) {
        document.getElementById('quizModal').classList.remove('open');
    }
}


// =============================================================
//  BUCKETS FÜR RADAR/PIE CHART
// =============================================================

/**
 * Gruppiert Karriere-Kategorien in 5 Oberkategorien für die Charts.
 */
function getBuckets(sorted) {
    var b = { Consulting: 0, Finance: 0, Marketing: 0, HR: 0, Product_Startup: 0 };
    for (var i = 0; i < sorted.length; i++) {
        var c = sorted[i][0];
        var s = sorted[i][1];
        if (c.indexOf("Consulting") !== -1) {
            b.Consulting += s;
        } else if (c.indexOf("Finance") !== -1 || c.indexOf("Banking") !== -1 || c.indexOf("Equity") !== -1 || c.indexOf("Capital") !== -1 || c.indexOf("Fund") !== -1 || c.indexOf("FP&A") !== -1 || c.indexOf("Controlling") !== -1 || c.indexOf("Asset") !== -1 || c === "Corporate Development" || c.indexOf("Real Estate") !== -1 || c.indexOf("Impact Investing") !== -1) {
            b.Finance += s;
        } else if (c.indexOf("Marketing") !== -1 || c.indexOf("Brand") !== -1 || c.indexOf("SEO") !== -1 || c.indexOf("CRM") !== -1 || c.indexOf("Growth") !== -1 || c.indexOf("Content") !== -1 || c === "Revenue Operations" || c === "Customer Success Management") {
            b.Marketing += s;
        } else if (c.indexOf("HR") !== -1 || c.indexOf("Talent") !== -1 || c.indexOf("Learning") !== -1 || c.indexOf("Organizational") !== -1 || c.indexOf("Employer") !== -1 || c.indexOf("Compensation") !== -1) {
            b.HR += s;
        } else {
            b.Product_Startup += s;
        }
    }
    return b;
}


// =============================================================
//  CHARTS
// =============================================================

/**
 * Rendert alle Charts im Ergebnis-Bereich.
 * Zerstört vorherige Chart-Instanzen um Fehler zu vermeiden.
 */
function renderCharts(sorted) {
    // Alte Charts zerstören
    if (cBar) { cBar.destroy(); cBar = null; }
    if (cRadar) { cRadar.destroy(); cRadar = null; }
    if (cPie) { cPie.destroy(); cPie = null; }

    var top10 = sorted.slice(0, 10);
    var bk = getBuckets(sorted);

    var top10Labels = [];
    var top10Data = [];
    for (var i = 0; i < top10.length; i++) {
        top10Labels.push(top10[i][0]);
        top10Data.push(top10[i][1]);
    }

    // Bar Chart: Top 10 Scores
    cBar = new Chart(document.getElementById('quizChartBar').getContext('2d'), {
        type: 'bar',
        data: {
            labels: top10Labels,
            datasets: [{
                label: 'Score',
                data: top10Data,
                backgroundColor: ['#6366f1','#7c3aed','#8b5cf6','#a78bfa','#c4b5fd','#818cf8','#93c5fd','#60a5fa','#34d399','#fbbf24']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true },
                x: { ticks: { maxRotation: 45, font: { size: 11 } } }
            }
        }
    });

    // Radar Chart: Profil-Übersicht
    cRadar = new Chart(document.getElementById('quizChartRadar').getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Consulting', 'Finance', 'Marketing', 'HR', 'Product / Startup'],
            datasets: [{
                label: 'Profile',
                data: [bk.Consulting, bk.Finance, bk.Marketing, bk.HR, bk.Product_Startup],
                backgroundColor: 'rgba(99,102,241,0.12)',
                borderColor: '#6366f1',
                borderWidth: 2,
                pointBackgroundColor: '#6366f1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: { r: { beginAtZero: true, pointLabels: { font: { size: 13 } } } },
            plugins: { legend: { display: false } }
        }
    });

    // Pie Chart: Interessensverteilung
    cPie = new Chart(document.getElementById('quizChartPie').getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['Consulting', 'Finance', 'Marketing', 'HR', 'Product / Startup'],
            datasets: [{
                data: [bk.Consulting, bk.Finance, bk.Marketing, bk.HR, bk.Product_Startup],
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        },
        options: { responsive: true, maintainAspectRatio: true }
    });
}


// =============================================================
//  ERGEBNIS SPEICHERN
// =============================================================

/**
 * Sendet das Ergebnis per POST an den Server.
 * Speichert Antworten, Profiltyp und Emoji.
 */
async function saveResults() {
    try {
        // Dominanten Typ bestimmen (für profileType + profileEmoji)
        var counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        for (var i = 0; i < history.length; i++) {
            if (history[i] && counts[history[i].key] !== undefined) {
                counts[history[i].key]++;
            }
        }
        var dominant = 'A';
        var maxCount = 0;
        var typeKeys = Object.keys(counts);
        for (var j = 0; j < typeKeys.length; j++) {
            if (counts[typeKeys[j]] > maxCount) {
                maxCount = counts[typeKeys[j]];
                dominant = typeKeys[j];
            }
        }
        var profile = quizProfiles[dominant];

        // Antworten als einfaches Array speichern (z.B. ["A", "B", null, "E", ...])
        var answersArray = [];
        for (var k = 0; k < history.length; k++) {
            answersArray.push(history[k] ? history[k].key : 'X');
        }

        await fetch('/api/quiz/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                answers: answersArray,
                profileType: profile.type,
                profileEmoji: profile.emoji
            })
        });

    } catch (e) {
        // Speichern fehlgeschlagen — kein showToast, Quiz läuft weiter
        console.log('Konnte Ergebnis nicht speichern:', e);
    }
}


// =============================================================
//  KONFETTI
// =============================================================

/**
 * Zeigt eine kurze Konfetti-Animation wenn die Ergebnisse erscheinen.
 */
function launchConfetti() {
    var cv = document.getElementById('quizConfetti');
    if (!cv) { return; }
    var cx = cv.getContext('2d');
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;

    var cols = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#f97316'];
    var pieces = [];
    for (var i = 0; i < 100; i++) {
        pieces.push({
            x: Math.random() * cv.width,
            y: Math.random() * cv.height - cv.height,
            w: Math.random() * 8 + 3,
            h: Math.random() * 5 + 2,
            color: cols[Math.floor(Math.random() * cols.length)],
            vy: Math.random() * 3 + 2,
            vx: Math.random() * 2 - 1,
            rot: Math.random() * 360,
            rs: Math.random() * 5 - 2.5
        });
    }

    var frame = 0;
    var maxFrames = 150;

    function animate() {
        frame++;
        if (frame > maxFrames) {
            cx.clearRect(0, 0, cv.width, cv.height);
            return;
        }
        cx.clearRect(0, 0, cv.width, cv.height);
        if (frame > maxFrames - 50) {
            cx.globalAlpha = (maxFrames - frame) / 50;
        }
        for (var i = 0; i < pieces.length; i++) {
            var p = pieces[i];
            p.y += p.vy;
            p.x += p.vx;
            p.rot += p.rs;
            cx.save();
            cx.translate(p.x, p.y);
            cx.rotate(p.rot * Math.PI / 180);
            cx.fillStyle = p.color;
            cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            cx.restore();
        }
        cx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }
    animate();
}


// =============================================================
//  SEITE STARTEN
// =============================================================

initQuizPage();
