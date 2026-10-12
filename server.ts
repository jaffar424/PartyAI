import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe JSON generation
async function generatePartyPlan(partyDetails: any) {
  const prompt = `You are the official CymbalMart Party Planner and Procurement Shopping Agent.
Your mission is to help busy hosts define their event, review an aligned grocery/supplies list, and refine/checkout at CymbalMart.
Parameters:
Party Type: ${partyDetails.partyType || 'Party'}
Party Theme / Occasion: ${partyDetails.theme || 'Celebration'}
Adult Guests: ${partyDetails.adults || 12}
Kid Guests: ${partyDetails.kids || 0}
Duration: ${partyDetails.durationHours || 3} hours
Meal / Food Style: ${partyDetails.foodStyle || 'Casual Grazing & Appetizers'}
Beverage & Drink Style: ${partyDetails.drinkStyle || 'Full Bar & Cocktails'}
Target Budget: $${partyDetails.targetBudget || 250}
Dietary Restrictions & Preferences: ${(partyDetails.dietary || []).join(', ') || 'None specified'}
Venue: ${partyDetails.venue || 'Indoor / Backyard'}
Host Notes & Requests: ${partyDetails.notes || 'None'}

Generate a meticulous, realistic shopping list with estimated prices at CymbalMart, assigned store aisles (e.g. "Aisle 1 - Fresh Produce & Bakery", "Aisle 3 - Butcher & Seafood", "Aisle 5 - Party Supplies & Paper Goods", "Aisle 7 - Snacks & Pantry Staples", "Aisle 9 - Beverages & Chilled Ice"), exact quantities calculated with safety margins, clear reasoning, portion math calculations, and prep milestones.

Make sure every item has:
- unique id (string)
- name (string)
- category: one of ["food", "drinks", "tableware", "decor", "activities", "essentials"]
- quantity (e.g., "4 packs (24 count)", "3 lbs", "4 bags")
- estimatedCost (number, in USD, realistic)
- store: one of ["Aisle 1 - Fresh Produce & Bakery", "Aisle 3 - Butcher & Seafood", "Aisle 5 - Party Supplies & Paper Goods", "Aisle 7 - Snacks & Pantry Staples", "Aisle 9 - Beverages & Chilled Ice"]
- dietaryTags (array of strings, e.g. ["vegan", "gluten-free", "kid-friendly", "alcohol-free", "nut-free"])
- reason: brief note on why this was chosen and how quantity was estimated
- priority: "essential" | "recommended" | "optional_splurge"

Also provide:
- calculatedPortions: specific portion calculations for Ice, Beverages/Drinks, Main proteins/carbs, Tableware buffers
- budgetAdvice: 2-3 specific strategies to save money or elevate the event within budget at CymbalMart
- prepTimeline: array of { timeframe: string, tasks: string[] } for shopping & prep`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are the CymbalMart Party Planner Shopping Agent. Return valid structured JSON adhering strictly to the schema.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tagline: { type: Type.STRING },
          themeDescription: { type: Type.STRING },
          totalEstimatedCost: { type: Type.NUMBER },
          budgetStatus: { type: Type.STRING, description: '"under_budget" or "near_budget" or "over_budget"' },
          calculatedPortions: {
            type: Type.OBJECT,
            properties: {
              iceLbs: { type: Type.NUMBER },
              iceNote: { type: Type.STRING },
              drinkCountTotal: { type: Type.NUMBER },
              drinksBreakdown: { type: Type.STRING },
              appetizerPiecesPerPerson: { type: Type.NUMBER },
              tablewareBufferPct: { type: Type.NUMBER },
            },
            required: ['iceLbs', 'iceNote', 'drinkCountTotal', 'drinksBreakdown', 'appetizerPiecesPerPerson', 'tablewareBufferPct'],
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                category: { type: Type.STRING },
                quantity: { type: Type.STRING },
                estimatedCost: { type: Type.NUMBER },
                store: { type: Type.STRING },
                dietaryTags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                reason: { type: Type.STRING },
                priority: { type: Type.STRING },
              },
              required: ['id', 'name', 'category', 'quantity', 'estimatedCost', 'store', 'dietaryTags', 'reason', 'priority'],
            },
          },
          budgetAdvice: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          prepTimeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timeframe: { type: Type.STRING },
                tasks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['timeframe', 'tasks'],
            },
          },
          signatureTip: { type: Type.STRING },
        },
        required: [
          'title',
          'tagline',
          'themeDescription',
          'totalEstimatedCost',
          'budgetStatus',
          'calculatedPortions',
          'items',
          'budgetAdvice',
          'prepTimeline',
          'signatureTip',
        ],
      },
    },
  });

  const rawText = response.text || '{}';
  return JSON.parse(rawText);
}

