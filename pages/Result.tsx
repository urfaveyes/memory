import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Item } from '../types';
import { storageService } from '../services/storageService';
import { speechService } from '../services/speechService';
import { geminiService } from '../services/geminiService';
import Button from '../components/Button';
import { MdPlayArrow, MdMic, MdStop } from 'react-icons/md'; // React Icons for play and mic

/**
 * Result component displays either the details of a specific item (if an ID is provided)
 * or acts as a voice assistant to search for items.
 */
const Result: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Optional item ID from URL
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [isAssistantMode, setIsAssistantMode] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);


  // Effect to determine mode (item detail or assistant) and load data.
  useEffect(() => {
    // Initial microphone permission check for assistant mode
    const checkMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop tracks immediately
        setMicrophoneError(null);
      } catch (error) {
        console.warn('Microphone permission not granted:', error);
        setMicrophoneError('Microphone permission denied. Please enable it to use voice assistant.');
        setAssistantResponse('Microphone permission denied. Please enable it to use voice assistant.');
      }
    };

    if (id) {
      // Item detail mode
      const foundItem = storageService.getItemById(id);
      if (foundItem) {
        setItem(foundItem);
        setIsAssistantMode(false);
        setMicrophoneError(null); // Clear mic error if in item detail mode
      } else {
        setAssistantResponse('Item not found.');
        navigate('/'); // Redirect to home if item ID is invalid
      }
    } else {
      // Voice assistant mode
      setIsAssistantMode(true);
      setAssistantResponse('Tap the mic and ask me where your item is.');
      checkMicrophonePermission(); // Check mic permission
    }

    // Clean up audio player on component unmount
    return () => {
      speechService.stopSpeaking(); // Stop any ongoing TTS
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeAttribute('src'); // Clear audio source
        setAudioPlayer(null);
      }
    };
  }, [id, navigate, audioPlayer]);

  // Function to process user's voice query in assistant mode.
  const processVoiceQuery = useCallback(async () => {
    // Check mic permission again before starting, in case it changed
    if (microphoneError) {
      alert(microphoneError);
      return;
    }

    setLoading(true);
    setIsListening(true);
    setAssistantResponse('Listening...');
    speechService.stopSpeaking(); // Ensure no previous speech is playing

    try {
      const transcript = await speechService.listenForSpeech();
      console.log('Voice Assistant: Raw transcript from speech:', transcript); // Log transcript
      setAssistantResponse(`You said: "${transcript}"\nSearching...`);

      // 1. Extract item name using Gemini API
      const extractedItemName = await geminiService.extractItemName(transcript);
      console.log('Voice Assistant: Extracted item name by Gemini:', extractedItemName); // Log extracted name

      if (!extractedItemName || extractedItemName.trim() === '') {
        const responseText = 'Sorry, I couldn\'t identify the item you\'re looking for from your question. Could you please be more specific?';
        setAssistantResponse(responseText);
        speechService.speak(responseText);
        setItem(null); // Ensure no old item is displayed
        setIsAssistantMode(true); // Stay in assistant mode
        return;
      }

      // 2. Search local storage for the extracted item name
      const allItems = storageService.getItems();
      console.log('Voice Assistant: All stored item names:', allItems.map(i => i.name)); // Log all stored items

      // Simple case-insensitive match for the extracted item name
      const foundItem = allItems.find(
        // Check if the item's name contains the extracted name, or vice versa
        (i) => i.name.toLowerCase().includes(extractedItemName.toLowerCase()) ||
               extractedItemName.toLowerCase().includes(i.name.toLowerCase())
      );

      if (foundItem) {
        console.log('Voice Assistant: Item found:', foundItem.name); // Log found item
        setItem(foundItem); // Display the found item's details
        const responseText = `Your ${foundItem.name} is located at: ${foundItem.location}.`;
        setAssistantResponse(responseText);
        speechService.speak(responseText);
        setIsAssistantMode(false); // Switch to item detail view after finding it
      } else {
        console.log('Voice Assistant: Item not found for extracted name:', extractedItemName); // Log not found
        setItem(null); // Clear previous item if not found
        const responseText = `Sorry, a memory for "${extractedItemName}" is not available. Please try adding it first.`;
        setAssistantResponse(responseText);
        speechService.speak(responseText);
        setIsAssistantMode(true); // Stay in assistant mode to allow new queries
      }
    } catch (error) {
      setItem(null); // Clear previous item if error occurs
      const errorText = `Error processing your request. Please ensure your microphone is working and try again.`;
      setAssistantResponse(errorText);
      speechService.speak(errorText);
      console.error('Voice assistant error:', error);
    } finally {
      setIsListening(false);
      setLoading(false);
    }
  }, [microphoneError]); // useCallback to memoize the function, dependent on microphoneError

  // Function to play the stored voice note (Base64 audio).
  const playVoiceNote = () => {
    if (item?.voiceNoteBase64) {
      // Stop any existing audio first
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.removeAttribute('src');
      }

      const audio = new Audio(`data:audio/webm;base64,${item.voiceNoteBase64}`);
      audio.play().catch(e => console.error("Error playing voice note:", e));
      setAudioPlayer(audio); // Keep track of the current audio player
    }
  };

  return (
    <div className="p-4 bg-white rounded-b-lg shadow-md flex flex-col items-center text-center">
      {isAssistantMode ? (
        // Voice Assistant UI
        <>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Voice Assistant</h2>
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-lg mb-6 p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{assistantResponse}</p>
          </div>

          <Button
            onClick={isListening ? () => { /* no-op during listening */ } : processVoiceQuery}
            disabled={loading || !speechService.isSpeechRecognitionSupported() || !!microphoneError}
            className={`w-24 h-24 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500' : 'bg-blue-600'} text-white text-5xl transition-colors duration-300`}
            style={{ marginBottom: '1rem' }}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <MdStop /> : <MdMic />}
          </Button>
          {!speechService.isSpeechRecognitionSupported() && (
            <p className="text-red-600 text-sm mt-2">Speech Recognition not supported by your browser.</p>
          )}
          {microphoneError && (
            <p className="text-red-600 text-sm mt-2">{microphoneError}</p>
          )}
          {loading && <p className="text-blue-600 mt-2">Processing...</p>}
        </>
      ) : (
        // Item Detail UI
        item && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{item.name}</h2>
            {item.photoBase64 && (
              <div className="w-full max-w-xs h-48 overflow-hidden rounded-lg mb-4 shadow-md">
                <img src={item.photoBase64} alt={item.name} className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-gray-700 text-lg mb-4">{item.location}</p>
            <p className="text-gray-500 text-sm mb-6">
              Added: {new Date(item.timestamp).toLocaleString()}
            </p>

            {item.voiceNoteBase64 && (
              <Button onClick={playVoiceNote} variant="secondary" className="mb-4 flex items-center" aria-label={`Play voice note for ${item.name}`}>
                <MdPlayArrow className="mr-2" /> Play Voice Note
              </Button>
            )}

            {/* If we came from assistant mode and found an item, offer to ask again */}
            {id === undefined && (
              <Button onClick={() => { setItem(null); setIsAssistantMode(true); setAssistantResponse('Tap the mic and ask me where your item is.'); }} variant="primary" className="mt-4">
                Ask Another Question
              </Button>
            )}
          </>
        )
      )}
    </div>
  );
};

export default Result;