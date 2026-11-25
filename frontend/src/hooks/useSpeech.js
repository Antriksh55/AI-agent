/**
 * useSpeech Hook – Browser Web Speech API
 *
 * Provides speech recognition (STT) and speech synthesis (TTS).
 *
 * ⚠️  BROWSER COMPATIBILITY:
 *   - Chrome/Edge: Full support for both STT and TTS
 *   - Firefox: TTS supported, STT limited (requires flag)
 *   - Safari: Partial support
 *   - Mobile Chrome: STT supported
 *
 * This is NOT telephony-grade streaming STT/TTS.
 * It uses the browser's built-in Web Speech API.
 * For production, replace with Deepgram, AssemblyAI, or Google Cloud Speech.
 */

import { useState, useEffect, useRef, useCallback } from "react";

export function useSpeech({ language = "en-IN", onTranscript, autoSend = true }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechRate, setSpeechRate] = useState(1.0);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // ── Feature detection ────────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setSttSupported(!!SpeechRecognition);
    setTtsSupported(!!window.speechSynthesis);

    if (window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // ── Language code mapping ────────────────────────────────────────────────
  const langCode = {
    en: "en-IN",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN",
    mr: "mr-IN",
  }[language] || "en-IN";

  // ── STT ──────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Stop TTS if speaking
    if (synthRef.current) synthRef.current.cancel();

    const rec = new SpeechRecognition();
    rec.lang = langCode;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => { setIsListening(true); setPermissionError(null); };
    rec.onend = () => setIsListening(false);
    rec.onerror = (e) => {
      setIsListening(false);
      if (e.error === "not-allowed") {
        setPermissionError("Microphone permission denied. Please allow mic access and try again.");
      } else if (e.error === "no-speech") {
        setPermissionError("No speech detected. Please speak clearly.");
      } else {
        setPermissionError(`Speech recognition error: ${e.error}`);
      }
    };

    rec.onresult = (e) => {
      const result = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(result);

      if (e.results[e.results.length - 1].isFinal) {
        if (onTranscript) onTranscript(result);
        setTranscript("");
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch {
      setPermissionError("Could not start microphone. Try again.");
    }
  }, [langCode, onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
  }, []);

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speak = useCallback(
    (text) => {
      if (!window.speechSynthesis || !text) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = speechRate;

      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [langCode, selectedVoice, speechRate]
  );

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    sttSupported,
    ttsSupported,
    permissionError,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    speechRate,
    setSpeechRate,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