// Algorithmic Fallback Planner (calibrated procurement formulas)
function generateFallbackPlan(details: any) {
  const adults = Number(details.adults) || 12;
  const kids = Number(details.kids) || 0;
  const totalGuests = adults + kids;
  const hours = Number(details.durationHours) || 3;
  const budget = Number(details.targetBudget) || 250;
  const theme = details.theme || 'Celebration';
  const foodStyle = details.foodStyle || 'Casual Grazing';
  const drinkStyle = details.drinkStyle || 'Full Bar';

  const iceLbs = Math.round(totalGuests * 1.5 + 10);
  const drinkCountTotal = Math.round(adults * (2 + Math.max(0, hours - 1) * 1) + kids * hours * 1.2);

  const items: any[] = [];
  let idCounter = 1;

  // Main food based on theme
  if (theme.toLowerCase().includes('taco') || theme.toLowerCase().includes('mexican')) {
    items.push({
      id: `item-${idCounter++}`,
      name: 'Cymbal Select Pork Carnitas / Marinated Chicken',
      category: 'food',
      quantity: `${Math.ceil(totalGuests * 0.4)} lbs`,
      estimatedCost: Math.round(totalGuests * 1.6),
      cymbalRollbackSavings: 4.0,
      store: 'Aisle 3 - Butcher & Seafood',
      dietaryTags: ['gluten-free'],
      reason: 'Calculated 1/3 lb meat per guest + 20% second-serving buffer',
      priority: 'essential',
      isPurchased: false,
    });
    items.push({
      id: `item-${idCounter++}`,
      name: 'Corn Street Taco Tortillas (100 pack)',
      category: 'food',
      quantity: '1 bulk pack',
      estimatedCost: 7,
      store: 'Aisle 1 - Fresh Produce & Bakery',
      dietaryTags: ['gluten-free', 'vegan'],
      reason: 'Allows 3-4 street tacos per guest',
      priority: 'essential',
      isPurchased: false,
    });
    items.push({
      id: `item-${idCounter++}`,
      name: 'Fresh Avocados & Limes Bulk Bag',
      category: 'food',
      quantity: `${Math.ceil(totalGuests * 0.6)} avocados, 15 limes`,
      estimatedCost: 15,
      cymbalRollbackSavings: 2.5,
      store: 'Aisle 1 - Fresh Produce & Bakery',
      dietaryTags: ['vegan', 'gluten-free'],
      reason: 'Guacamole batch and lime wedges for taco bar and bar garnishes',
      priority: 'essential',
      isPurchased: false,
    });
    items.push({
      id: `item-${idCounter++}`,
      name: 'Cymbal Tortilla Chips & Salsa Trio',
      category: 'food',
      quantity: '3 large bags',
      estimatedCost: 12,
      cymbalRollbackSavings: 2.0,
      store: 'Aisle 7 - Snacks & Pantry Staples',
      dietaryTags: ['vegan', 'gluten-free'],
      reason: 'Continuous grazing throughout event',
      priority: 'essential',
      isPurchased: false,
    });
  } else if (theme.toLowerCase().includes('bbq') || theme.toLowerCase().includes('grill') || theme.toLowerCase().includes('burger')) {
    items.push({
      id: `item-${idCounter++}`,
      name: 'Cymbal Prime Ground Chuck 80/20 & Brioche Buns',
      category: 'food',
      quantity: `${Math.ceil(totalGuests * 0.45)} lbs beef + 32 buns`,
      estimatedCost: Math.round(totalGuests * 2.2),
      cymbalRollbackSavings: 5.0,
      store: 'Aisle 3 - Butcher & Seafood',
      dietaryTags: [],
      reason: 'Sliders cook quickly and reduce waste compared to full patties',
      priority: 'essential',
      isPurchased: false,
    });
    items.push({
      id: `item-${idCounter++}`,
      name: 'Sweet Corn on the Cob & Seedless Watermelon',
      category: 'food',
      quantity: `${Math.ceil(totalGuests * 0.75)} ears corn + 2 watermelons`,
      estimatedCost: 16,
      cymbalRollbackSavings: 3.0,
      store: 'Aisle 1 - Fresh Produce & Bakery',
      dietaryTags: ['vegan', 'gluten-free'],
      reason: 'Hydrating summer sides with high guest satisfaction',
      priority: 'essential',
      isPurchased: false,
    });
    items.push({
      id: `item-${idCounter++}`,
      name: 'Hardwood Charcoal Briquettes & Fire Starters',
      category: 'essentials',
      quantity: '1 large 16lb bag',
      estimatedCost: 14,
      store: 'Aisle 5 - Party Supplies & Paper Goods',
      dietaryTags: [],
      reason: 'Fuel for multi-hour grilling sessions',
      priority: 'essential',
      isPurchased: false,
    });
  } else {
    items.push({
      id: `item-${idCounter++}`,
      name: `Signature ${theme} Main Course Platter`,
      category: 'food',
      quantity: `${Math.ceil(totalGuests * 0.5)} lbs / portions`,
      estimatedCost: Math.round(totalGuests * 3),
      cymbalRollbackSavings: 4.5,
      store: 'Aisle 3 - Butcher & Seafood',
      dietaryTags: ['crowd-pleaser'],
      reason: 'Central theme protein and main dishes',
      priority: 'essential',
      isPurchased: false,
    });
    items.push({
      id: `item-${idCounter++}`,
      name: 'Artisan Grazing Board (Cheeses, Crackers, Fruit)',
      category: 'food',
      quantity: '2 large assortments',
      estimatedCost: 28,
      cymbalRollbackSavings: 3.0,
      store: 'Aisle 1 - Fresh Produce & Bakery',
      dietaryTags: ['vegetarian'],
      reason: 'Pre-dinner snacking so host can welcome arrivals',
      priority: 'essential',
      isPurchased: false,
    });
  }

  // Dietary specific additions
  if (details.dietary?.some((d: string) => d.toLowerCase().includes('vegan') || d.toLowerCase().includes('vegetarian'))) {
    items.push({
      id: `item-${idCounter++}`,
      name: 'Plant-Based Protein / Veggie Skewers',
      category: 'food',
      quantity: '2 packs (serves 6-8)',
      estimatedCost: 14,
      cymbalRollbackSavings: 2.0,
      store: 'Aisle 3 - Butcher & Seafood',
      dietaryTags: ['vegan', 'gluten-free', 'vegetarian'],
      reason: 'Guarantees plant-based guests have a substantial hot option',
      priority: 'essential',
      isPurchased: false,
    });
  }

  // Drinks
  if (drinkStyle.toLowerCase().includes('full bar') || drinkStyle.toLowerCase().includes('cocktail')) {
    items.push({
      id: `item-${idCounter++}`,
      name: 'Signature Spirit Bottle (1.75L)',
      category: 'drinks',
      quantity: '1 large bottle',
      estimatedCost: 34,
      store: 'Aisle 9 - Beverages & Chilled Ice',
      dietaryTags: [],
      reason: 'Base for batch-crafted welcome cocktail',
      priority: 'essential',
      isPurchased: false,
    });
    items.push({
      id: `item-${idCounter++}`,
      name: 'Craft Beer / Hard Seltzer 24-Pack',
      category: 'drinks',
      quantity: '1 case (24 cans)',
      estimatedCost: 28,
      cymbalRollbackSavings: 3.0,
      store: 'Aisle 9 - Beverages & Chilled Ice',
      dietaryTags: [],
      reason: 'Self-serve cold beverage alternative',
      priority: 'recommended',
      isPurchased: false,
    });
  } else if (drinkStyle.toLowerCase().includes('wine')) {
    items.push({
      id: `item-${idCounter++}`,
      name: 'Curated Red & Chilled White Wines',
      category: 'drinks',
      quantity: `${Math.ceil(adults * 0.4)} bottles`,
      estimatedCost: Math.ceil(adults * 0.4) * 12,
      store: 'Aisle 9 - Beverages & Chilled Ice',
      dietaryTags: [],
      reason: 'Calculated at 3 glasses per adult guest',
      priority: 'essential',
      isPurchased: false,
    });
  }

  // Non-alcoholic / sodas
  items.push({
    id: `item-${idCounter++}`,
    name: 'Sparkling Seltzers & Artisanal Sodas (Variety Pack)',
    category: 'drinks',
    quantity: '24-pack assorted',
    estimatedCost: 15,
    cymbalRollbackSavings: 2.0,
    store: 'Aisle 9 - Beverages & Chilled Ice',
    dietaryTags: ['alcohol-free', 'kid-friendly'],
    reason: 'Hydration and non-drinker hospitality',
    priority: 'essential',
    isPurchased: false,
  });

  // Ice & Tableware
  items.push({
    id: `item-${idCounter++}`,
    name: 'Cymbal Pure Glacier Ice Bags (10 lbs each)',
    category: 'essentials',
    quantity: `${Math.ceil(iceLbs / 10)} bags (${iceLbs} lbs)`,
    estimatedCost: Math.ceil(iceLbs / 10) * 3,
    store: 'Aisle 9 - Beverages & Chilled Ice',
    dietaryTags: [],
    reason: 'Calculated 1.5 lbs per guest plus cooler chilling buffer',
    priority: 'essential',
    isPurchased: false,
  });

  items.push({
    id: `item-${idCounter++}`,
    name: 'Eco Heavy-Duty Plates & Cups (+25% Buffer)',
    category: 'tableware',
    quantity: `${Math.ceil(totalGuests * 1.25)} count plates & cups`,
    estimatedCost: 16,
    cymbalRollbackSavings: 2.5,
    store: 'Aisle 5 - Party Supplies & Paper Goods',
    dietaryTags: [],
    reason: 'Includes 25% second-trip safety reserve so nobody runs out',
    priority: 'essential',
    isPurchased: false,
  });

  items.push({
    id: `item-${idCounter++}`,
    name: 'Festive Garland, Napkins & Mood Lighting',
    category: 'decor',
    quantity: '1 decor kit + 100 napkins',
    estimatedCost: 14,
    store: 'Aisle 5 - Party Supplies & Paper Goods',
    dietaryTags: [],
    reason: 'Visual atmosphere and easy finger cleanup',
    priority: 'recommended',
    isPurchased: false,
  });

  items.push({
    id: `item-${idCounter++}`,
    name: 'Cymbal Heavy Contractor Trash Bags & Paper Towels',
    category: 'essentials',
    quantity: '1 box bags + 2 rolls',
    estimatedCost: 8,
    store: 'Aisle 5 - Party Supplies & Paper Goods',
    dietaryTags: [],
    reason: 'Seamless post-event cleanup',
    priority: 'essential',
    isPurchased: false,
  });

  const totalCost = items.reduce((sum, i) => sum + i.estimatedCost, 0);

  return {
    title: `${theme} Celebration Plan`,
    tagline: `Smart procurement plan for ${totalGuests} guests with calibrated portions`,
    themeDescription: `A high-energy, effortless party experience designed around ${foodStyle} and ${drinkStyle}. Everything from grocery quantities to ice ratios has been calibrated.`,
    totalEstimatedCost: totalCost,
    budgetStatus: totalCost <= budget ? 'under_budget' : 'near_budget',
    calculatedPortions: {
      iceLbs,
      iceNote: `${iceLbs} lbs calculated (${Math.ceil(iceLbs / 10)}x 10lb bags) for glass service and cooling.`,
      drinkCountTotal,
      drinksBreakdown: `Calculated at 2 drinks for 1st hour + 1/hr after = ~${drinkCountTotal} drinks total.`,
      appetizerPiecesPerPerson: 5,
      tablewareBufferPct: 25,
    },
    items,
    budgetAdvice: [
      'Buy meats, sodas, and cheeses in bulk at wholesale clubs for 30–45% per-unit savings.',
      'Batch your signature cocktail in a large beverage dispenser; it prevents bartender bottlenecks.',
      'Shop at dollar stores for balloons, banners, and disposable serving platters.',
    ],
    prepTimeline: [
      {
        timeframe: '5–7 Days Before',
        tasks: [
          'Order decorations and specialty tableware online',
          'Confirm guest RSVPs and double-check dietary preferences',
        ],
      },
      {
        timeframe: '2–3 Days Before',
        tasks: [
          'Costco/Wholesale run for bulk beverages, dry goods, and paper supplies',
          'Chill wines and canned beverages in secondary refrigerator',
        ],
      },
      {
        timeframe: '1 Day Before',
        tasks: [
          'Pre-chop garnishes, slice lemons/limes, and prep sauces',
          'Marinate meats or assemble casseroles in oven-safe dishes',
          'Set up tables and trash cans',
        ],
      },
      {
        timeframe: 'Day of Party (T-2 hours)',
        tasks: [
          'Pick up fresh bags of ice from grocery store',
          'Fill drink coolers and set out clean ice bucket with scoop',
          'Warm hot dishes in slow cookers or oven on low',
          'Turn on playlist and light candles 15 mins before first guest arrives',
        ],
      },
    ],
    signatureTip: 'Set out a Sharpie next to the cup station so guests write their name. It cuts cup consumption in half!',
  };
}

