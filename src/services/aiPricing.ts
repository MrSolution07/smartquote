import type { 
  ProjectInput, 
  AIRecommendation, 
  LineItem, 
  TeamMember, 
  RoleType,
  AIConfig
} from '../types';
import { getAIPricingAnalysis } from './aiService';

// this is just a mock data for the time being but this should be either entered by the user or by the ai
const BASE_RATES: Record<RoleType, { junior: number; mid: number; senior: number; lead: number }> = {
  developer: { junior: 350, mid: 650, senior: 1000, lead: 1400 },
  designer: { junior: 300, mid: 550, senior: 850, lead: 1200 },
  manager: { junior: 450, mid: 750, senior: 1100, lead: 1500 },
  consultant: { junior: 600, mid: 1000, senior: 1400, lead: 1800 },
  qa: { junior: 250, mid: 450, senior: 650, lead: 900 },
  devops: { junior: 450, mid: 700, senior: 1100, lead: 1500 },
  other: { junior: 350, mid: 550, senior: 850, lead: 1200 },
};

// Complexity multipliers, again this is just a mock data for the time being but this should be either entered by the user or by the ai
const COMPLEXITY_MULTIPLIERS = {
  low: 0.8,
  medium: 1.0,
  high: 1.3,
};

// Project size multipliers, again this is just a mock data for the time being but this should be either entered by the user or by the ai
const SIZE_MULTIPLIERS = {
  small: 0.9,
  medium: 1.0,
  large: 1.15,
  enterprise: 1.35,
};

// Client category adjustments
const CLIENT_ADJUSTMENTS = {
  individual: 0.85,
  'small-business': 1.0,
  enterprise: 1.25,
  'non-profit': 0.75,
};

const generateId = () => crypto.randomUUID();

/**
 * AI-powered pricing recommendation engine
 * Uses real AI APIs (Groq, HuggingFace, etc.) for intelligent pricing suggestions
 * Falls back to algorithmic pricing if AI is not configured or fails
 */
export async function generatePricingRecommendation(
  input: ProjectInput,
  aiConfig: AIConfig | null = null
): Promise<AIRecommendation> {
  try {
    // Try to get AI-powered analysis
    const aiAnalysis = await getAIPricingAnalysis(input, aiConfig);
    
    // Convert AI analysis to our format
    const teamSuggestions = convertAIBreakdownToTeamSuggestions(
      aiAnalysis.costBreakdown
    );
    
    const breakdown = convertAIBreakdownToLineItems(aiAnalysis.costBreakdown);
    
    // Add project management fee for larger projects
    if (input.projectSize === 'large' || input.projectSize === 'enterprise') {
      const pmFee = aiAnalysis.recommendedPrice * 0.1;
      breakdown.push({
        id: generateId(),
        description: 'Project Management & Coordination',
        quantity: 1,
        unitPrice: Math.round(pmFee * 100) / 100,
        total: Math.round(pmFee * 100) / 100,
      });
    }
    
    // Build comprehensive reasoning
    const enhancedReasoning = `${aiAnalysis.reasoning}

MARKET INSIGHTS:
${aiAnalysis.marketInsights}

RECOMMENDATION:
This pricing is based on ${aiConfig?.enabled ? 'AI-powered analysis using real-time market data' : 'algorithmic analysis'}. The recommendation includes a ${aiAnalysis.profitMarginRecommendation}% profit margin which is industry-standard for ${input.projectSize} ${input.clientCategory} projects.`;
    
    return {
      totalPrice: Math.round(aiAnalysis.recommendedPrice * 100) / 100,
      breakdown,
      profitMargin: aiAnalysis.profitMarginRecommendation,
      reasoning: enhancedReasoning,
      teamSuggestions,
      confidence: aiAnalysis.confidence,
    };
  } catch (error) {
    console.error('AI pricing failed, using fallback:', error);
    // Fallback to original algorithmic method
    return generateAlgorithmicPricing(input);
  }
}

