import type { AIConfig, ProjectInput } from '../types';

export interface AIAnalysisResult {
  recommendedPrice: number;
  reasoning: string;
  costBreakdown: {
    role: string;
    hours: number;
    rate: number;
    total: number;
    justification: string;
  }[];
  marketInsights: string;
  profitMarginRecommendation: number;
  confidence: number;
}

/**
 * Call Groq AI API for intelligent pricing analysis
 */
export async function getAIPricingAnalysis(
  input: ProjectInput,
  aiConfig: AIConfig | null
): Promise<AIAnalysisResult> {
  // Try environment variables first
  const envApiKey = import.meta.env.VITE_GROQ_API_KEY;
  const envProvider = import.meta.env.VITE_AI_PROVIDER || 'groq';
  
  const apiKey = envApiKey || aiConfig?.apiKey;
  const provider = envProvider || aiConfig?.provider || 'groq';
  const isEnabled = envApiKey || (aiConfig?.enabled && aiConfig?.apiKey);
  
  if (!isEnabled || !apiKey) {
    return getFallbackAnalysis(input);
  }
  
  try {
    const prompt = buildPrompt(input);
    
    let response;
    
    switch (provider) {
      case 'groq':
        response = await callGroqAPI(prompt, apiKey);
        break;
      case 'huggingface':
        response = await callHuggingFaceAPI(prompt, apiKey);
        break;
      case 'together':
        response = await callTogetherAPI(prompt, apiKey);
        break;
      case 'openrouter':
        response = await callOpenRouterAPI(prompt, apiKey);
        break;
      default:
        return getFallbackAnalysis(input);
    }

    return parseAIResponse(response, input);
  } catch (error) {
    console.error('AI API error:', error);
    return getFallbackAnalysis(input);
  }
}

