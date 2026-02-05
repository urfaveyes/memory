import React, { useState, useRef } from 'react';
import Button from './Button';

// Props for the ImageUpload component.
interface ImageUploadProps {
  onImageChange: (base64Image: string | undefined) => void; // Callback when image changes.
  currentImage?: string; // Optional: Current image (Base64) to display.
  label?: string; // Optional label for the component.
}

/**
 * ImageUpload component allows users to select an image file,
 * displays a preview, and converts the image to a Base64 string.
 */
const ImageUpload: React.FC<ImageUploadProps> = ({ onImageChange, currentImage, label = "Upload Photo" }) => {
  const [previewImage, setPreviewImage] = useState<string | undefined>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handles file selection.
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit file size to 2MB
        alert('File size exceeds 2MB limit. Please choose a smaller image.');
        event.target.value = ''; // Clear the input
        setPreviewImage(undefined);
        onImageChange(undefined);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        onImageChange(base64String); // Pass Base64 string to parent
      };
      reader.readAsDataURL(file); // Read file as Data URL (Base64)
    } else {
      setPreviewImage(undefined);
      onImageChange(undefined);
    }
  };

  // Triggers the hidden file input when the button is clicked.
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Handles removing the current image.
  const handleRemoveImage = () => {
    setPreviewImage(undefined);
    onImageChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input element
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="file"
        accept="image/*" // Accept all image types
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden" // Hide the default file input
      />
      <div className="flex items-center space-x-2">
        <Button type="button" onClick={handleButtonClick} variant="secondary">
          Select Image
        </Button>
        {previewImage && (
          <Button type="button" onClick={handleRemoveImage} variant="danger">
            Remove Image
          </Button>
        )}
      </div>

      {previewImage && (
        <div className="mt-4 flex flex-col items-center">
          <img
            src={previewImage}
            alt="Image Preview"
            className="max-w-full h-40 object-cover rounded-md shadow-md"
          />
          <p className="mt-2 text-sm text-gray-500">Image Preview</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