// POST: /api/planner/generate
app.post('/api/planner/generate', async (req: Request, res: Response) => {
  try {
    const partyDetails = req.body;
    let plan;
    try {
      plan = await generatePartyPlan(partyDetails);
    } catch (genAiErr) {
      console.warn('Gemini API call returned error, using calibrated party intelligence fallback:', genAiErr);
      plan = generateFallbackPlan(partyDetails);
    }
    res.json({ success: true, plan });
  } catch (err: any) {
    console.error('Error in /api/planner/generate:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate party plan',
    });
  }
});

// POST: /api/planner/chat - Consult with the party shopping agent
app.post('/api/planner/chat', async (req: Request, res: Response) => {
  try {
    const { message, currentPlan, history } = req.body;

    const systemPrompt = `You are the PartyFest Shopping Agent, a friendly, ultra-knowledgeable party planner and shopping consultant.
The user is planning a party:
Current Plan Title: "${currentPlan?.title || 'Party'}"
Current Guest Count: ${currentPlan?.calculatedPortions ? 'Planned' : 'Unknown'}
Current Total Items: ${currentPlan?.items?.length || 0} items
Current Estimated Cost: $${currentPlan?.totalEstimatedCost || 0}
Target Budget: $${currentPlan?.targetBudget || 'Flexible'}

When answering:
1. Provide practical, high-value party tips, exact portion calculations, brand recommendations, or smart store hacks.
2. If the user asks to add, remove, or swap items, or adjust for dietary needs/budget changes, specify concrete suggested item changes.
3. You can optionally include an "action" field in your JSON response if you want to propose item additions or swaps!
Format your response strictly as JSON with this schema:
{
  "reply": "friendly explanation / advice with formatting",
  "suggestedAdditions": [
    {
      "id": "item-unique-id",
      "name": "item name",
      "category": "food" | "drinks" | "tableware" | "decor" | "activities" | "essentials",
      "quantity": "quantity string",
      "estimatedCost": number,
      "store": "store recommendation",
      "dietaryTags": ["tag"],
      "reason": "reason",
      "priority": "essential" | "recommended" | "optional_splurge"
    }
  ],
  "suggestedRemovals": ["item name or item id"],
  "proTip": "one punchy planner tip"
}`;

    const formattedContents = [
      {
        role: 'user',
        parts: [
          {
            text: `Conversation history: ${JSON.stringify(history || [])}\nCurrent items snapshot: ${JSON.stringify((currentPlan?.items || []).slice(0, 15).map((i: any) => ({ name: i.name, cost: i.estimatedCost, store: i.store })))}\n\nUser request: "${message}"`,
          },
        ],
      },
    ];

    let parsed;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });
      parsed = JSON.parse(response.text || '{}');
    } catch (chatAiErr) {
      console.warn('Gemini chat call error, using expert rule response:', chatAiErr);
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('cut') || lowerMsg.includes('budget') || lowerMsg.includes('cheap') || lowerMsg.includes('trim')) {
        parsed = {
          reply: `To immediately save $30–$50: Swap pre-cut fruit and vegetable trays for whole produce (saving ~$18), purchase generic bulk party plates and cups at the dollar store instead of premium brands (saving ~$12), and batch-mix a festive punch instead of buying individual bottled beers.`,
          proTip: 'A signature batch cocktail costs ~60% less per serving than buying craft IPA 6-packs.',
          suggestedAdditions: [
            {
              id: `add-${Date.now()}`,
              name: 'Citrus Punch Base (Lemonade & Ginger Ale)',
              category: 'drinks',
              quantity: '2 gallons',
              estimatedCost: 8,
              store: 'Supermarket / Grocery',
              dietaryTags: ['alcohol-free', 'kid-friendly'],
              reason: 'Budget-stretching signature drink base',
              priority: 'essential',
            },
          ],
        };
      } else if (lowerMsg.includes('drink') || lowerMsg.includes('cocktail') || lowerMsg.includes('beer')) {
        parsed = {
          reply: `Here are 2 signature drinks sharing common ingredients: 1) Hibiscus Lime Margarita and 2) Sparkling Citrus Hibiscus Mocktail. Both utilize fresh limes, agave syrup, and hibiscus iced tea, meaning you buy zero duplicate ingredients!`,
          proTip: 'Infuse your simple syrup with rosemary or mint the night before for a $0.50 gourmet upgrade.',
          suggestedAdditions: [
            {
              id: `add-${Date.now()}`,
              name: 'Hibiscus Herbal Tea Bags & Agave Syrup',
              category: 'drinks',
              quantity: '1 box tea + 1 bottle agave',
              estimatedCost: 7.5,
              store: 'Supermarket / Grocery',
              dietaryTags: ['vegan', 'alcohol-free'],
              reason: 'Dual-use signature cocktail and mocktail base',
              priority: 'recommended',
            },
          ],
        };
      } else if (lowerMsg.includes('diet') || lowerMsg.includes('vegan') || lowerMsg.includes('gluten') || lowerMsg.includes('celiac')) {
        parsed = {
          reply: `For gluten-free and vegan accommodations, stick to naturally inclusive staples: corn tortillas instead of flour, fresh guacamole and salsas, roasted corn skewers, and hummus with fresh bell pepper strips. Make sure to keep the corn tortilla warmer sealed away from wheat buns!`,
          proTip: 'Use separate tongs and color-coded serving bowls for gluten-free items to avoid cross-contact.',
          suggestedAdditions: [
            {
              id: `add-${Date.now()}`,
              name: 'Certified Gluten-Free Rice Crackers & Hummus',
              category: 'food',
              quantity: '2 boxes + 1 large tub',
              estimatedCost: 9,
              store: 'Supermarket / Grocery',
              dietaryTags: ['gluten-free', 'vegan'],
              reason: 'Safe grazing alternative for allergy guests',
              priority: 'essential',
            },
          ],
        };
      } else {
        parsed = {
          reply: `Great question! For "${currentPlan?.title || 'your party'}", remember to prioritize the guest flow: place drinks far away from food platters to avoid human traffic jams, set out trash bins at each exit, and chill white wines at least 4 hours in advance.`,
          proTip: 'Keep back-up ice bags stored in a designated bathroom bathtub or insulated chest with salt.',
        };
      }
    }

    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error('Error in /api/planner/chat:', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to chat with agent',
    });
  }
});

