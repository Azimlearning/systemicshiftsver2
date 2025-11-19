/**
 * Knowledge Base Content Extractor
 * 
 * Extracts structured content from website components and stores in Firestore
 * This script can be run manually or as a Cloud Function to populate the knowledge base
 */

const admin = require('firebase-admin');

// Lazy getter for Firestore (initialized in index.js)
function getDb() {
  return admin.firestore();
}

/**
 * Knowledge Base Content Structure
 * Organized by category for easy retrieval
 */
const knowledgeBaseContent = {
  'systemic-shifts': [
    {
      title: 'Systemic Shifts Overview',
      content: `In adapting to the ever-evolving business landscape, we need to reshape how we operate as an Upstream business. Our strategy is anchored on being a Pure Commercial Play, driven by two key shifts:
1. Accelerate Portfolio High-Grading
2. Deliver Advantaged Barrels

The goal is to achieve PETRONAS 2.0 by 2035.`,
      source: 'website',
      sourceUrl: '/systemic-shifts/key-shifts',
      tags: ['systemic-shifts', 'strategy', 'portfolio', 'advantaged-barrels', 'commercial-play'],
    },
    {
      title: 'Accelerate Portfolio High-Grading',
      content: `Accelerate Portfolio High-Grading means actively reshaping our portfolio to focus on the assets that create the most value, with the discipline to divest or withdraw from those that are not value-accretive.

Portfolio Components:
- PCSB (Malaysia): Reposition, dilution and divestment of assets to focus on High-Value, High-Upside
- Vestigo (Malaysia & International): Expand and value-grow marginal assets portfolio in Malaysia and International
- PCIV (International): Disciplined asset dilution and portfolio high-grading
- CCS: Create value through diversified portfolio
- Satellite Model: Unlock opportunities through unique partnership model`,
      source: 'website',
      sourceUrl: '/systemic-shifts/key-shifts',
      tags: ['portfolio-high-grading', 'pcsb', 'vestigo', 'pciv', 'ccs', 'satellite-model'],
    },
    {
      title: 'Deliver Advantaged Barrels',
      content: `Deliver Advantaged Barrels means improving our internal efficiencies by focusing on safe, low cost, low carbon and high-margin barrels, through:

1. More Risk Tolerant:
   - Deploy fit-for-purpose/international technical standards
   - Adopt innovative and market-friendly contracting approach

2. Improve Cost & Operational Efficiency:
   - Deploy practical and innovative solutions at pace
   - Scale-up technology deployment
   - Embrace AI-enabled business operations

3. Pursue Partnership for Growth and Innovative Solutions:
   - Leverage on selective partners to tap innovative solutions`,
      source: 'website',
      sourceUrl: '/systemic-shifts/key-shifts',
      tags: ['advantaged-barrels', 'risk-tolerant', 'efficiency', 'partnership', 'ai-enabled'],
    },
    {
      title: '10 Key Shifts - Exploration Phase',
      content: `Shift 1: Scale-up clustered Exploration approach to improve chance of success above International benchmark >35%

Shift 2: Accelerate discovery to pre-development (PGR 1) from 36 months to 18 months`,
      source: 'website',
      sourceUrl: '/systemic-shifts/key-shifts',
      tags: ['10-shifts', 'exploration', 'discovery', 'pre-development'],
    },
    {
      title: '10 Key Shifts - Development Phase',
      content: `Shift 3: Monetisation with pace from last appraisal to 1st HC from 35-100 months to 24-48 months

Shift 4: Portfolio-based versus Project-based approach on key resources e.g. FPSO, Refurbished Wellhead platform, Subsea system`,
      source: 'website',
      sourceUrl: '/systemic-shifts/key-shifts',
      tags: ['10-shifts', 'development', 'monetisation', 'portfolio-based'],
    },
    {
      title: '10 Key Shifts - Production Phase',
      content: `Shift 5: Adopting unconventional approach to reduce CAPEX up to 30% including overhauling contracting strategy

Shift 6: Improve volume certainty and attainability from 70% to 90% through AI-driven technology application e.g. Seismic AI, ERMAI, Ensemble

Shift 7: Design It Right: Fit-for-purpose project design with efficient operation, competitive CAPEX and low carbon

Shift 8: Operate It Right: Maximise production to support UPC < USD6/Boe & CI 17 kgCO2e/boe (portfolio level)

Shift 9: Deliver Technology and AI solutions through partnership to build competitive edge e.g. TriCipta AI, ERMAI`,
      source: 'website',
      sourceUrl: '/systemic-shifts/key-shifts',
      tags: ['10-shifts', 'production', 'capex', 'ai', 'operate-right', 'design-right', 'technology'],
    },
    {
      title: '10 Key Shifts - CCS Business',
      content: `Shift 10: Value-driven diversified CCS Portfolio in Malaysia and International`,
      source: 'website',
      sourceUrl: '/systemic-shifts/key-shifts',
      tags: ['10-shifts', 'ccs', 'carbon-capture', 'diversified-portfolio'],
    },
  ],
  'mindset-behaviour': [
    {
      title: 'Mindset & Behaviour Shifts Overview',
      content: `For Upstream to become Fitter, Focused and Sharper, we require a Mindset & Behaviour Shifts.

The three desired mindsets are:
1. More Risk Tolerant
2. Commercial Savvy
3. Growth Mindset`,
      source: 'website',
      sourceUrl: '/systemic-shifts/mindset-behaviour',
      tags: ['mindset', 'behaviour', 'risk-tolerant', 'commercial-savvy', 'growth-mindset'],
    },
    {
      title: 'More Risk Tolerant Mindset',
      content: `Philosophy: Sees CHANGE as strength in building culture of innovation, agility, and growth by adapting quickly to challenges. Stretch ourselves beyond comfort zones, and see failures as steps toward progress.

Application Examples:
- The organisation continues to promote innovation and accept failure as lesson learnt. Openly admitting the gaps and working on resolution instead of finding fault.

Our Roles:
- Leaders Role Model a Learning Attitude: Openly reflect on mistakes, share learning journeys, and show humility in not knowing everything while reframe setbacks as growth opportunities.
- Continue to Give Actionable Feedback: Offer constructive input focused on growth, not just evaluation and seek feedback without defensiveness; view it as a tool for self-growth.
- Challenge Comfort Zones: Push teams to take on new challenges and grow beyond the familiar and willingly take on unfamiliar tasks or roles to develop new capabilities as initiative to learn new skills.`,
      source: 'website',
      sourceUrl: '/systemic-shifts/mindset-behaviour',
      tags: ['risk-tolerant', 'innovation', 'learning', 'feedback', 'comfort-zones'],
    },
    {
      title: 'Commercial Savvy Mindset',
      content: `Philosophy: Value-driven decisions by focusing on where to play and how to win. Aligns strategy, operations, and innovation to market needs and business impact. Thinks like owners by balancing impact with resources and linking daily actions to long-term success.

Application Examples:
- Leaders prioritise long term value in every decision made, whether it be in Upstream Portfolio Management or independent projects.
- To prioritise decision making which protects the value of the company over personal sentiments.

Our Roles:
- Leaders to Set a Clear Value-Driven Strategy: Define and communicate where the business wins and how value is created. Focus resources on what drives growth or efficiency and stop low-value work.
- Make Smart Trade-Offs and Opportunity Oriented: Prioritise work that has the highest impact, find efficiencies, eliminate waste, suggest ways to grow and avoid perfectionism in low-value areas.
- Act Like an Owner: Develop business acumen in team, coach and mentor team to understand value chain and think beyond their function.`,
      source: 'website',
      sourceUrl: '/systemic-shifts/mindset-behaviour',
      tags: ['commercial-savvy', 'value-driven', 'strategy', 'trade-offs', 'owner-mindset'],
    },
    {
      title: 'Growth Mindset',
      content: `Philosophy: Embrace growth by enabling bold yet thoughtful decisions, encouraging innovation and impactful improvement. Empowered to take initiative within a safe environment, with leaders promoting experimentation, rewarding boldness, and viewing failure as progress.

Application Examples:
- Business linking choice to Long-Term value be it in Upstream Portfolio Management or any independent projects.
- Leaders to celebrate any new ideas from the juniors without having bias and scepticism.

Our Roles:
- Leaders to Role Model a Risk-Taking Attitude: Leaders to demonstrate bold and transparent decisions by showing how calculated risks are evaluated/taken.
- Encourage Speak Up with Ideas: Encourage openness, accept honest mistakes, and protect those who take initiative by recognising both success and effort in experimentation and celebrate smart failures.
- Support Peers in Trying: Encourage teammates to take initiative, and create a safe space for experimentation.`,
      source: 'website',
      sourceUrl: '/systemic-shifts/mindset-behaviour',
      tags: ['growth-mindset', 'bold-decisions', 'innovation', 'experimentation', 'risk-taking'],
    },
  ],
  'upstream-target': [
    {
      title: 'Upstream Target - Increase NPV by 30%',
      content: `The Upstream Target is to Increase NPV by 30% by 2035. This is achieved through 6 strategic objectives:

1. Carbon intensity at 17kgCO2/boe (at portfolio level)
2. UPC at <$6/boe (at portfolio level)
3. Lean workforce and AI-enabled operations
4. Robust Project Delivery with Positive NPV@WACC at Low KPBI Prices
5. Asset Breakeven Price < $50/Barrel
6. 60% Value Contribution from International`,
      source: 'website',
      sourceUrl: '/systemic-shifts/upstream-target',
      tags: ['upstream-target', 'npv', '30-percent', 'carbon-intensity', 'upc', 'ai-enabled', 'breakeven'],
    },
    {
      title: 'Upstream Value Trajectory',
      content: `Desired Upstream Value Trajectory shows +30% NPV growth from 2025 to 2035:

2025 Baseline: 75 RM Bil (PCSB: 25, PCIV: 45, Vestigo: 5)
2030 Post Portfolio High-Grading: 70 RM Bil (PCSB: 30, PCIV: 20, Vestigo: 8, Satellite: 12)
2035 Target: 110 RM Bil (PCSB: 35, PCIV: 30, Vestigo: 10, Satellite: 15, CCS: 20)

The trajectory shows portfolio evolution with increased focus on high-value assets and diversification into CCS.`,
      source: 'website',
      sourceUrl: '/systemic-shifts/upstream-target',
      tags: ['value-trajectory', 'npv', '2025', '2030', '2035', 'portfolio-evolution'],
    },
    {
      title: 'Upstream Entities by 2035',
      content: `Upstream Entities Look & Feel by 2035:

- PCSB: Focus on High Value, High Upside assets in Malaysia
- PCIV: Grow International value via disciplined portfolio high-grading
- PCCSV: Value driven through diversified CCS portfolio in Malaysia and International
- Vestigo: Value-grow marginal assets in Malaysia and International
- Satellite Model: Partnership to unlock opportunities`,
      source: 'website',
      sourceUrl: '/systemic-shifts/upstream-target',
      tags: ['upstream-entities', 'pcsb', 'pciv', 'pccsv', 'vestigo', 'satellite-model', '2035'],
    },
  ],
  'petronas-info': [
    {
      title: 'PETRONAS 2.0 Vision',
      content: `PETRONAS is transforming into an integrated energy company by 2035, focusing on:
- Competitive upstream operations
- Reliable LNG supply
- Sustainable energy solutions

The vision is to provide safe, reliable, and sustainable energy solutions that meet the world's evolving needs.`,
      source: 'website',
      sourceUrl: '/petronas-2.0',
      tags: ['petronas-2.0', 'vision', '2035', 'integrated-energy', 'lng', 'sustainable'],
    },
  ],
  'general': [
    {
      title: 'Systemic Shifts Definition',
      content: `Systemic Shifts are strategic changes in mindset, behavior, and operations to achieve PETRONAS 2.0 vision. Key areas include:
- Operational Excellence (Systemic Shift #8: Operate it Right)
- Digital Transformation
- Sustainability and Decarbonisation
- Innovation and Technology
- People and Culture
- Safety and Risk Management`,
      source: 'manual',
      sourceUrl: '/systemic-shifts',
      tags: ['systemic-shifts', 'definition', 'strategy', 'operational-excellence', 'digital-transformation'],
    },
  ],
};

