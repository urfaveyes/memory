import React from 'react';
import { Item } from '../types';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { storageService } from '../services/storageService';

// Props for the ItemCard component.
interface ItemCardProps {
  item: Item; // The item data to display.
  onDelete: (id: string) => void; // Callback function to handle item deletion.
}

/**
 * ItemCard component displays a single item with its name, location,
 * an optional image, and action buttons.
 */
const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete }) => {
  const navigate = useNavigate();

  // Handle click to view item details on the Result screen.
  const handleViewDetails = () => {
    navigate(`/result/${item.id}`);
  };

  // Handle item deletion.
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click when deleting
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      onDelete(item.id);
    }
  };

  return (
    <div
      onClick={handleViewDetails}
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-4"
    >
      {item.photoBase64 && (
        <div className="flex-shrink-0 w-24 h-24 sm:w-20 sm:h-20 overflow-hidden rounded-md">
          <img
            src={item.photoBase64}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-grow text-center sm:text-left">
        <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
        <p className="text-gray-600 text-sm mt-1">{item.location}</p>
        <p className="text-gray-500 text-xs mt-1">
          Added: {new Date(item.timestamp).toLocaleString()}
        </p>
      </div>
      <div className="flex-shrink-0 mt-3 sm:mt-0">
        <Button onClick={handleDelete} variant="danger" className="py-1 px-3 text-sm">
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ItemCard;
