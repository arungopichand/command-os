import { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceCommandOptions {
  onCommand: (command: string) => void;
  enabled?: boolean;
}

export function useVoiceCommands({ onCommand, enabled = true }: VoiceCommandOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase().trim();
        setTranscript(text);
        onCommand(text);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, [onCommand]);

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