function buildPrompt(input: ProjectInput): string {
  const isFeatureBased = input.description?.includes('Feature-based pricing');
  const featureCount = isFeatureBased ? 
    (input.description?.match(/Total features: (\d+)/)?.[1] || '0') : '0';
  
  return `You are an expert pricing consultant for the SOUTH AFRICAN market. Analyze this project and provide detailed pricing recommendations in SOUTH AFRICAN RAND (ZAR/R).

${isFeatureBased ? `
🎯 FEATURE-BASED PRICING MODEL (Value-based, NOT hourly!)

PROJECT FEATURES:
${input.description}

CRITICAL: Price EACH FEATURE based on its VALUE and COMPLEXITY, not developer hours!

SOUTH AFRICAN FEATURE PRICING GUIDELINES:
Simple Features (R8,000 - R25,000 each):
- User login/registration: R12,000 - R18,000
- Basic contact form: R8,000 - R12,000
- Email notifications: R10,000 - R15,000
- Basic search: R15,000 - R20,000

Medium Features (R25,000 - R60,000 each):
- User profile management: R30,000 - R45,000
- File upload system: R35,000 - R50,000
- Admin dashboard: R40,000 - R60,000
- Reporting system: R35,000 - R55,000
- API integration: R30,000 - R50,000

Complex Features (R60,000 - R150,000 each):
- Payment gateway integration: R80,000 - R120,000
- Real-time chat system: R90,000 - R130,000
- Advanced analytics: R70,000 - R110,000
- Multi-user collaboration: R85,000 - R140,000
- E-commerce system: R100,000 - R150,000

Very Complex Features (R150,000+ each):
- Custom CRM system: R180,000 - R300,000
- AI/ML integration: R200,000 - R400,000
- Video streaming platform: R250,000 - R500,000
- Blockchain integration: R300,000+

For complexity="${input.complexity}":
- low: Use SIMPLE feature rates
- medium: Use MEDIUM feature rates
- high: Use COMPLEX feature rates
- very-high: Use VERY COMPLEX feature rates

REQUIREMENTS:
1. Analyze EACH feature mentioned
2. Price each feature individually based on SA market value
3. Consider feature complexity, not just hours
4. Add 30-40% profit margin
5. Provide reasoning for each feature's price
6. Total = sum of all feature prices

` : `
⏱️ HOURLY RATE PRICING MODEL (Traditional cost-based)

PROJECT DETAILS:
- Client Category: ${input.clientCategory} (affects budget expectations)
- Project Size: ${input.projectSize} (affects scope and team size)
- Complexity Level: ${input.complexity} (VERY IMPORTANT - affects rates and hours!)
- Project Duration: ${input.estimatedDuration} weeks (affects total hours)
- Team Size: ${input.teamSize} people
- Required Roles: ${input.roles.join(', ')}
${input.description ? `- Project Description: ${input.description}` : ''}

SOUTH AFRICAN MARKET RATES (in ZAR per hour):
Junior Level:
- Developer: R300-R500/hr
- Designer: R300-R450/hr
- QA/Testing: R250-R400/hr

Mid Level:
- Developer: R500-R800/hr
- Designer: R450-R650/hr
- Project Manager: R600-R900/hr
- QA/Testing: R400-R550/hr

Senior Level:
- Developer: R800-R1500/hr
- Designer: R650-R900/hr
- Project Manager: R900-R1200/hr
- Consultant: R1000-R1800/hr

COMPLEXITY ADJUSTMENTS - ACTUALLY USE THE COMPLEXITY="${input.complexity}":
- low: Use LOWER end rates, fewer hours per week (20-30 hrs/week)
- medium: Use MID-RANGE rates, moderate hours (30-40 hrs/week)
- high: Use HIGHER end rates, more hours (40-50 hrs/week)
- very-high: Use SENIOR/MAXIMUM rates, extensive hours (50+ hrs/week)

PROJECT SIZE="${input.projectSize}" ADJUSTMENTS:
- small: Minimal team (1-2 people), focused scope, fewer total hours
- medium: Balanced team (3-5 people), moderate scope, standard hours
- large: Full team (5-8 people), comprehensive scope, many hours
- enterprise: Large team (8+ people), extensive scope, maximum hours

DURATION: ${input.estimatedDuration} weeks
Calculate total hours as: (hours per week based on complexity) × ${input.estimatedDuration} weeks

REQUIREMENTS:
1. All prices MUST be in South African Rand (ZAR/R)
2. ACTUALLY adjust rates based on complexity level
3. ACTUALLY adjust hours based on project size and duration
4. Consider South African cost of living (NOT US rates!)
5. For complexity="${input.complexity}", if it's high or very-high, use senior developers and more hours!
6. Provide breakdown for EACH role in: ${input.roles.join(', ')}
7. Include realistic South African market insights
8. Profit margin: 30-40% for SA market
`}

Respond ONLY with valid JSON:
{
  "recommendedPrice": number (in ZAR - total project price),
  "reasoning": "Detailed explanation of ${isFeatureBased ? 'how you priced each feature' : `how you used complexity=${input.complexity}, size=${input.projectSize}, duration=${input.estimatedDuration}`}",
  "costBreakdown": [
    {
      "role": "${isFeatureBased ? 'feature name (e.g., User Authentication)' : 'role name (e.g., developer)'}",
      "hours": number (${isFeatureBased ? '0 for feature-based' : `based on ${input.estimatedDuration} weeks`}),
      "rate": number (${isFeatureBased ? 'price per feature in ZAR' : 'ZAR/hr'}),
      "total": number (${isFeatureBased ? 'feature price in ZAR' : 'hours × rate'}),
      "justification": "${isFeatureBased ? 'why this feature costs this much' : 'why this rate/hours'}"
    }
  ],
  "marketInsights": "South African market analysis",
  "profitMarginRecommendation": number (30-40),
  "confidence": number (0-100)
}`;
}

async function callGroqAPI(prompt: string, apiKey: string): Promise<string> {
  console.log('📡 Calling Groq API...');
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert pricing consultant. Always respond in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  console.log('📡 Groq API Response Status:', response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Groq API Error:', error);
    throw new Error(`Groq API Error: ${error}`);
  }

  const data = await response.json();
  console.log('✅ Groq API Success');
  return data.choices[0]?.message?.content || '';
}

