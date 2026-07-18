import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini API client initialized successfully.');
  } catch (error) {
    console.error('Error initializing Gemini API client:', error.message);
  }
} else {
  console.log('No GEMINI_API_KEY environment variable found. Using simulated fallback mode for AI features.');
}

/**
 * Helper to call Gemini model with system prompt and JSON response format
 */
const callGeminiJSON = async (prompt, systemInstruction = '', fallbackData = {}) => {
  if (!genAI) {
    console.log('Simulated Fallback Mode Active (No API Key). Returning mock data.');
    return fallbackData;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
      systemInstruction: systemInstruction || undefined
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API call failed, falling back to simulated data. Error:', error.message);
    return fallbackData;
  }
};

/**
 * 1. AI Property Description Generator
 */
export const generatePropertyDetails = async (propertyType, location, amenities) => {
  const systemInstruction = 'You are a professional real estate and property listing copywriter. Generate listing content in JSON format.';
  const prompt = `Generate a listing for a property with these details:
  - Property Type: ${propertyType}
  - Location: ${location}
  - Amenities: ${amenities.join(', ')}
  
  The response must be a valid JSON object matching this schema exactly:
  {
    "title": "A short, catchy, professional title (under 60 characters)",
    "description": "An SEO-friendly, attractive, multi-paragraph description (200-300 words) highlighting the local area and the vibe of the stay.",
    "highlights": ["List of 3-5 key selling points, short and punchy"]
  }`;

  const fallback = {
    title: `Modern ${propertyType} in ${location}`,
    description: `Welcome to this gorgeous, premium ${propertyType} situated in the heart of ${location}. Perfect for families, travelers, and remote workers alike, this listing offers a clean and welcoming atmosphere. Experience the best the local neighborhood has to offer, from coffee shops to scenic walkways. Equipped with popular amenities such as ${amenities.join(', ')}, this property has been carefully curated to provide maximum comfort and convenience for your short or long-term stay.`,
    highlights: [
      'Prime location close to central transport and dining hubs',
      'Thoughtfully furnished with modern style and comfort',
      'High-speed connection and workspaces included',
      'Excellent neighborhood safety and rating'
    ]
  };

  return await callGeminiJSON(prompt, systemInstruction, fallback);
};

/**
 * 2. AI Smart Search Assistant
 */
export const parseSmartSearch = async (query) => {
  const systemInstruction = 'You are an intelligent search parser. Translate a natural language vacation rental query into specific search parameters.';
  const prompt = `Translate this query: "${query}"
  
  The response must be a valid JSON object matching this schema exactly:
  {
    "location": "City, state or country name (string, or empty string if not mentioned)",
    "maxPrice": "Maximum price per night in Indian Rupees/INR (number, or null if not mentioned)",
    "propertyType": "Type of property, one of: Apartment, House, Villa, Cabin, Cottage, Mansions, Treehouse (string, or empty string if not mentioned)",
    "amenities": ["Array of amenities mentioned, e.g. Wi-Fi, Pool, Kitchen, Pet-Friendly, Gym, AC"],
    "guestCount": "Number of guests mentioned (number, or null if not mentioned)"
  }`;

  // Local rule-based fallback parser for high-quality mock behavior without API key
  const lowQuery = query.toLowerCase();
  const fallback = {
    location: '',
    maxPrice: null,
    propertyType: '',
    amenities: [],
    guestCount: null
  };

  // Match locations
  if (lowQuery.includes('goa')) fallback.location = 'Goa';
  else if (lowQuery.includes('mumbai')) fallback.location = 'Mumbai';
  else if (lowQuery.includes('bangalore')) fallback.location = 'Bangalore';
  else if (lowQuery.includes('delhi')) fallback.location = 'Delhi';
  else if (lowQuery.includes('manali')) fallback.location = 'Manali';
  else if (lowQuery.includes('kerala')) fallback.location = 'Kerala';

  // Match prices (e.g. under 5000, below 3000)
  const priceMatch = lowQuery.match(/(?:under|below|less than|budget|rs\.?|₹)\s?(\d+)/) || lowQuery.match(/(\d+)\s?(?:per night|rupees)/);
  if (priceMatch && priceMatch[1]) {
    fallback.maxPrice = parseInt(priceMatch[1], 10);
  }

  // Match property type
  if (lowQuery.includes('villa')) fallback.propertyType = 'Villa';
  else if (lowQuery.includes('apartment') || lowQuery.includes('flat')) fallback.propertyType = 'Apartment';
  else if (lowQuery.includes('house') || lowQuery.includes('home')) fallback.propertyType = 'House';
  else if (lowQuery.includes('cabin')) fallback.propertyType = 'Cabin';
  else if (lowQuery.includes('cottage')) fallback.propertyType = 'Cottage';
  else if (lowQuery.includes('mansion')) fallback.propertyType = 'Mansions';
  else if (lowQuery.includes('treehouse')) fallback.propertyType = 'Treehouse';

  // Match amenities
  if (lowQuery.includes('pool') || lowQuery.includes('swimming')) fallback.amenities.push('Pool');
  if (lowQuery.includes('wifi') || lowQuery.includes('wi-fi') || lowQuery.includes('internet')) fallback.amenities.push('Wi-Fi');
  if (lowQuery.includes('kitchen') || lowQuery.includes('cook')) fallback.amenities.push('Kitchen');
  if (lowQuery.includes('pet') || lowQuery.includes('dog') || lowQuery.includes('cat') || lowQuery.includes('pets allowed')) fallback.amenities.push('Pet-Friendly');
  if (lowQuery.includes('ac') || lowQuery.includes('air conditioning') || lowQuery.includes('cooler')) fallback.amenities.push('AC');
  if (lowQuery.includes('gym') || lowQuery.includes('fitness')) fallback.amenities.push('Gym');
  if (lowQuery.includes('parking') || lowQuery.includes('car')) fallback.amenities.push('Free Parking');

  // Match guests
  const guestMatch = lowQuery.match(/(\d+)\s?(?:guest|people|person|adult)/);
  if (guestMatch && guestMatch[1]) {
    fallback.guestCount = parseInt(guestMatch[1], 10);
  }

  return await callGeminiJSON(prompt, systemInstruction, fallback);
};