// POST: /api/planner/substitute - Find smart budget or dietary swap for an item
app.post('/api/planner/substitute', async (req: Request, res: Response) => {
  try {
    const { item, type, context } = req.body;
    let parsed;
    try {
      const prompt = `Item: "${item.name}" (Current cost: $${item.estimatedCost}, category: ${item.category}, store: ${item.store}).
Goal: Find a high-value alternative/substitution for ${type === 'budget_cheaper' ? 'a cheaper budget-friendly option' : type === 'dietary' ? 'an inclusive dietary/allergy-safe option (e.g. vegan/gluten-free)' : 'an elevated upscale crowd-pleaser'}.
Context: ${context || 'Party event'}.

Return JSON:
{
  "replacement": {
    "name": "New Item Name",
    "quantity": "new quantity",
    "estimatedCost": number,
    "store": "Store",
    "dietaryTags": ["tags"],
    "savingsOrDifference": "e.g. -$8.50 savings" or "+$5.00 upgrade",
    "whyBetter": "explanation of taste, savings, or convenience"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      parsed = JSON.parse(response.text || '{}');
    } catch (subErr) {
      console.warn('Gemini substitute error, using calibrated item alternative:', subErr);
      if (type === 'budget_cheaper') {
        const discounted = Math.max(2, Math.round(item.estimatedCost * 0.6));
        parsed = {
          replacement: {
            name: `Store Brand Bulk ${item.name.replace(/brand|artisan|gourmet/gi, '').trim()}`,
            quantity: item.quantity,
            estimatedCost: discounted,
            store: 'Costco / Wholesale',
            dietaryTags: item.dietaryTags,
            savingsOrDifference: `-$${(item.estimatedCost - discounted).toFixed(2)} savings`,
            whyBetter: 'Private-label wholesale equivalent delivers identical taste with zero brand markup.',
          },
        };
      } else if (type === 'dietary') {
        parsed = {
          replacement: {
            name: `Certified Gluten-Free & Vegan ${item.name}`,
            quantity: item.quantity,
            estimatedCost: item.estimatedCost,
            store: 'Supermarket / Grocery',
            dietaryTags: ['gluten-free', 'vegan', 'allergy-safe'],
            savingsOrDifference: 'Same cost, allergy-safe',
            whyBetter: 'Ensures inclusive hospitality so every attendee can enjoy safely without worry.',
          },
        };
      } else {
        const upgraded = Math.round(item.estimatedCost * 1.35);
        parsed = {
          replacement: {
            name: `Gourmet Artisanal ${item.name}`,
            quantity: item.quantity,
            estimatedCost: upgraded,
            store: 'Specialty Bakery',
            dietaryTags: item.dietaryTags,
            savingsOrDifference: `+$${(upgraded - item.estimatedCost).toFixed(2)} premium`,
            whyBetter: 'Handcrafted quality that creates an elevated centerpiece and memorable impression.',
          },
        };
      }
    }

    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error('Error in /api/planner/substitute:', err);
    res.status(500).json({ success: false, error: err?.message || 'Substitution failed' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PartyFest Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