function convertAIBreakdownToTeamSuggestions(
  costBreakdown: any[]
): TeamMember[] {
  return costBreakdown.map((item) => {
    // Determine level based on rate
    const rate = item.rate;
    let level: 'junior' | 'mid' | 'senior' | 'lead' = 'mid';
    
    if (rate < 60) level = 'junior';
    else if (rate < 90) level = 'mid';
    else if (rate < 120) level = 'senior';
    else level = 'lead';
    
    // Map role name to RoleType
    const roleName = item.role.toLowerCase();
    let role: RoleType = 'other';
    
    if (roleName.includes('develop')) role = 'developer';
    else if (roleName.includes('design')) role = 'designer';
    else if (roleName.includes('manag')) role = 'manager';
    else if (roleName.includes('consul')) role = 'consultant';
    else if (roleName.includes('qa') || roleName.includes('test')) role = 'qa';
    else if (roleName.includes('devops')) role = 'devops';
    
    return {
      id: generateId(),
      role,
      estimatedHours: item.hours,
      hourlyRate: item.rate,
      contributionPercentage: 0, // Will be calculated below
      level,
    };
  });
}

function convertAIBreakdownToLineItems(costBreakdown: any[]): LineItem[] {
  return costBreakdown.map((item) => ({
    id: generateId(),
    description: `${item.role} Services (${item.hours} hours) - ${item.justification}`,
    quantity: item.hours,
    unitPrice: item.rate,
    total: item.total,
  }));
}

/**
 * Fallback algorithmic pricing when AI is not available
 */
function generateAlgorithmicPricing(input: ProjectInput): AIRecommendation {
  const {
    clientCategory,
    projectSize,
    estimatedDuration,
    teamSize,
    roles,
  } = input;

  // Calculate base hours per week per person
  const hoursPerWeek = 40;
  const totalWeeks = estimatedDuration;
  const totalHours = hoursPerWeek * totalWeeks * teamSize;

  // Generate team composition suggestions
  const teamSuggestions = generateTeamSuggestions(
    roles,
    teamSize,
    totalHours,
    input.complexity
  );

  // Calculate labor costs
  const laborCost = teamSuggestions.reduce(
    (sum, member) => sum + member.estimatedHours * member.hourlyRate,
    0
  );

  // Apply multipliers
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[input.complexity];
  const sizeMultiplier = SIZE_MULTIPLIERS[projectSize];
  const clientAdjustment = CLIENT_ADJUSTMENTS[clientCategory];

  // Calculate adjusted cost
  const adjustedCost = laborCost * complexityMultiplier * sizeMultiplier * clientAdjustment;

  // Add overhead and profit margin (30-50% depending on project size)
  const profitMargin = projectSize === 'small' ? 0.35 : projectSize === 'enterprise' ? 0.45 : 0.40;
  const totalPrice = adjustedCost * (1 + profitMargin);

  // Generate line items breakdown
  const breakdown = generateBreakdown(teamSuggestions, totalPrice, projectSize);

  // Generate reasoning
  const reasoning = generateReasoning(
    input,
    teamSuggestions,
    profitMargin,
    complexityMultiplier,
    sizeMultiplier,
    clientAdjustment
  );

  // Calculate confidence based on input completeness
  const confidence = calculateConfidence(input, teamSuggestions);

  return {
    totalPrice: Math.round(totalPrice * 100) / 100,
    breakdown,
    profitMargin: Math.round(profitMargin * 100),
    reasoning,
    teamSuggestions,
    confidence,
  };
}

function generateTeamSuggestions(
  roles: RoleType[],
  teamSize: number,
  totalHours: number,
  complexity: 'low' | 'medium' | 'high'
): TeamMember[] {
  const suggestions: TeamMember[] = [];
  const hoursPerMember = totalHours / teamSize;

  // Adjust seniority based on complexity
  const levels: Array<'junior' | 'mid' | 'senior' | 'lead'> = 
    complexity === 'high' ? ['mid', 'senior', 'senior', 'lead'] :
    complexity === 'low' ? ['junior', 'junior', 'mid', 'mid'] :
    ['junior', 'mid', 'senior', 'lead'];
  
  roles.forEach((role, index) => {
    // Distribute levels across team members
    const levelIndex = Math.floor((index / roles.length) * levels.length);
    const level = levels[Math.min(levelIndex, levels.length - 1)];
    
    const hourlyRate = BASE_RATES[role][level];
    const contribution = 100 / teamSize;

    suggestions.push({
      id: generateId(),
      role,
      estimatedHours: Math.round(hoursPerMember),
      hourlyRate,
      contributionPercentage: Math.round(contribution * 10) / 10,
      level,
    });
  });

  return suggestions;
}

