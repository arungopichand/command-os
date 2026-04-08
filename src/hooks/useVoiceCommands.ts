import { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceCommandOptions {
  onCommand: (command: string) => void;
  enabled?: boolean;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultLike[];
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

export function useVoiceCommands({ onCommand, enabled = true }: VoiceCommandOptions) {
  const SpeechRecognitionCtor =
    (window as SpeechRecognitionWindow).SpeechRecognition ||
    (window as SpeechRecognitionWindow).webkitSpeechRecognition;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const supported = Boolean(SpeechRecognitionCtor);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (SpeechRecognitionCtor) {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase().trim();
        setTranscript(text);
        onCommand(text);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [SpeechRecognitionCtor, onCommand]);

  const startListening = useCallback(() => {
    if (!enabled || !supported || !recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    } catch (e) {
      console.warn('Voice recognition error:', e);
    }
  }, [enabled, supported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return { isListening, transcript, supported, startListening, stopListening };
}
