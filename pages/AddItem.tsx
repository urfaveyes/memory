import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import Button from '../components/Button';
import Input from '../components/Input';
import ImageUpload from '../components/ImageUpload';
import VoiceRecorder from '../components/VoiceRecorder';
import { storageService } from '../services/storageService';
import { Item } from '../types';

/**
 * AddItem component allows users to add new items to their memory.
 * It provides fields for item name, location, and optional photo and voice note uploads.
 */
const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [itemName, setItemName] = useState('');
  const [location, setLocation] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [voiceNoteBase64, setVoiceNoteBase64] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ itemName?: string; location?: string }>({});

  // Handles saving the new item to local storage.
  const handleSaveItem = async () => {
    setLoading(true);
    setErrors({}); // Clear previous errors

    // Basic validation
    const newErrors: { itemName?: string; location?: string } = {};
    if (!itemName.trim()) {
      newErrors.itemName = 'Item Name is required.';
    }
    if (!location.trim()) {
      newErrors.location = 'Location description is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const newItem: Item = {
      id: uuidv4(), // Generate a unique ID for the item
      name: itemName.trim(),
      location: location.trim(),
      photoBase64: photoBase64,
      voiceNoteBase64: voiceNoteBase64,
      timestamp: new Date().toISOString(), // Store current timestamp
    };

    try {
      storageService.addItem(newItem);
      console.log('Item saved:', newItem);
      navigate('/'); // Navigate back to the home screen after saving
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-b-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Add New Item</h2>

      <Input
        id="itemName"
        label="Item Name"
        placeholder="e.g., Charger, Keys, Documents"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        error={errors.itemName}
      />

      <Input
        id="location"
        label="Exact Location Description"
        placeholder="e.g., Bed ke left drawer me, On the kitchen counter"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        error={errors.location}
      />

      <ImageUpload
        onImageChange={setPhotoBase64}
        currentImage={photoBase64}
        label="Upload Photo (Optional)"
      />

      <VoiceRecorder
        onRecordingComplete={setVoiceNoteBase64}
        currentVoiceNote={voiceNoteBase64}
        label="Record Voice Note (Optional)"
      />

      <Button onClick={handleSaveItem} disabled={loading} fullWidth className="mt-6">
        {loading ? 'Saving...' : 'Save Item'}
      </Button>
    </div>
  );
};

export default AddItem;