async function callHuggingFaceAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HuggingFace API Error: ${error}`);
  }

  const data = await response.json();
  return data[0]?.generated_text || '';
}

async function callTogetherAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        {
          role: 'system',
          content: 'You are an expert pricing consultant. Always respond in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Together API Error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callOpenRouterAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'SmartQuote',
    },
    body: JSON.stringify({
      model: 'mistralai/mixtral-8x7b-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an expert pricing consultant. Always respond in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API Error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function parseAIResponse(response: string, input: ProjectInput): AIAnalysisResult {
  try {
    // Try to extract JSON from the response (sometimes AI adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate the response has required fields
    if (!parsed.recommendedPrice || !parsed.costBreakdown) {
      throw new Error('Invalid response structure');
    }
    
    return parsed as AIAnalysisResult;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return getFallbackAnalysis(input);
  }
}

function getFallbackAnalysis(input: ProjectInput): AIAnalysisResult {
  // Base rates by role (per hour in ZAR - South African market)
  const baseRates: Record<string, number> = {
    developer: 650,
    designer: 550,
    manager: 750,
    consultant: 1200,
    qa: 450,
    devops: 700,
    other: 500,
  };

  // Complexity multipliers
  const complexityMultiplier = 
    input.complexity === 'high' ? 1.3 :
    input.complexity === 'low' ? 0.8 : 1.0;

  // Client adjustments
  const clientAdjustment = 
    input.clientCategory === 'enterprise' ? 1.25 :
    input.clientCategory === 'non-profit' ? 0.75 :
    input.clientCategory === 'individual' ? 0.85 : 1.0;

  // Size multipliers
  const sizeMultiplier = 
    input.projectSize === 'enterprise' ? 1.35 :
    input.projectSize === 'large' ? 1.15 :
    input.projectSize === 'small' ? 0.9 : 1.0;

  const hoursPerWeek = 40;
  const totalWeeks = input.estimatedDuration;
  const hoursPerRole = (hoursPerWeek * totalWeeks * input.teamSize) / input.roles.length;

  const costBreakdown = input.roles.map((role) => {
    const baseRate = baseRates[role] || 80;
    const adjustedRate = Math.round(baseRate * complexityMultiplier * clientAdjustment * sizeMultiplier);
    const hours = Math.round(hoursPerRole);
    const total = adjustedRate * hours;

    return {
      role: role.charAt(0).toUpperCase() + role.slice(1),
      hours,
      rate: adjustedRate,
      total,
      justification: `Based on ${input.complexity} complexity, ${input.clientCategory} client type, and ${input.projectSize} project scope. South African market rate (ZAR) adjusted for current demand.`,
    };
  });

  const subtotal = costBreakdown.reduce((sum, item) => sum + item.total, 0);
  const profitMargin = input.projectSize === 'enterprise' ? 45 : input.projectSize === 'large' ? 40 : 35;
  const recommendedPrice = Math.round(subtotal * (1 + profitMargin / 100));

  return {
    recommendedPrice,
    reasoning: `This pricing is based on algorithmic analysis (AI not configured). The calculation considers:\n• ${input.complexity.toUpperCase()} complexity project requiring specialized expertise\n• ${input.clientCategory.replace('-', ' ').toUpperCase()} client with typical budget expectations\n• ${input.projectSize.toUpperCase()} project scope affecting resource allocation\n• ${input.estimatedDuration} weeks duration with team of ${input.teamSize}\n• Market-competitive rates for ${input.roles.join(', ')}\n• ${profitMargin}% profit margin for sustainability\n\nNote: Enable AI configuration for more detailed, research-based recommendations.`,
    costBreakdown,
    marketInsights: 'AI-powered market insights unavailable. Configure AI settings to get real-time market analysis, competitive benchmarking, and industry-specific recommendations based on current trends.',
    profitMarginRecommendation: profitMargin,
    confidence: 70,
  };
}
