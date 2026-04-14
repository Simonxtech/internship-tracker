/**
 * =============================================================
 *  services/quizService.js — Quiz-Daten und Logik
 * =============================================================
 *
 *  Diese Datei enthält:
 *    - Alle 20 Quiz-Fragen mit Optionen
 *    - Alle 50 Karrierebeschreibungen
 *    - Detail-Informationen für Karrieren
 *    - Funktionen zum Speichern und Laden von Quiz-Ergebnissen
 *
 *  Wird von routes/quizRoutes.js benutzt.
 * =============================================================
 */

const dataService = require('./dataService');
const path = require('path');

// --- Quiz-Fragen (20 Stück) ---
const questions = [
    {
        text: "1. You have a free Saturday. What sounds most appealing?",
        options: {
            A: "Solving a complex logic puzzle or case study",
            B: "Building a spreadsheet model or analyzing trends",
            C: "Working on a creative marketing campaign",
            D: "Organizing a team event or helping someone",
            E: "Working on a side project or building a prototype"
        },
        scoring: {
            A: { "Strategy Consulting": 2, "Inhouse Consulting": 2 },
            B: { "FP&A": 2, "Quant Finance": 2 },
            C: { "Brand Management": 2, "Growth Hacking": 2 },
            D: { "Talent Acquisition": 2, "HR Business Partner": 2 },
            E: { "Product Management": 2, "Founder": 2 }
        }
    },
    {
        text: "2. In a group project, what role do you naturally take?",
        options: {
            A: "The strategist who defines the direction",
            B: "The analyst who checks everything is correct",
            C: "The organizer who keeps things moving",
            D: "The people-person who keeps morale up",
            E: "The builder who makes the actual deliverable"
        },
        scoring: {
            A: { "Strategy Consulting": 2, "Private Equity": 1 },
            B: { "Controlling": 2, "Risk Management (Finance)": 1 },
            C: { "Product Management": 2, "Revenue Operations": 1 },
            D: { "Organizational Development": 2, "HR Business Partner": 1 },
            E: { "Product Development": 2, "Tech Business Analyst": 1 }
        }
    },
    {
        text: "3. Which type of challenge gets you most excited?",
        options: {
            A: "Advising a CEO on a major business decision",
            B: "Modeling complex financial scenarios",
            C: "Creating a campaign that millions will see",
            D: "Building a strong team culture",
            E: "Turning a rough idea into a working product"
        },
        scoring: {
            A: { "Strategy Consulting": 3 },
            B: { "Investment Banking": 3 },
            C: { "Performance Marketing": 3 },
            D: { "Organizational Development": 3 },
            E: { "Product Management": 3 }
        }
    },
    {
        text: "4. Which skill do people most often compliment you on?",
        options: {
            A: "Big-picture thinking and problem-solving",
            B: "Attention to detail and accuracy",
            C: "Creativity and out-of-the-box ideas",
            D: "Leadership and bringing people together",
            E: "Getting things done quickly and efficiently"
        },
        scoring: {
            A: { "M&A Consulting": 2, "Strategy Consulting": 2 },
            B: { "Controlling": 2, "Risk Consulting": 2 },
            C: { "Content Marketing": 2, "Growth Hacking": 2 },
            D: { "Talent Acquisition": 2, "Organizational Development": 2 },
            E: { "Revenue Operations": 2, "Customer Success Management": 2 }
        }
    },
    {
        text: "5. Which work situation would you handle best?",
        options: {
            A: "Advising on a complex acquisition",
            B: "Auditing financial processes",
            C: "Testing five marketing versions of something to find what works",
            D: "Solving a conflict between team members",
            E: "Building a prototype and iterating"
        },
        scoring: {
            A: { "M&A Consulting": 2, "Investment Banking": 2 },
            B: { "Risk Management (Finance)": 2, "Controlling": 2 },
            C: { "Marketing Analytics": 2, "Growth Hacking": 2 },
            D: { "HR Business Partner": 2, "Organizational Development": 2 },
            E: { "Product Management": 2, "AI Product Management": 2 }
        }
    },
    {
        text: "6. Which internship description sounds most interesting?",
        options: {
            A: "Advise Fortune 500 companies on growth strategy",
            B: "Build financial models for investment decisions",
            C: "Launch a new social media marketing campaign",
            D: "Design an employee training program",
            E: "Develop a new product feature"
        },
        scoring: {
            A: { "Strategy Consulting": 3, "IT Consulting": 2 },
            B: { "FP&A": 3, "Asset Management": 2 },
            C: { "Performance Marketing": 3, "Brand Management": 2 },
            D: { "Learning & Development": 3, "Organizational Development": 2 },
            E: { "Product Management": 3, "Data Product Management": 2 }
        }
    },
    {
        text: "7. Which daily task would you enjoy most?",
        options: {
            A: "Analyzing a client's business model to find improvement areas",
            B: "Creating and refining budgets and forecasts",
            C: "Writing copy for a campaign or creating visuals",
            D: "Networking and building relationships",
            E: "Prioritizing the feature backlog for the next sprint"
        },
        scoring: {
            A: { "IT Consulting": 2, "Strategy Consulting": 2 },
            B: { "FP&A": 3, "Controlling": 2 },
            C: { "Content Marketing": 3, "Brand Management": 2 },
            D: { "Business Development (Startup)": 2, "Venture Capital": 2 },
            E: { "Product Management": 3, "Tech Business Analyst": 2 }
        }
    },
    {
        text: "8. How do you approach a problem you've never seen before?",
        options: {
            A: "Break it down into a structured framework",
            B: "Gather all the data first",
            C: "Brainstorm creative solutions",
            D: "Ask the team for input",
            E: "Build a rough prototype and iterate"
        },
        scoring: {
            A: { "Strategy Consulting": 3, "Management Consulting": 2 },
            B: { "Tech Business Analyst": 2, "Marketing Analytics": 2 },
            C: { "Growth Hacking": 3, "Innovation Management": 2 },
            D: { "HR Business Partner": 2, "Organizational Development": 2 },
            E: { "Product Management": 3, "Venture Builder": 2 }
        }
    },
    {
        text: "9. Which topic could you talk about for hours?",
        options: {
            A: "How companies can grow and compete better",
            B: "Financial markets, investments, or statistics",
            C: "Consumer behavior and what makes ads work",
            D: "How to build strong teams and company culture",
            E: "How a product goes from idea to millions of users"
        },
        scoring: {
            A: { "Strategy Consulting": 3, "Corporate Development": 2 },
            B: { "Quant Finance": 3, "Private Equity": 2 },
            C: { "Performance Marketing": 3, "Product Marketing": 2 },
            D: { "Organizational Development": 3, "Employer Branding": 2 },
            E: { "Product Management": 3, "Early-stage Startup Generalist": 2 }
        }
    },
    {
        text: "10. What kind of company culture would you thrive in?",
        options: {
            A: "Elite, structured, prestigious",
            B: "Data-driven and precise",
            C: "Creative and experimental",
            D: "Collaborative and people-focused",
            E: "Entrepreneurial and product-focused"
        },
        scoring: {
            A: { "Strategy Consulting": 2, "Investment Banking": 2 },
            B: { "Quant Finance": 2, "Tech Business Analyst": 2 },
            C: { "Growth Hacking": 2, "Creative Roles": 1 },
            D: { "HR Business Partner": 2, "Organizational Development": 2 },
            E: { "Founder": 3, "Early-stage Startup Generalist": 2 }
        }
    },
    {
        text: "11. When making a big decision, what do you rely on most?",
        options: {
            A: "Strategic thinking and frameworks",
            B: "Data and quantitative analysis",
            C: "Intuition and creative thinking",
            D: "Input from the team",
            E: "Running a small test to see real results"
        },
        scoring: {
            A: { "Strategy Consulting": 2, "IT Consulting": 1 },
            B: { "FP&A": 2, "Marketing Analytics": 1 },
            C: { "Growth Hacking": 2, "Product Marketing": 1 },
            D: { "HR Business Partner": 2, "Change Management": 1 },
            E: { "Product Management": 3, "Growth Hacking": 1 }
        }
    },
    {
        text: "12. You're preparing for an important job interview. What's your approach?",
        options: {
            A: "Research the company's strategy and competition deeply",
            B: "Learn about their financials and metrics",
            C: "Come up with a creative pitch or project",
            D: "Prepare stories about teamwork and leadership",
            E: "Bring a mini-project or prototype to show"
        },
        scoring: {
            A: { "Strategy Consulting": 2, "Management Consulting": 1 },
            B: { "Corporate Finance": 2, "Investment Banking": 1 },
            C: { "Brand Management": 2, "Performance Marketing": 1 },
            D: { "Organizational Development": 2, "Talent Acquisition": 1 },
            E: { "Product Management": 2, "Data Product Management": 1 }
        }
    },
    {
        text: "13. How do you feel about travel and client interaction?",
        options: {
            A: "Love it — visiting clients is the best part",
            B: "Prefer stability and working from one desk",
            C: "Mix of both is ideal",
            D: "More interested in internal team work",
            E: "Happy working wherever needed"
        },
        scoring: {
            A: { "Strategy Consulting": 3, "M&A Consulting": 2 },
            B: { "Controlling": 2, "Quant Finance": 2 },
            C: { "Business Development (Startup)": 2, "Product Marketing": 2 },
            D: { "Organizational Development": 2, "HR Business Partner": 2 },
            E: { "Founder": 1, "Product Management": 1 }
        }
    },
    {
        text: "14. What's your relationship with code and technical skills?",
        options: {
            A: "Not my strength, prefer business side",
            B: "I understand numbers and dashboards",
            C: "Not essential for my work",
            D: "People skills matter more",
            E: "I code or want to learn to code"
        },
        scoring: {
            A: { "IT Consulting": 1, "Management Consulting": 2 },
            B: { "Tech Business Analyst": 2, "Data Product Management": 2 },
            C: { "Brand Management": 2, "HR Business Partner": 2 },
            D: { "Talent Acquisition": 2, "Organizational Development": 2 },
            E: { "Product Management": 2, "AI Product Management": 3 }
        }
    },
    {
        text: "15. What does success look like to you?",
        options: {
            A: "Advising leaders and seeing my ideas implemented",
            B: "Building accurate models and reducing risk",
            C: "Creating something millions of people use and love",
            D: "Building great teams and seeing people succeed",
            E: "Building a successful product or company"
        },
        scoring: {
            A: { "Strategy Consulting": 3, "Corporate Development": 2 },
            B: { "Risk Consulting": 2, "Controlling": 2 },
            C: { "Product Marketing": 2, "Performance Marketing": 2 },
            D: { "Talent Acquisition": 2, "Organizational Development": 3 },
            E: { "Founder": 3, "Product Management": 2 }
        }
    },
    {
        text: "16. How comfortable are you with ambiguity and risk?",
        options: {
            A: "I like clear frameworks and proven approaches",
            B: "Prefer quantified risks I can model",
            C: "Comfortable experimenting and learning fast",
            D: "Prefer a stable, predictable environment",
            E: "Thrive on uncertainty and change"
        },
        scoring: {
            A: { "Controlling": 2, "Risk Consulting": 1 },
            B: { "Risk Management (Finance)": 2, "Private Equity": 1 },
            C: { "Growth Hacking": 3, "Innovation Management": 2 },
            D: { "HR Business Partner": 2, "Learning & Development": 2 },
            E: { "Founder": 3, "Venture Capital": 2 }
        }
    },
    {
        text: "17. Are you more motivated by financial return or impact?",
        options: {
            A: "Return on investment",
            B: "Financial metrics and performance",
            C: "Market impact and brand recognition",
            D: "Impact on people and society",
            E: "Building something meaningful"
        },
        scoring: {
            A: { "Investment Banking": 2, "Private Equity": 2 },
            B: { "FP&A": 2, "Asset Management": 2 },
            C: { "Performance Marketing": 2, "Brand Management": 2 },
            D: { "Impact Investing": 3, "Sustainability Consulting": 2 },
            E: { "Founder": 2, "Early-stage Startup Generalist": 2 }
        }
    },
    {
        text: "18. What's your current biggest challenge in a relationship at work?",
        options: {
            A: "Communicating complex ideas to non-experts",
            B: "Accepting that perfect is sometimes the enemy of good",
            C: "Getting buy-in from serious stakeholders",
            D: "Navigating office politics",
            E: "Balancing speed with quality"
        },
        scoring: {
            A: { "IT Consulting": 2, "Tech Business Analyst": 1 },
            B: { "Controlling": 2, "Risk Consulting": 1 },
            C: { "Product Marketing": 2, "Business Development (Startup)": 1 },
            D: { "Organizational Development": 2, "HR Business Partner": 1 },
            E: { "Agile Roles": 1, "Product Management": 2 }
        }
    },
    {
        text: "19. Where do you see yourself in 5 years?",
        options: {
            A: "Senior Consultant or Strategy Head in a large company",
            B: "Finance Director or Head of a business unit",
            C: "VP of Marketing or running my own brand",
            D: "HR Director or building my own business",
            E: "Founder, Product Leader, or Head of Innovation"
        },
        scoring: {
            A: { "Strategy Consulting": 2, "Management Consulting": 2 },
            B: { "FP&A": 2, "Corporate Finance": 2 },
            C: { "Brand Management": 2, "Performance Marketing": 2 },
            D: { "Organizational Development": 2, "Founder": 1 },
            E: { "Founder": 3, "Product Management": 2 }
        }
    },
    {
        text: "20. What gets you out of bed in the morning?",
        options: {
            A: "Solving problems and making smart recommendations",
            B: "Getting the numbers right and managing risk",
            C: "Creating something beautiful or viral",
            D: "Helping others grow and succeed",
            E: "Building something cool that didn't exist before"
        },
        scoring: {
            A: { "Strategy Consulting": 3, "IT Consulting": 2 },
            B: { "FP&A": 3, "Risk Consulting": 2 },
            C: { "Content Marketing": 3, "Growth Hacking": 2 },
            D: { "Learning & Development": 3, "Organizational Development": 2 },
            E: { "Product Management": 3, "Founder": 3 }
        }
    }
];