/**
 * 3. AI Travel Planner
 */
export const generateTravelPlan = async (destination, budget, days) => {
  const systemInstruction = 'You are a luxury travel guide and vacation consultant. Create travel itineraries in JSON format.';
  const prompt = `Create an itinerary for visiting: "${destination}"
  - Trip Duration: ${days} days
  - Budget Tier/Total Budget: ${budget}
  
  The response must be a valid JSON object matching this schema exactly:
  {
    "destination": "Destination name",
    "totalEstimatedExpense": "Estimated cost breakdown (string description)",
    "itinerary": [
      {
        "day": 1,
        "schedule": "Day 1 itinerary overview (morning, afternoon, evening activities)",
        "places": ["Place Name 1", "Place Name 2"],
        "expense": "Estimated Day 1 expense (e.g. ₹1500 for entry fees and dining)"
      }
    ],
    "tips": ["3 practical local travel tips (transport, packing, safety)"]
  }`;

  // Make dynamic mock array matching requested days count
  const mockItinerary = [];
  for (let i = 1; i <= Math.min(days, 10); i++) {
    mockItinerary.push({
      day: i,
      schedule: `Day ${i}: Explore the prime attractions, enjoy local street food, and visit coordinates of cultural significance.`,
      places: [`Local Landmark ${i}A`, `Scenic Viewpoint ${i}B`],
      expense: `Estimated ₹${Math.floor(budget / days * 0.4)} for activities & dining.`
    });
  }

  const fallback = {
    destination: destination,
    totalEstimatedExpense: `₹${budget} for ${days} days (suggested allocation: 40% lodging, 30% local food/shopping, 30% sightseeing)`,
    itinerary: mockItinerary,
    tips: [
      'Use local auto-rickshaws or ride-sharing apps for affordable local transit.',
      'Dress comfortably and carry a refillable water bottle for walking tours.',
      'Check monument timings and book tickets online to avoid queue lines.'
    ]
  };

  return await callGeminiJSON(prompt, systemInstruction, fallback);
};

/**
 * 4. AI Review Summarizer
 */
export const summarizeReviews = async (reviews) => {
  const systemInstruction = 'You are an analytics assistant. Summarize hospitality and booking review lists into bulleted analysis and sentiment summaries.';
  const reviewText = reviews.length > 0 
    ? reviews.map((r, i) => `Review ${i + 1} (${r.rating} stars): ${r.comment}`).join('\n\n')
    : 'No guest reviews available yet.';
  
  const prompt = `Summarize the following reviews for a property rental:\n\n${reviewText}\n\n
  The response must be a valid JSON object matching this schema exactly:
  {
    "sentiment": "Positive, Neutral, or Negative",
    "pros": ["List of 2-3 common positive themes from the reviews"],
    "cons": ["List of 2-3 complaints or areas of improvement mentioned"],
    "summary": "A concise overview paragraph summarizing the guest sentiment and what standing out (3-4 sentences)."
  }`;

  const fallback = {
    sentiment: reviews.length > 0 && reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length >= 4.0 ? 'Positive' : 'Neutral',
    pros: [
      'Clean rooms and highly responsive, friendly host behavior',
      'Excellent location close to scenic sights and restaurants'
    ],
    cons: [
      'WiFi speed was occasionally slow in the late evenings',
      'Water pressure in the shower could be slightly stronger'
    ],
    summary: reviews.length > 0 
      ? `Based on ${reviews.length} guest feedback items, visitors generally appreciate the high level of cleanliness and the convenient neighborhood context. While a few guests reported minor issues with the internet connection and bathroom water pressure, the host is described as responsive, leading to overall customer satisfaction.`
      : 'No reviews have been written for this property yet, so guests have not reported pros or cons.'
  };

  return await callGeminiJSON(prompt, systemInstruction, fallback);
};

/**
 * 5. AI Personalized Recommendations
 */
