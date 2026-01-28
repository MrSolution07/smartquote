import type { 
  ProjectInput, 
  AIRecommendation, 
  LineItem, 
  TeamMember, 
  RoleType 
} from '../types';

// Base rates by role (per hour in USD)
const BASE_RATES: Record<RoleType, { junior: number; mid: number; senior: number; lead: number }> = {
  developer: { junior: 40, mid: 70, senior: 100, lead: 130 },
  designer: { junior: 35, mid: 60, senior: 90, lead: 115 },
  manager: { junior: 50, mid: 75, senior: 105, lead: 140 },
  consultant: { junior: 60, mid: 90, senior: 130, lead: 170 },
  qa: { junior: 30, mid: 50, senior: 75, lead: 95 },
  devops: { junior: 50, mid: 80, senior: 115, lead: 150 },
  other: { junior: 40, mid: 65, senior: 90, lead: 120 },
};

// Complexity multipliers
const COMPLEXITY_MULTIPLIERS = {
  low: 0.8,
  medium: 1.0,
  high: 1.3,
};

// Project size multipliers
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
 * This simulates an AI service that provides intelligent pricing suggestions
 * In a production app, this would call an actual AI API (OpenAI, Claude, etc.)
 */
export async function generatePricingRecommendation(
  input: ProjectInput
): Promise<AIRecommendation> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const {
    clientCategory,
    projectSize,
    complexity,
    estimatedDuration,
    teamSize,
    roles,
    description,
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
    complexity
  );

  // Calculate labor costs
  const laborCost = teamSuggestions.reduce(
    (sum, member) => sum + member.estimatedHours * member.hourlyRate,
    0
  );

  // Apply multipliers
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[complexity];
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

  // Determine level distribution based on complexity
  const levelDistribution =
    complexity === 'high'
      ? { junior: 0.2, mid: 0.3, senior: 0.3, lead: 0.2 }
      : complexity === 'medium'
      ? { junior: 0.3, mid: 0.4, senior: 0.2, lead: 0.1 }
      : { junior: 0.4, mid: 0.4, senior: 0.15, lead: 0.05 };

  const levels: Array<'junior' | 'mid' | 'senior' | 'lead'> = ['junior', 'mid', 'senior', 'lead'];
  
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
  totalRevenue: number,
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
