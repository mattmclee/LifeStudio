// Suggestion engine - generates contextual recommendations per goal type

const SUGGESTION_DATABASE = {
    study: [
        {
            id: 'pomodoro',
            title: 'Use the Pomodoro Technique',
            description: 'Study in focused 25-minute blocks with 5-minute breaks. After 4 cycles, take a longer 15-30 minute break. This maximizes retention and prevents burnout.',
            type: 'Technique',
            impact: 'High',
            timeAdded: 0,
            autoSchedule: false,
        },
        {
            id: 'practice-tests',
            title: 'Add Practice Tests Every 3 Days',
            description: 'Regular self-testing is one of the most effective study methods. Schedule practice exams to identify weak areas and reinforce learning.',
            type: 'Strategy',
            impact: 'High',
            timeAdded: 2,
            autoSchedule: true,
        },
        {
            id: 'spaced-rep',
            title: 'Use Spaced Repetition',
            description: 'Review material at increasing intervals (1 day, 3 days, 7 days, 14 days). Use flashcard apps like Anki to automate this process.',
            type: 'Technique',
            impact: 'High',
            timeAdded: 1,
            autoSchedule: false,
        },
        {
            id: 'study-group',
            title: 'Form a Study Group',
            description: 'Teaching others solidifies your understanding. Schedule weekly group study sessions to discuss difficult concepts.',
            type: 'Social',
            impact: 'Medium',
            timeAdded: 3,
            autoSchedule: true,
        },
        {
            id: 'active-recall',
            title: 'Practice Active Recall',
            description: 'Instead of re-reading notes, close the book and try to recall concepts from memory. This strengthens neural pathways significantly.',
            type: 'Technique',
            impact: 'High',
            timeAdded: 0,
            autoSchedule: false,
        },
        {
            id: 'morning-study',
            title: 'Study During Peak Hours',
            description: 'Schedule your most challenging topics during your peak alertness hours (usually morning). Save lighter review for evenings.',
            type: 'Optimization',
            impact: 'Medium',
            timeAdded: 0,
            autoSchedule: false,
        },
    ],
    health: [
        {
            id: 'progressive-overload',
            title: 'Progressive Overload: +5% Weekly',
            description: 'Increase weights by approximately 5% each week to continuously challenge your muscles and promote growth. Track all lifts in a log.',
            type: 'Strategy',
            impact: 'High',
            timeAdded: 0,
            autoSchedule: false,
        },
        {
            id: 'mobility-work',
            title: 'Add 10-Min Mobility Work',
            description: 'Start each workout with dynamic stretching and mobility drills. This reduces injury risk and improves range of motion.',
            type: 'Technique',
            impact: 'Medium',
            timeAdded: 1.5,
            autoSchedule: true,
        },
        {
            id: 'protein-intake',
            title: 'Track Protein Intake',
            description: 'Aim for 1.6-2.2g of protein per kg of body weight daily. Schedule weekly meal prep sessions to hit your targets consistently.',
            type: 'Nutrition',
            impact: 'High',
            timeAdded: 2,
            autoSchedule: true,
        },
        {
            id: 'sleep-schedule',
            title: 'Optimize Sleep Schedule',
            description: 'Target 7-9 hours of quality sleep. Set a consistent bedtime and wake time, even on weekends. Sleep is when muscles actually grow.',
            type: 'Recovery',
            impact: 'High',
            timeAdded: 0,
            autoSchedule: false,
        },
        {
            id: 'deload-weeks',
            title: 'Schedule Deload Weeks',
            description: 'Every 4th week, reduce training volume by 40-50%. This allows recovery and prevents overtraining while maintaining consistency.',
            type: 'Strategy',
            impact: 'Medium',
            timeAdded: 0,
            autoSchedule: false,
        },
        {
            id: 'cardio-balance',
            title: 'Add 2x Weekly Cardio',
            description: 'Include two moderate-intensity cardio sessions (20-30 min) to improve cardiovascular health without impeding muscle gains.',
            type: 'Balance',
            impact: 'Medium',
            timeAdded: 1,
            autoSchedule: true,
        },
    ],
    finance: [
        {
            id: 'budget-rule',
            title: '50/30/20 Budgeting Rule',
            description: 'Allocate 50% of income to needs, 30% to wants, and 20% to savings/debt repayment. Track monthly to stay on course.',
            type: 'Framework',
            impact: 'High',
            timeAdded: 0.5,
            autoSchedule: false,
        },
        {
            id: 'emergency-first',
            title: 'Build Emergency Fund First',
            description: 'Before investing aggressively, ensure you have 3-6 months of expenses in a high-yield savings account for unexpected situations.',
            type: 'Priority',
            impact: 'High',
            timeAdded: 0,
            autoSchedule: false,
        },
        {
            id: 'auto-invest',
            title: 'Automate Investments',
            description: 'Set up automatic monthly transfers to your investment accounts right after payday. This removes emotion and ensures consistency.',
            type: 'Strategy',
            impact: 'High',
            timeAdded: 0.5,
            autoSchedule: false,
        },
        {
            id: 'expense-audit',
            title: 'Monthly Expense Audit',
            description: 'Schedule a 30-minute monthly review of all subscriptions and discretionary spending. Cancel what you dont use.',
            type: 'Review',
            impact: 'Medium',
            timeAdded: 0.5,
            autoSchedule: true,
        },
        {
            id: 'tax-planning',
            title: 'Quarterly Tax Planning',
            description: 'Review tax-advantaged accounts and deductions every quarter. Ensure youre maximizing CPF, SRS, or equivalent tax-saving instruments.',
            type: 'Optimization',
            impact: 'High',
            timeAdded: 1,
            autoSchedule: true,
        },
        {
            id: 'net-worth',
            title: 'Track Net Worth Monthly',
            description: 'Calculate your net worth (assets minus liabilities) at the end of each month. Seeing the trend line is incredibly motivating.',
            type: 'Tracking',
            impact: 'Medium',
            timeAdded: 0.25,
            autoSchedule: true,
        },
    ],
    career: [
        {
            id: 'networking',
            title: 'Weekly Networking Goal',
            description: 'Connect with one new professional contact per week. Attend industry events, engage on LinkedIn, or schedule coffee chats.',
            type: 'Strategy',
            impact: 'High',
            timeAdded: 2,
            autoSchedule: true,
        },
        {
            id: 'skill-project',
            title: 'Build a Portfolio Project',
            description: 'Apply your learning by building a real project. This demonstrates competence far more effectively than certificates alone.',
            type: 'Practice',
            impact: 'High',
            timeAdded: 5,
            autoSchedule: true,
        },
        {
            id: 'mentor',
            title: 'Find a Mentor',
            description: 'Identify and reach out to someone who has achieved what you aim for. Schedule regular check-ins to accelerate your growth.',
            type: 'Social',
            impact: 'High',
            timeAdded: 1,
            autoSchedule: true,
        },
        {
            id: 'daily-journal',
            title: 'Daily Learning Journal',
            description: 'Spend 10 minutes at the end of each day writing down key learnings, questions, and insights. This deepens retention.',
            type: 'Technique',
            impact: 'Medium',
            timeAdded: 1.5,
            autoSchedule: false,
        },
        {
            id: 'public-sharing',
            title: 'Share Knowledge Publicly',
            description: 'Write blog posts, create content, or give talks about what youre learning. Teaching is the best way to solidify understanding.',
            type: 'Growth',
            impact: 'Medium',
            timeAdded: 3,
            autoSchedule: true,
        },
    ],
};

