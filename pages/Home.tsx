import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ItemCard from '../components/ItemCard';
import { storageService } from '../services/storageService';
import { Item } from '../types';

/**
 * Home component serves as the main screen of the application.
 * It displays a list of saved items and provides navigation to add new items or use the voice assistant.
 */
const Home: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to load items from local storage.
  const loadItems = useCallback(() => {
    setLoading(true);
    const storedItems = storageService.getItems();
    // Sort items by timestamp in descending order (most recent first)
    storedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setItems(storedItems);
    setLoading(false);
  }, []); // Empty dependency array means this function is created once.

  // Load items when the component mounts and whenever the browser history changes (e.g., navigating back).
  useEffect(() => {
    loadItems();
    // Re-load items if localStorage changes (simulated by a custom event or focusing window)
    const handleStorageChange = () => loadItems();
    window.addEventListener('storage', handleStorageChange);
    // You might also want to reload on window focus to catch changes from other tabs/windows
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [loadItems]); // Rerun effect if loadItems callback identity changes (it won't in this case due to useCallback)

  // Navigate to the Add Item screen.
  const handleAddItem = () => {
    navigate('/add');
  };

  // Navigate to the Result screen for voice assistant mode.
  const handleAskMemory = () => {
    navigate('/result'); // No item ID means voice assistant mode
  };

  // Handler for deleting an item.
  const handleDeleteItem = (id: string) => {
    storageService.deleteItem(id);
    loadItems(); // Reload items to update the list
  };

  return (
    <div className="p-4 bg-white rounded-b-lg shadow-md flex flex-col">
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
        <Button onClick={handleAddItem} fullWidth>
          Add New Item
        </Button>
        <Button onClick={handleAskMemory} variant="secondary" fullWidth>
          Ask Memory (Voice)
        </Button>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Saved Items</h2>

      {loading ? (
        <p className="text-gray-600 text-center">Loading items...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 text-center">No items saved yet. Add your first item!</p>
      ) : (
        <div className="flex-grow">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
