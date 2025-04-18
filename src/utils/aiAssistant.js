import axios from 'axios';

// GROQ API Configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Configure axios for GROQ API requests
const groqClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Makes a request to the GROQ API using llama3-70b-8192 model
 * @param {array} messages - Array of message objects with role and content
 * @returns {Promise} - Response from GROQ API
 */
export const makeGroqRequest = async (messages, temperature = 0.7) => {
  try {
    if (!GROQ_API_KEY) {
      console.error('GROQ API key is missing');
      return { error: 'API key is missing' };
    }

    const response = await groqClient.post('', {
      model: 'llama3-70b-8192',
      messages,
      temperature
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('GROQ API error:', error);
    return { error: error.message || 'Error communicating with GROQ API' };
  }
};

/**
 * Generate an improved title for a task
 */
export const generateImprovedTitle = async (currentTitle) => {
  if (!currentTitle?.trim()) return '';

  const messages = [
    {
      role: 'system',
      content: `You are a specialized task title optimizer.
      Strict rules:
      - Output ONLY the improved title without any formatting
      - Maximum 60 characters
      - Be clear, specific, and action-oriented
      - Use present tense verbs
      - Include key deliverable or outcome
      - Remove unnecessary articles (a, an, the)
      - No meta text or explanations
      - No quotes or punctuation`
    },
    {
      role: 'user',
      content: `Optimize this task title: "${currentTitle}"`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, 0.5);
    return typeof response === 'string' 
      ? response.replace(/^["'\s]+|["'\s]+$/g, '').trim()
      : '';
  } catch (error) {
    console.error('Error generating improved title:', error);
    return '';
  }
};

/**
 * Generate a detailed task description
 */
export const generateTaskDescription = async ({ title, existingDescription = '' }) => {
  if (!title?.trim()) return '';

  // Extract URLs from existing description to preserve them
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const existingUrls = existingDescription.match(urlPattern) || [];

  const messages = [
    {
      role: 'system',
      content: `You are a task description enhancer.
      Your job is to improve existing descriptions or create new ones if none exist.
      
      When enhancing existing descriptions:
      - Preserve ALL URLs and links exactly as they appear
      - Keep the core meaning and important details
      - Add structure with bullet points if missing
      - Add missing context or success criteria
      - Remove redundancy but NEVER remove URLs
      - Keep under 300 characters
      - Use active voice
      
      When creating new descriptions:
      - Use bullet points (•) for key points
      - Focus on actionable steps
      - Include success criteria
      - Be specific and measurable
      - Preserve any URLs mentioned
      
      Rules:
      - Output ONLY the description
      - Keep all URLs in their original format
      - No meta text or explanations
      - No quotes or special formatting
      
      Original URLs to preserve: ${existingUrls.join(', ')}`
    },
    {
      role: 'user',
      content: existingDescription.trim()
        ? `Enhance this task description for "${title}": ${existingDescription}`
        : `Create description for task: "${title}"`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, 0.7);
    if (typeof response === 'string') {
      let enhancedDescription = response.trim();
      
      // Verify all original URLs are still present, append if missing
      existingUrls.forEach(url => {
        if (!enhancedDescription.includes(url)) {
          enhancedDescription += `\n• Reference: ${url}`;
        }
      });
      
      return enhancedDescription;
    }
    return '';
  } catch (error) {
    console.error('Error generating description:', error);
    return '';
  }
};

/**
 * Analyze historical tasks to find patterns
 */
const analyzeHistoricalTasks = (tasks) => {
  if (!tasks?.length) return null;

  const patterns = {
    categoryTiming: {},
    successRates: {},
    averageDurations: {}
  };

  tasks.forEach(task => {
    const category = task.category;
    const deadline = new Date(task.deadline);
    const hour = deadline.getHours();
    const isCompleted = task.status === 'completed';

    // Track timing patterns
    if (!patterns.categoryTiming[category]) {
      patterns.categoryTiming[category] = [];
    }
    patterns.categoryTiming[category].push({
      hour,
      success: isCompleted,
      duration: task.duration
    });

    // Track success rates by hour
    const hourKey = `${hour}`;
    if (!patterns.successRates[hourKey]) {
      patterns.successRates[hourKey] = { total: 0, completed: 0 };
    }
    patterns.successRates[hourKey].total++;
    if (isCompleted) patterns.successRates[hourKey].completed++;
  });

  // Calculate optimal times
  const optimalTimes = {};
  Object.entries(patterns.categoryTiming).forEach(([category, data]) => {
    const successfulTasks = data.filter(t => t.success);
    if (successfulTasks.length > 0) {
      const avgHour = Math.round(
        successfulTasks.reduce((sum, t) => sum + t.hour, 0) / successfulTasks.length
      );
      const avgDuration = Math.round(
        successfulTasks.reduce((sum, t) => sum + t.duration, 0) / successfulTasks.length
      );
      optimalTimes[category] = { hour: avgHour, duration: avgDuration };
    }
  });

  return { patterns, optimalTimes };
};

/**
 * Suggest optimal scheduling details
 */
export const suggestScheduling = async ({
  title,
  description = '',
  currentPriority = '',
  currentCategory = '',
  historicalTasks = []
}) => {
  const analysis = analyzeHistoricalTasks(historicalTasks);
  const historicalContext = analysis ? `
    Historical patterns:
    ${Object.entries(analysis.optimalTimes).map(([category, data]) => 
      `${category}: Most successful at ${data.hour}:00, avg duration ${data.duration}min`
    ).join('\n')}
  ` : `
    No historical data available. Using default optimization rules:
    - High priority tasks: Schedule between 9AM-12PM (peak productivity)
    - Medium priority tasks: Schedule between 1PM-4PM (steady focus)
    - Low priority tasks: Schedule between 4PM-6PM (wind-down time)
    - Deep work tasks: Schedule between 10AM-2PM (maximum concentration)
    
    Duration guidelines:
    - Quick tasks: 15-30 minutes
    - Regular tasks: 30-60 minutes
    - Complex tasks: 60-90 minutes
    - Deep work: 90-120 minutes
  `;

  const messages = [
    {
      role: 'system',
      content: `You are a task scheduling optimizer with advanced scheduling logic.
      
      ${historicalContext}
      
      Task type indicators:
      - Meeting/call keywords: meet, sync, call, discuss, interview
      - Deep work keywords: develop, write, design, analyze, research
      - Quick task keywords: review, check, update, reply, send
      - Administrative keywords: organize, plan, schedule, arrange
      
      Priority criteria:
      HIGH: Time-critical, revenue-impact, client-facing, blocking others
      MEDIUM: Regular meetings, standard work, internal tasks
      LOW: Administrative, nice-to-have, long-term planning
      
      Instructions:
      1. ${analysis ? 'Prefer historical patterns when available' : 'Analyze task type from title/description'}
      2. Consider task complexity and priority
      3. Optimize for typical workday patterns
      4. Account for task dependencies if mentioned
      5. Suggest practical duration based on task type
      
      Response format (exact JSON):
      {
        "suggestedTime": "HH:MM AM/PM",  // Must be in 12-hour format with AM/PM
        "suggestedDuration": number,
        "suggestedPriority": "low/medium/high",
        "suggestedCategory": "work/personal/health",
        "reasoning": "Brief explanation including optimization logic"
      }`
    },
    {
      role: 'user',
      content: `Schedule task:
      Title: ${title}
      ${description ? `Description: ${description}` : ''}
      ${currentPriority ? `Current priority: ${currentPriority}` : ''}
      ${currentCategory ? `Current category: ${currentCategory}` : ''}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, 0.7);
    if (typeof response === 'string') {
      try {
        const jsonMatch = response.match(/(\{.*\})/s);
        if (jsonMatch && jsonMatch[0]) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Convert time to 12-hour format if it's not already
          if (parsed.suggestedTime) {
            const timeMatch = parsed.suggestedTime.match(/(\d{1,2}):(\d{2})(?: ?(AM|PM))?/i);
            if (timeMatch) {
              let [_, hours, minutes, meridiem] = timeMatch;
              hours = parseInt(hours);
              
              // Convert to 12-hour format if meridiem is missing
              if (!meridiem) {
                meridiem = hours >= 12 ? 'PM' : 'AM';
                hours = hours > 12 ? hours - 12 : hours;
                hours = hours === 0 ? 12 : hours;
              }
              
              parsed.suggestedTime = `${hours}:${minutes.padStart(2, '0')} ${meridiem}`;
            }
          }
          
          // Normalize priority
          if (parsed.suggestedPriority) {
            parsed.suggestedPriority = parsed.suggestedPriority.toLowerCase();
            if (!['low', 'medium', 'high'].includes(parsed.suggestedPriority)) {
              parsed.suggestedPriority = 'medium';
            }
          }
          
          // Ensure valid duration
          if (parsed.suggestedDuration) {
            const allowedDurations = [15, 30, 45, 60, 90, 120];
            parsed.suggestedDuration = allowedDurations.reduce((prev, curr) => 
              Math.abs(curr - parsed.suggestedDuration) < Math.abs(prev - parsed.suggestedDuration) ? curr : prev
            );
          }
          
          return parsed;
        }
      } catch (error) {
        console.error('Error parsing scheduling suggestion:', error);
      }
    }
    return {};
  } catch (error) {
    console.error('Error getting scheduling suggestions:', error);
    return {};
  }
};
