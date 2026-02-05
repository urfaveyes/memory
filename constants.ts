// Key used to store item data in browser's localStorage.
export const LOCAL_STORAGE_KEY = 'memoryAssistantItems';

// Gemini model name used for extracting item names from user queries.
export const GEMINI_MODEL_TEXT_EXTRACT = 'gemini-3-flash-preview';

// System instruction for Gemini to help it extract item names effectively.
// Emphasize extracting the core, concise item name, ignoring filler words.
export const GEMINI_SYSTEM_INSTRUCTION_EXTRACT = `You are an expert at identifying the core item name from a user's question about item location.
Your goal is to extract only the most relevant, concise noun or short phrase that refers to the item being asked about.
Ignore conversational filler, articles (like "a", "the"), possessives (like "my", "your"), or location-specific words unless they are part of the item's inherent name.
Always return the most generic and canonical form of the item name if possible.

For example:
- If the user asks "Where is my phone charger?", extract "phone charger".
- If the user asks "Did I leave my keys somewhere?", extract "keys".
- If the user asks "Charger kaha hai?", extract "Charger".
- If the user asks "I need my important documents, where are they?", extract "important documents".
- If the user asks "What about the remote for the TV?", extract "remote".
- If the user asks "My blue pen, where is it?", extract "blue pen".
- If the user asks "Where is the car key?", extract "car key".

Always respond with a JSON object containing a single key "itemName" and its value.`;