// Simulated search results for research panel
export const RESEARCH_DATABASE = {
    'exam preparation': [
        {
            id: 'r1',
            title: 'Evidence-Based Study Techniques That Actually Work',
            snippet: 'A comprehensive review of scientifically proven study methods including spaced repetition, active recall, interleaving, and the testing effect...',
            source: 'Educational Psychology Review',
            url: '#',
            content: 'Research consistently shows that active recall and spaced repetition are the most effective study techniques. Unlike passive re-reading, actively testing yourself on material strengthens memory traces and identifies gaps in knowledge. The spacing effect shows that distributing study sessions over time leads to better long-term retention than cramming.',
        },
        {
            id: 'r2',
            title: 'How to Create an Effective Exam Study Schedule',
            snippet: 'Step-by-step guide to planning your study timeline, from identifying key topics to scheduling review sessions...',
            source: 'Academic Success Center',
            url: '#',
            content: 'Start by listing all topics and estimating time needed for each. Work backwards from exam date. Allocate more time to difficult subjects. Include practice tests every 3-4 days. Build in buffer days for unexpected challenges. The key is consistency over intensity.',
        },
        {
            id: 'r3',
            title: 'The Science of Memory and Learning',
            snippet: 'Understanding how memory works can dramatically improve your study efficiency. Learn about encoding, consolidation, and retrieval...',
            source: 'Cognitive Science Journal',
            url: '#',
            content: 'Memory formation occurs in three stages: encoding (initial learning), consolidation (strengthening during sleep), and retrieval (recalling information). Sleep is crucial - aim for 7-9 hours during exam periods. Exercise before studying can boost memory formation by up to 20%.',
        },
    ],
    'muscle building': [
        {
            id: 'r4',
            title: 'Complete Guide to Hypertrophy Training',
            snippet: 'Learn the science behind muscle growth: progressive overload, volume, intensity, and recovery principles...',
            source: 'Sports Medicine Research',
            url: '#',
            content: 'Hypertrophy requires progressive overload (gradually increasing training stimulus), adequate volume (10-20 sets per muscle group per week), proper nutrition (caloric surplus with high protein), and recovery (7-9 hours sleep, rest days). Focus on compound movements first, then isolation exercises.',
        },
        {
            id: 'r5',
            title: 'Optimal Nutrition for Muscle Growth',
            snippet: 'Protein timing, caloric surplus, and macronutrient ratios for maximizing muscle protein synthesis...',
            source: 'Journal of Nutrition',
            url: '#',
            content: 'Consume 1.6-2.2g protein per kg body weight daily, spread across 4-5 meals. Maintain a caloric surplus of 300-500 calories. Distribute protein evenly throughout the day. Post-workout nutrition window is less critical than total daily intake.',
        },
    ],
    'financial planning': [
        {
            id: 'r6',
            title: 'Personal Finance Fundamentals for Every Life Stage',
            snippet: 'From budgeting basics to retirement planning - a comprehensive guide to managing your money wisely...',
            source: 'Financial Planning Association',
            url: '#',
            content: 'Build an emergency fund (3-6 months expenses), eliminate high-interest debt, maximize employer retirement matching, invest in low-cost index funds, review insurance coverage annually. The power of compound interest means starting early is more important than starting big.',
        },
        {
            id: 'r7',
            title: 'Investment Strategies for Long-Term Wealth Building',
            snippet: 'Dollar-cost averaging, diversification, and tax-efficient investing strategies for building wealth over time...',
            source: 'Investment Research Institute',
            url: '#',
            content: 'Dollar-cost averaging reduces timing risk by investing fixed amounts regularly. Diversify across asset classes (stocks, bonds, real estate). Use tax-advantaged accounts first. Keep investment costs low with index funds. Rebalance annually to maintain target allocation.',
        },
    ],
    'career development': [
        {
            id: 'r8',
            title: 'Skill Development Framework for Career Advancement',
            snippet: 'How to identify, prioritize, and develop skills that will accelerate your career growth...',
            source: 'Harvard Business Review',
            url: '#',
            content: 'Use the T-shaped skill model: deep expertise in one area with broad knowledge across related fields. Focus on skills with high demand and low supply. Combine technical skills with soft skills like communication and leadership. Set 90-day skill sprints with measurable outcomes.',
        },
    ],
    'learning programming': [
        {
            id: 'r9',
            title: 'The Most Effective Way to Learn Programming',
            snippet: 'Project-based learning, deliberate practice, and building a portfolio for career success...',
            source: 'Computer Science Education',
            url: '#',
            content: 'Start with one language and master fundamentals before branching out. Build real projects from week one. Use the 20/80 rule: learn 20% of concepts that cover 80% of use cases. Read other peoples code. Contribute to open source. Practice algorithm challenges weekly.',
        },
    ],
};

/**
 * Get suggestions for a specific goal category
 */
export function getSuggestions(category) {
    return SUGGESTION_DATABASE[category] || [];
}

/**
 * Search the research database
 */
export function searchResearch(query) {
    const lower = query.toLowerCase();
    const results = [];
    for (const [topic, articles] of Object.entries(RESEARCH_DATABASE)) {
        if (topic.includes(lower) || lower.split(' ').some(w => topic.includes(w))) {
            results.push(...articles);
        }
    }
    // If no exact match, return some default results
    if (results.length === 0) {
        const allArticles = Object.values(RESEARCH_DATABASE).flat();
        return allArticles.slice(0, 3);
    }
    return results;
}