// --- 50 Karriere-Beschreibungen ---
const careers = {
    "Strategy Consulting": "Advises executives on corporate strategy, growth, and high-level decisions.",
    "IT Consulting": "Aligns technology strategy with business processes and implements tech solutions.",
    "Digital Transformation Consulting": "Guides companies through digitalization and modernizing business models.",
    "Inhouse Consulting": "Internal strategy teams solving critical problems exclusively for their corporation.",
    "M&A Consulting": "Advises on mergers, acquisitions, and post-merger integrations.",
    "Risk Consulting": "Helps organizations identify, manage, and mitigate operational and strategic risks.",
    "Management Consulting": "Provides strategic advice across all business functions and industries.",
    "Sustainability Consulting": "Advises businesses on ESG principles, green initiatives, and sustainability.",
    "Public Sector Consulting": "Advises governments, NGOs, and public institutions on policy and efficiency.",
    "Investment Banking": "Raises capital and provides strategic M&A advisory services.",
    "Private Equity": "Invests in private companies or buyouts to restructure and sell for profit.",
    "Venture Capital": "Provides funding and strategic support to high-growth startups.",
    "Asset Management": "Manages investments and portfolios on behalf of clients or institutions.",
    "Hedge Fund": "Uses complex investment strategies and risk management to generate high returns.",
    "Corporate Finance": "Manages a company's financial activities, funding, and capital structuring.",
    "FP&A": "Financial Planning & Analysis – budgeting, forecasting, and driving financial decisions.",
    "Controlling": "Focuses on financial reporting, cost management, and internal controls.",
    "Risk Management (Finance)": "Identifies and mitigates financial risks (credit, market, liquidity).",
    "Quant Finance": "Applies advanced mathematical models and algorithms to price securities and trade.",
    "Real Estate Finance": "Finances, values, and manages commercial and residential real estate investments.",
    "Brand Management": "Develops and maintains the perception and strategy of a brand.",
    "Performance Marketing": "Drives measurable campaigns and advertising based on ROI/CPA.",
    "Growth Hacking": "Uses creative, low-cost strategies to rapidly acquire and retain customers.",
    "CRM / Lifecycle Marketing": "Manages customer retention, loyalty programs, and lifetime value.",
    "Product Marketing": "Positions and launches products, bridging the gap between product and sales.",
    "Content Marketing": "Creates valuable media and content to attract and engage target audiences.",
    "SEO / SEM": "Optimizes online presence to increase organic and paid search visibility.",
    "Marketing Analytics": "Analyzes campaign data and user behavior to optimize marketing ROI.",
    "Revenue Operations": "Aligns sales, marketing, and customer success to drive revenue growth.",
    "Customer Success Management": "Ensures clients achieve their desired outcomes, driving retention.",
    "Product Management": "Guides the lifecycle of a product from conception through launch and iteration.",
    "Product Strategy": "Defines the long-term vision, market positioning, and roadmap for products.",
    "UX / UI Strategy": "Focuses on user experience research, design systems, and functionality.",
    "Data Product Management": "Builds products heavily reliant on data pipelines, analytics, and algorithms.",
    "AI Product Management": "Specializes in developing artificial intelligence and machine learning products.",
    "Tech Business Analyst": "Bridges the gap between IT and business using data analytics.",
    "Agile / Scrum Master": "Facilitates agile teams and removes blockers to delivery.",
    "Innovation Management": "Scouts emerging technologies and drives internal innovation programs.",
    "Talent Acquisition": "Strategically identifies, attracts, and hires top talent for the organization.",
    "HR Business Partner": "Aligns HR strategy with business goals and supports leadership teams.",
    "Learning & Development": "Focuses on employee growth, training programs, and upskilling.",
    "Organizational Development": "Improves organizational structure, culture, and change management.",
    "Employer Branding": "Builds reputation as an attractive employer to attract top talent.",
    "Compensation & Benefits": "Designs salary structures, bonus systems, and benefit packages.",
    "Founder": "Creates and builds new businesses from the ground up.",
    "Early-stage Startup Generalist": "Wears multiple hats in young startups, driving early traction.",
    "Business Development (Startup)": "Builds partnerships, tests market channels, and drives revenue.",
    "Venture Builder": "Systematically builds and launches multiple startups inside a studio.",
    "Corporate Development": "Drives inorganic growth via acquisitions, partnerships, and investments.",
    "Supply Chain Management": "Plans, optimizes, and manages end-to-end flow of goods and finances.",
    "Change Management": "Leads organizational transformation and change initiatives.",
    "Impact Investing": "Invests in companies with measurable social or environmental impact."
};