/**
 * Upload knowledge base content to Firestore
 */
async function uploadKnowledgeBase() {
  console.log('[Knowledge Base] Starting upload...');
  
  const db = getDb();
  const batch = db.batch();
  let count = 0;

  for (const [category, documents] of Object.entries(knowledgeBaseContent)) {
    for (const doc of documents) {
      const docRef = db.collection('knowledgeBase').doc();
      
      const knowledgeDoc = {
        title: doc.title,
        content: doc.content,
        source: doc.source,
        sourceUrl: doc.sourceUrl,
        category: category,
        tags: doc.tags,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(docRef, knowledgeDoc);
      count++;
    }
  }

  await batch.commit();
  console.log(`[Knowledge Base] Successfully uploaded ${count} documents`);
  return count;
}

/**
 * Cloud Function to populate knowledge base
 */
function createPopulateKnowledgeBaseHandler() {
  return async (req, res) => {
    const cors = require('cors')({ origin: true });
    
    cors(req, res, async () => {
      if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).send({ error: 'Method Not Allowed' });
      }

      try {
        const count = await uploadKnowledgeBase();
        res.status(200).send({
          success: true,
          message: `Successfully populated knowledge base with ${count} documents`,
          count: count,
        });
      } catch (error) {
        console.error('[Knowledge Base] Error:', error);
        res.status(500).send({
          success: false,
          error: error.message,
        });
      }
    });
  };
}

// If running as a script
if (require.main === module) {
  uploadKnowledgeBase()
    .then((count) => {
      console.log(`✅ Upload complete: ${count} documents`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Upload failed:', error);
      process.exit(1);
    });
}

module.exports = { 
  uploadKnowledgeBase, 
  knowledgeBaseContent,
  populateKnowledgeBase: createPopulateKnowledgeBaseHandler()
};