function generateBreakdown(
  teamSuggestions: TeamMember[],
  totalPrice: number,
  projectSize: string
): LineItem[] {
  const breakdown: LineItem[] = [];

  // Group by role
  const roleGroups = teamSuggestions.reduce((acc, member) => {
    const existing = acc.get(member.role);
    if (existing) {
      existing.hours += member.estimatedHours;
      existing.cost += member.estimatedHours * member.hourlyRate;
    } else {
      acc.set(member.role, {
        hours: member.estimatedHours,
        cost: member.estimatedHours * member.hourlyRate,
      });
    }
    return acc;
  }, new Map<RoleType, { hours: number; cost: number }>());

  // Create line items for each role
  roleGroups.forEach((data, role) => {
    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    breakdown.push({
      id: generateId(),
      description: `${roleName} Services (${data.hours} hours)`,
      quantity: data.hours,
      unitPrice: Math.round((data.cost / data.hours) * 100) / 100,
      total: Math.round(data.cost * 100) / 100,
    });
  });

  // Add project management fee for larger projects
  if (projectSize === 'large' || projectSize === 'enterprise') {
    const pmFee = totalPrice * 0.1;
    breakdown.push({
      id: generateId(),
      description: 'Project Management & Coordination',
      quantity: 1,
      unitPrice: Math.round(pmFee * 100) / 100,
      total: Math.round(pmFee * 100) / 100,
    });
  }

  return breakdown;
}

function generateReasoning(
  input: ProjectInput,
  teamSuggestions: TeamMember[],
  profitMargin: number,
  complexityMultiplier: number,
  sizeMultiplier: number,
  clientAdjustment: number
): string {
  const reasons: string[] = [];

  reasons.push(
    `Based on your ${input.projectSize} ${input.clientCategory} project with ${input.complexity} complexity:`
  );

  reasons.push(
    `• Estimated ${input.estimatedDuration} weeks with a team of ${input.teamSize} professionals`
  );

  const rolesList = teamSuggestions
    .map((m) => `${m.level} ${m.role}`)
    .join(', ');
  reasons.push(`• Recommended team composition: ${rolesList}`);

  if (complexityMultiplier !== 1) {
    const adjustment = ((complexityMultiplier - 1) * 100).toFixed(0);
    reasons.push(
      `• ${input.complexity === 'high' ? 'Higher' : 'Lower'} complexity adds ${adjustment}% adjustment`
    );
  }

  if (sizeMultiplier !== 1) {
    const adjustment = ((sizeMultiplier - 1) * 100).toFixed(0);
    reasons.push(`• ${input.projectSize} project scale adds ${adjustment}% premium`);
  }

  if (clientAdjustment !== 1) {
    const adjustment = Math.abs((clientAdjustment - 1) * 100).toFixed(0);
    const direction = clientAdjustment < 1 ? 'discount' : 'adjustment';
    reasons.push(`• ${input.clientCategory} client ${direction}: ${adjustment}%`);
  }

  reasons.push(`• Profit margin: ${(profitMargin * 100).toFixed(0)}%`);

  return reasons.join('\n');
}

function calculateConfidence(input: ProjectInput, teamSuggestions: TeamMember[]): number {
  let confidence = 70; // Base confidence

  // More detailed input increases confidence
  if (input.description && input.description.length > 50) confidence += 10;
  if (input.roles.length >= 2) confidence += 5;
  if (input.estimatedDuration > 0) confidence += 5;
  if (teamSuggestions.length > 0) confidence += 10;

  return Math.min(confidence, 95); // Cap at 95%
}

/**
 * Suggest team compensation based on total project value
 */
export function calculateTeamCompensation(
  teamMembers: TeamMember[]
): TeamMember[] {
  const totalHours = teamMembers.reduce((sum, m) => sum + m.estimatedHours, 0);
  
  return teamMembers.map((member) => {
    const contribution = (member.estimatedHours / totalHours) * 100;
    return {
      ...member,
      contributionPercentage: Math.round(contribution * 10) / 10,
    };
  });
}