// --- Detail-Daten (Modal) ---
const details = {
    "Strategy Consulting": { 
        pos: "Junior Consultant, Business Analyst, Associate", 
        skills: "Structured problem-solving, PowerPoint, Excel, Client communication", 
        salary: "€55k–€75k" 
    },
    "Investment Banking": { 
        pos: "Analyst, Associate", 
        skills: "Financial modeling, DCF/LBO valuation, Excel, Pitch decks", 
        salary: "€65k–€90k + bonus" 
    },
    "Private Equity": { 
        pos: "Analyst, Associate (usually post-IB)", 
        skills: "LBO modeling, Due diligence, Industry analysis", 
        salary: "€70k–€100k + carry" 
    },
    "Product Management": { 
        pos: "Associate PM, Junior PM, Product Analyst", 
        skills: "User research, Roadmapping, Stakeholder management, SQL", 
        salary: "€48k–€65k" 
    },
    "Founder": { 
        pos: "CEO, Co-Founder", 
        skills: "Vision, Resilience, Fundraising, Sales, Product sense", 
        salary: "€0–unlimited" 
    },
    "Venture Capital": { 
        pos: "Analyst, Associate, Scout", 
        skills: "Deal sourcing, Due diligence, Networking", 
        salary: "€55k–€80k" 
    },
    "HR Business Partner": { 
        pos: "Junior HRBP, HR Generalist, People Partner", 
        skills: "Employee relations, Org design, Coaching", 
        salary: "€45k–€60k" 
    },
    "FP&A": { 
        pos: "FP&A Analyst, Planning Associate", 
        skills: "Financial modeling, Excel, Forecasting, SQL", 
        salary: "€48k–€65k" 
    }
};

