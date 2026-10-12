export type ItemCategory = 'food' | 'drinks' | 'tableware' | 'decor' | 'activities' | 'essentials';

export type StoreType =
  | 'Aisle 1 - Fresh Produce & Bakery'
  | 'Aisle 3 - Butcher & Seafood'
  | 'Aisle 5 - Party Supplies & Paper Goods'
  | 'Aisle 7 - Snacks & Pantry Staples'
  | 'Aisle 9 - Beverages & Chilled Ice'
  | string;

export type PriorityLevel = 'essential' | 'recommended' | 'optional_splurge';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: string;
  estimatedCost: number;
  originalPrice?: number;
  cymbalRollbackSavings?: number;
  store: StoreType;
  dietaryTags: string[];
  reason: string;
  priority: PriorityLevel;
  isPurchased?: boolean;
  notes?: string;
}

export interface CalculatedPortions {
  iceLbs: number;
  iceNote: string;
  drinkCountTotal: number;
  drinksBreakdown: string;
  appetizerPiecesPerPerson: number;
  tablewareBufferPct: number;
}

export interface PrepMilestone {
  timeframe: string;
  tasks: string[];
}

export interface PartyDetails {
  partyType: string;
  theme: string;
  adults: number;
  kids: number;
  durationHours: number;
  foodStyle: string;
  drinkStyle: string;
  targetBudget: number;
  dietary: string[];
  venue: string;
  notes: string;
}

export interface FulfillmentOption {
  method: 'curbside' | 'delivery' | 'in_store';
  storeLocation: string;
  slotTime: string;
  isRewardsMember: boolean;
  notes?: string;
}

export interface PartyPlan {
  title: string;
  tagline: string;
  themeDescription: string;
  totalEstimatedCost: number;
  budgetStatus: 'under_budget' | 'near_budget' | 'over_budget' | string;
  calculatedPortions: CalculatedPortions;
  items: ShoppingItem[];
  budgetAdvice: string[];
  prepTimeline: PrepMilestone[];
  signatureTip: string;
  partyDetails?: PartyDetails;
  fulfillment?: FulfillmentOption;
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  proTip?: string;
  suggestedAdditions?: ShoppingItem[];
  suggestedRemovals?: string[];
}
