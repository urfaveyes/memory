import { Item } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';

/**
 * Service for interacting with the browser's localStorage.
 * Provides methods to manage a collection of Item objects.
 */
class StorageService {

  /**
   * Retrieves all stored items from localStorage.
   * @returns An array of Item objects, or an empty array if no items are found or an error occurs.
   */
  public getItems(): Item[] {
    try {
      const itemsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      return itemsJson ? JSON.parse(itemsJson) : [];
    } catch (error) {
      console.error("StorageService: Error getting items from localStorage:", error);
      return []; // Return empty array on error to prevent app crash
    }
  }

  /**
   * Saves an array of items to localStorage.
   * @param items The array of Item objects to save.
   */
  private saveItems(items: Item[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("StorageService: Error saving items to localStorage:", error);
      // In a real app, might notify user of storage failure.
    }
  }

  /**
   * Adds a new item to localStorage.
   * @param newItem The Item object to add.
   */
  public addItem(newItem: Item): void {
    const items = this.getItems();
    items.push(newItem);
    this.saveItems(items);
  }

  /**
   * Retrieves a single item by its ID.
   * @param id The ID of the item to retrieve.
   * @returns The Item object if found, otherwise undefined.
   */
  public getItemById(id: string): Item | undefined {
    const items = this.getItems();
    return items.find(item => item.id === id);
  }

  /**
   * Deletes an item by its ID.
   * @param id The ID of the item to delete.
   */
  public deleteItem(id: string): void {
    let items = this.getItems();
    items = items.filter(item => item.id !== id);
    this.saveItems(items);
  }
}

// Export a singleton instance of the StorageService.
export const storageService = new StorageService();