// --- Profile-Typen ---
const profiles = {
    A: { 
        emoji: "🧠", 
        type: "The Strategist", 
        desc: "You are a strategic thinker who thrives on solving complex, high-level problems. You see the big picture, connect the dots, and love advising on critical decisions. Frameworks and structured analysis are your natural tools." 
    },
    B: { 
        emoji: "📈", 
        type: "The Analyst", 
        desc: "You are a numbers person at heart. Financial models, data analysis, and quantitative reasoning give you clarity. You thrive where precision matters and decisions are backed by hard evidence." 
    },
    C: { 
        emoji: "🎨", 
        type: "The Creative", 
        desc: "You are a creative strategist who turns ideas into impactful campaigns and experiences. You thrive where experimentation is valued, conventional thinking is challenged, and originality wins." 
    },
    D: { 
        emoji: "🤝", 
        type: "The People Person", 
        desc: "You are a natural connector and leader. You understand what motivates people and build your career around developing others, shaping culture, and creating environments where everyone flourishes." 
    },
    E: { 
        emoji: "🔨", 
        type: "The Builder", 
        desc: "You are a maker at heart. Whether it's a product, a startup, or a new feature — you want to create something tangible. Iteration, ownership, and seeing your ideas come to life drives you." 
    }
};

// Funktionen für Quiz-Service