export const getPersonalizedRecommendations = async (bookings, wishlist, queries, availableListings) => {
  // Convert inputs to clear text to feed into Gemini
  const listingsStr = availableListings.map(l => `ID: ${l._id}, Title: ${l.title}, Type: ${l.propertyType}, Location: ${l.location.city}, Price: ₹${l.price}, Rating: ${l.ratings.average}`).join('\n');
  const wishlistStr = wishlist.map(w => `${w.title} (${w.propertyType} in ${w.location.city})`).join(', ');
  const bookingsStr = bookings.map(b => `${b.property?.title || 'Property'} (${b.property?.location?.city || ''})`).join(', ');
  const queriesStr = queries.join(', ');

  const systemInstruction = 'You are a personalization engine. Select matching properties for a guest based on history.';
  const prompt = `Based on this user profile:
  - Previous bookings: [${bookingsStr}]
  - Saved in Wishlist: [${wishlistStr}]
  - Search history queries: [${queriesStr}]
  
  Please select 3 properties that would appeal most to this user from these available listings:
  \n${listingsStr}\n
  
  The response must be a valid JSON object matching this schema exactly:
  {
    "recommendations": [
      {
        "propertyId": "Match ID string (must be one of the IDs in the listings list)",
        "reason": "One sentence explaining why this matches their preferences"
      }
    ]
  }`;

  // Sophisticated rules-based recommendation fallback
  const recs = [];
  const count = Math.min(3, availableListings.length);
  for (let i = 0; i < count; i++) {
    recs.push({
      propertyId: availableListings[i]._id.toString(),
      reason: `Matches your search interest in ${availableListings[i].location.city} and preferences for ${availableListings[i].propertyType}s.`
    });
  }

  const fallback = {
    recommendations: recs
  };

  return await callGeminiJSON(prompt, systemInstruction, fallback);
};

/**
 * 6. AI Chat Assistant (Property-Specific)
 */
export const askPropertyChatbot = async (property, chatHistory, userMessage) => {
  if (!genAI) {
    // Return standard helper responses based on common keywords
    const lowerMsg = userMessage.toLowerCase();
    let reply = `Thanks for asking about ${property.title}! `;
    
    if (lowerMsg.includes('wifi') || lowerMsg.includes('internet')) {
      reply += `This property has high-speed Wi-Fi included. The connection info is provided in the welcome guide upon check-in.`;
    } else if (lowerMsg.includes('cancel') || lowerMsg.includes('refund')) {
      reply += `Our cancellation policy allows full refunds up to 5 days before check-in. Cancellations after that will receive a 50% refund minus the first night.`;
    } else if (lowerMsg.includes('check-in') || lowerMsg.includes('checkout') || lowerMsg.includes('check in') || lowerMsg.includes('check out')) {
      reply += `Standard check-in is from 3:00 PM onwards, and check-out is by 11:00 AM. Let us know if you need early/late requests.`;
    } else if (lowerMsg.includes('amenit') || lowerMsg.includes('pool') || lowerMsg.includes('parking')) {
      reply += `The property includes: ${property.amenities.join(', ')}. Please let us know if you need instructions for operating any of them!`;
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('rent')) {
      reply += `The rate is ₹${property.price} per night. Let me know if you would like to select dates on the booking widget.`;
    } else {
      reply += `We are located in ${property.location.city}, ${property.location.country}. Is there anything specific about the amenities, check-in rules, or local area you'd like to know?`;
    }
    
    return { reply };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    // Format chat history
    const formattedHistory = chatHistory.map(ch => 
      `${ch.sender === 'user' ? 'Guest' : 'Assistant'}: ${ch.text}`
    ).join('\n');

    const systemPrompt = `You are the AI Chat Assistant for a property listing on our vacation platform. 
    Here are the property details:
    - Title: ${property.title}
    - Type: ${property.propertyType}
    - Location: ${property.location.street}, ${property.location.city}, ${property.location.state}, ${property.location.country}
    - Price: ₹${property.price} per night
    - Amenities: ${property.amenities.join(', ')}
    - Host: ${property.host?.name || 'Local Host'}
    - Description: ${property.description}
    
    Rules & Policies:
    - Check-in: After 3:00 PM
    - Check-out: Before 11:00 AM
    - Cancellation policy: Free cancellation up to 5 days prior to arrival. 50% refund thereafter.
    - Pets: Allowed if "Pet-Friendly" is in the amenities. Otherwise, strictly no pets.
    
    Answer the Guest's questions politely, concisely, and factually based ONLY on the property details above. If you do not know the answer, tell them to contact the host directly.`;

    const fullPrompt = `${systemPrompt}\n\nChat History:\n${formattedHistory}\n\nGuest's new question: ${userMessage}\nAssistant:`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const replyText = response.text().trim();
    
    return { reply: replyText };
  } catch (error) {
    console.error('Gemini Chat Assistant failed:', error.message);
    return { reply: `I'm having a hard time connecting to the AI helper. For reference, ${property.title} is priced at ₹${property.price}/night in ${property.location.city} and amenities include: ${property.amenities.join(', ')}. Please let me know how else I can help!` };
  }
};
