// Interface for an Item stored in the memory assistant.
export interface Item {
  id: string; // Unique identifier for each item.
  name: string; // User-provided name of the item (e.g., "Charger", "Keys").
  location: string; // Detailed description of where the item is located.
  photoBase64?: string; // Optional: Base64 encoded string of an image of the item.
  voiceNoteBase64?: string; // Optional: Base64 encoded string of an audio recording (voice note).
  timestamp: string; // ISO 8601 string representing the date and time the item was added.
}

// Interface for the structured response expected from the Gemini model for item name extraction.
export interface ExtractedItemName {
  itemName: string; // The extracted item name from the user's query.
}