/**
 * getQuestions: Gibt alle 20 Fragen zurück
 */
function getQuestions() {
    return questions;
}

/**
 * getCareers: Gibt alle 50 Karrierebeschreibungen zurück
 */
function getCareers() {
    return careers;
}

/**
 * getDetails: Gibt Detail-Informationen für eine Karriere
 */
function getDetails(careerName) {
    return details[careerName] || null;
}

/**
 * getProfiles: Gibt alle Profile-Typen zurück
 */
function getProfiles() {
    return profiles;
}

/**
 * saveResult: Speichert ein Quiz-Ergebnis für einen User
 */
async function saveResult(userId, resultData) {
    try {
        const results = await dataService.readQuizResults();
        
        // Alten Eintrag des Users löschen wenn vorhanden
        const filteredResults = results.filter(r => r.userId !== userId);
        
        // Neuen Eintrag hinzufügen
        const newResult = {
            userId: userId,
            scores: resultData.scores,
            topCareers: resultData.topCareers || [],
            profile: resultData.profile || {},
            timestamp: new Date().toISOString()
        };
        
        filteredResults.push(newResult);
        
        // Speichern
        await dataService.writeQuizResults(filteredResults);
        
        return newResult;
    } catch (error) {
        console.log('Fehler beim Speichern des Quiz-Ergebnisses:', error.message);
        return null;
    }
}

/**
 * getResult: Lädt das letzte Quiz-Ergebnis eines Users
 */
async function getResult(userId) {
    try {
        const results = await dataService.readQuizResults();
        
        // Neuestes Ergebnis für den User suchen
        let latestResult = null;
        for (let i = 0; i < results.length; i++) {
            if (results[i].userId === userId) {
                latestResult = results[i];
                break;
            }
        }
        
        return latestResult;
    } catch (error) {
        console.log('Fehler beim Laden des Quiz-Ergebnisses:', error.message);
        return null;
    }
}

// --- Module exportieren ---
module.exports = {
    getQuestions,
    getCareers,
    getDetails,
    getProfiles,
    saveResult,
    getResult
};
