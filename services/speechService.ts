// Add a reference to the DOM library to make global browser types available to TypeScript.
/// <reference lib="dom" />

// Fix for TypeScript errors: 'Cannot find name SpeechRecognition', 'SpeechRecognitionEvent', 'SpeechRecognitionErrorEvent'.
// These declarations augment the global scope, providing types that might not be picked up
// correctly by the TypeScript compiler from the 'dom' lib in some environments.
declare global {
  // Minimal definition for SpeechRecognition interface
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null; // `onend` usually takes a generic Event
    start(): void;
    stop(): void;
  }

  // Constructor type for SpeechRecognition
  interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
    prototype: SpeechRecognition;
  }

  // Minimal definition for SpeechRecognitionEvent
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  // Minimal definition for SpeechRecognitionErrorEvent
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }

  // Augment the Window interface to include SpeechRecognition (and webkit-prefixed version)
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }

  // Minimal definitions for dependent types to satisfy SpeechRecognitionEvent and SpeechRecognitionErrorEvent
  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    readonly length: number;
  }

  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
    readonly length: number;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  type SpeechRecognitionErrorCode =
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported';

  // SpeechGrammarList is also a dependency of SpeechRecognition,
  // but it's not directly used in the provided code's logic (only for `grammars` property).
  // Keeping it minimal.
  interface SpeechGrammarList {}
}

/**
 * Service for handling Web Speech API functionalities:
 * 1. Speech-to-Text (STT) using SpeechRecognition.
 * 2. Text-to-Speech (TTS) using SpeechSynthesis.
 */
class SpeechService {
  private speechRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis = window.speechSynthesis;
  // Default language set to Hindi (India) based on user's example query "Charger kaha hai?"
  // In a real application, this could be user-configurable or dynamically detected.
  private defaultLang: string = 'hi-IN';

  constructor() {
    // Check for SpeechRecognition API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false; // Only get one result per recognition
      this.speechRecognition.interimResults = false; // Only return final results
      this.speechRecognition.lang = this.defaultLang; // Set default language
    } else {
      console.warn("SpeechService: SpeechRecognition API not supported in this browser.");
    }
  }

  /**
   * Prompts the user for speech input and converts it to text.
   * Requires microphone permission.
   * @returns A promise that resolves with the transcribed text, or rejects if an error occurs or no speech is detected.
   */
  public async listenForSpeech(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognition) {
        reject("SpeechRecognition API not available.");
        return;
      }

      // Ensure language is set before starting
      this.speechRecognition.lang = this.defaultLang;

      this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log("SpeechRecognition result:", transcript);
        resolve(transcript);
      };

      this.speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("SpeechRecognition error:", event.error);
        reject(`Speech recognition error: ${event.error}`);
      };

      this.speechRecognition.onend = () => {
        console.log("SpeechRecognition ended.");
      };

      try {
        this.speechRecognition.start();
        console.log("SpeechRecognition started. Listening...");
      } catch (e: any) {
        console.error("Error starting speech recognition:", e);
        reject(`Error starting speech recognition: ${e.message}`);
      }
    });
  }

  /**
   * Converts text to speech and plays it.
   * @param text The text to be spoken.
   * @param lang The language to use (e.g., 'en-US', 'hi-IN'). Defaults to 'hi-IN'.
   */
  public speak(text: string, lang: string = this.defaultLang): void {
    if (!this.speechSynthesis) {
      console.warn("SpeechSynthesis API not supported in this browser.");
      return;
    }

    // Stop any ongoing speech before starting a new one.
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; // Set the language for the utterance.
    utterance.pitch = 1;   // Default pitch.
    utterance.rate = 1;    // Default rate.

    // Optional: Find a specific voice if needed
    // const voices = this.speechSynthesis.getVoices();
    // utterance.voice = voices.find(voice => voice.lang === lang) || null;

    this.speechSynthesis.speak(utterance);
    console.log("Speaking:", text);
  }

  /**
   * Stops any ongoing speech.
   */
  public stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  /**
   * Checks if the browser supports SpeechRecognition API.
   * @returns True if supported, false otherwise.
   */
  public isSpeechRecognitionSupported(): boolean {
    return this.speechRecognition !== null;
  }

  /**
   * Checks if the browser supports SpeechSynthesis API.
   * @returns True if supported, false otherwise.
   */
  public isSpeechSynthesisSupported(): boolean {
    return this.speechSynthesis !== null;
  }
}

// Export a singleton instance of the SpeechService.
export const speechService = new SpeechService();