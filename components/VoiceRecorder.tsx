import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

// Props for the VoiceRecorder component.
interface VoiceRecorderProps {
  onRecordingComplete: (base64Audio: string | undefined) => void; // Callback when recording is done.
  currentVoiceNote?: string; // Optional: Current voice note (Base64) to play.
  label?: string; // Optional label for the component.
}

/**
 * VoiceRecorder component allows users to record audio,
 * play it back, and provides the recorded audio as a Base64 string.
 * Requires microphone permission.
 */
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, currentVoiceNote, label = "Record Voice Note" }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioURL, setRecordedAudioURL] = useState<string | undefined>(undefined);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    // Set initial audio URL if currentVoiceNote is provided.
    if (currentVoiceNote) {
      setRecordedAudioURL(`data:audio/webm;base64,${currentVoiceNote}`);
    } else {
      setRecordedAudioURL(undefined);
    }
  }, [currentVoiceNote]);

  // Request microphone permission on component mount.
  useEffect(() => {
    const requestPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop tracks immediately after getting permission
        setPermissionGranted(true);
      } catch (error) {
        console.error('Microphone permission denied or error:', error);
        setPermissionGranted(false);
      }
    };
    if (permissionGranted === null) {
      requestPermission();
    }
  }, [permissionGranted]);

  // Starts the audio recording.
  const startRecording = async () => {
    if (!permissionGranted) {
      alert('Microphone permission is required to record voice notes.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = []; // Clear previous chunks

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioURL(audioUrl);

        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1]; // Get only the base64 part
          onRecordingComplete(base64String); // Pass Base64 string to parent
        };

        // Stop all tracks from the stream to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please ensure microphone is available and permissions are granted.');
      setIsRecording(false);
    }
  };

  // Stops the audio recording.
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    console.log('Recording stopped.');
  };

  // Plays the recorded audio.
  const playRecording = () => {
    if (audioRef.current && recordedAudioURL) {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
  };

  // Removes the recorded audio.
  const removeRecording = () => {
    if (recordedAudioURL) {
      URL.revokeObjectURL(recordedAudioURL); // Clean up the object URL
      setRecordedAudioURL(undefined);
    }
    onRecordingComplete(undefined);
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-md">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {permissionGranted === false && (
        <p className="text-red-600 text-sm mb-2">Microphone permission denied. Cannot record voice notes.</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={isRecording ? stopRecording : startRecording} disabled={!permissionGranted} variant={isRecording ? 'danger' : 'primary'}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
        {recordedAudioURL && (
          <>
            <Button onClick={playRecording} variant="secondary">
              Play Voice Note
            </Button>
            <Button onClick={removeRecording} variant="danger">
              Remove Voice Note
            </Button>
          </>
        )}
      </div>

      {isRecording && (
        <p className="mt-2 text-sm text-blue-600">Recording... <span className="animate-pulse">🔴</span></p>
      )}

      {recordedAudioURL && (
        <audio ref={audioRef} src={recordedAudioURL} className="hidden" controls />
      )}
    </div>
  );
};

export default VoiceRecorder;
