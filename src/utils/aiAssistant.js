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

/**
 * Generate AI-powered suggestions for optimal free time slots
 * @param {array} tasks - User's tasks
 * @returns {Promise<Object>} - Free time suggestions with reasoning
 */
export const generateFreeTimeSuggestions = async (tasks) => {
  if (!tasks?.length) return { 
    slots: [], 
    focusWindow: null, 
    reasoning: "Not enough task data to generate suggestions."
  };

  // Analyze the tasks to find patterns and open slots
  const busyHours = {};
  const daysOfWeek = {};
  const today = new Date();
  
  // Track busy times from existing tasks
  tasks.forEach(task => {
    if (!task.endTime) return;
    
    try {
      // Extract hour from endTime
      const endTime = new Date(task.endTime);
      const hour = endTime.getHours();
      
      // Count occurrences by hour
      busyHours[hour] = (busyHours[hour] || 0) + 1;
      
      // Track day of week patterns
      const day = endTime.getDay();
      daysOfWeek[day] = (daysOfWeek[day] || 0) + 1;
    } catch (err) {
      // Skip invalid dates
    }
  });
  
  // Prepare data for AI analysis
  const workHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const hoursData = workHours.map(hour => ({
    hour,
    busy: busyHours[hour] || 0,
    timeString: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`
  })).sort((a, b) => a.busy - b.busy);

  // Find least busy hours for suggestions
  const freeSlots = hoursData
    .filter(h => h.busy < Math.max(...Object.values(busyHours)) / 2)
    .slice(0, 3)
    .map(h => h.timeString);
  
  // Find best deep focus window (2 consecutive hours with low activity)
  let bestWindow = null;
  let lowestBusy = Infinity;
  
  for (let i = 0; i < workHours.length - 1; i++) {
    const hour1 = workHours[i];
    const hour2 = workHours[i + 1];
    const totalBusy = (busyHours[hour1] || 0) + (busyHours[hour2] || 0);
    
    if (totalBusy < lowestBusy) {
      lowestBusy = totalBusy;
      bestWindow = {
        start: `${hour1 > 12 ? hour1 - 12 : hour1}${hour1 >= 12 ? 'PM' : 'AM'}`,
        end: `${hour2 > 12 ? hour2 - 12 : hour2}${hour2 >= 12 ? 'PM' : 'AM'}`
      };
    }
  }

  // Generate reason based on patterns
  let reasoning = '';
  if (Math.max(...Object.values(busyHours)) === 0) {
    reasoning = "You don't have many scheduled tasks yet. These time slots are standard productivity periods.";
  } else {
    const timeOfDay = freeSlots.length > 0 && freeSlots[0].includes('AM') ? 'mornings' : 'afternoons';
    reasoning = `Your ${timeOfDay} tend to be less busy, making them ideal for focused work.`;
  }

  return {
    slots: freeSlots,
    focusWindow: bestWindow ? `${bestWindow.start} - ${bestWindow.end}` : null,
    reasoning
  };
};

/**
 * Generate personalized behavior insights for the user based on task history
 * @param {array} tasks - User's tasks
 * @returns {Promise<Array>} - Personalized behavior insights
 */
export const generateBehaviorInsights = async (tasks) => {
  if (!tasks?.length || tasks.length < 5) {
    return [
      "Start adding more tasks to get personalized productivity insights.",
      "Complete a few more tasks to see AI-driven behavior analysis."
    ];
  }

  try {
    const messages = [
      {
        role: 'system',
        content: `You are an AI productivity analyst specialized in identifying behavioral patterns.
        
        Analyze task data to provide practical, actionable insights about the user's productivity habits.
        
        Guidelines:
        - Focus on patterns like time of day, day of week, completion rates, and category distribution
        - Provide exactly 2-3 short, specific, actionable insights (max 140 chars each)
        - Be positive but honest, highlighting both strengths and areas for improvement
        - Include exact percentages and specific times when relevant
        - Phrase as direct statements, not questions
        - Do not mention holidays, weekends, or specific calendar dates
        - Do not speculate on the user's personal life
        
        Insights should follow this format:
        - "You complete 75% more tasks in the morning hours (8-11AM). Schedule high-priority work then."
        - "Try reducing your meeting tasks by 30% on Tuesdays—your busiest day—to gain 2 hours of focus time."
        - "Health tasks have the highest completion rate (87%). Consider using similar approaches for work tasks."
        
        Return response as a JSON array containing 2-3 strings, with no other text:
        ["Insight one", "Insight two", "Insight three"]`
      },
      {
        role: 'user',
        content: `Here's my task data: ${JSON.stringify(
          tasks.map(task => ({
            category: task.category || 'uncategorized',
            status: task.status || 'pending',
            created: task.createdAt || null,
            completed: task.completedAt || null,
            deadline: task.deadline || null,
            endTime: task.endTime || null,
            priority: task.priority || 'medium'
          }))
        )}`
      }
    ];

    const response = await makeGroqRequest(messages, 0.7);
    
    if (typeof response === 'string') {
      try {
        // Try to parse as JSON array
        const jsonMatch = response.match(/(\[.*\])/s);
        if (jsonMatch && jsonMatch[0]) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 3); // Ensure max 3 insights
          }
        }
      } catch (error) {
        console.error('Error parsing behavior insights:', error);
      }
    }
    
    // Fallback insights if parsing fails
    return [
      "You tend to be more productive with tasks scheduled in the morning.",
      "Consider breaking large tasks into smaller subtasks for better completion rates."
    ];
  } catch (error) {
    console.error('Error generating behavior insights:', error);
    return [
      "Error generating insights. Try refreshing the page.",
      "Continue building your task history for better analysis."
    ];
  }
};
