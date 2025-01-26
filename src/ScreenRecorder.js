import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableVideo from "./DraggableVideo";

const ScreenRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [transcription, setTranscription] = useState(""); // Store transcribed speech
  const [isRecognitionRunning, setIsRecognitionRunning] = useState(false); // Track recognition status
  const [position, setPosition] = useState({ x: 20, y: 20 }); // Position of draggable video
  const [size, setSize] = useState({ width: 150, height: 150 }); // Size of draggable video
  const [timer, setTimer] = useState(0); // Timer state
  const [intervalId, setIntervalId] = useState(null); // Interval for timer
  const webcamVideoRef = useRef(null);
  const recognitionRef = useRef(null); // Store SpeechRecognition instance

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.error("SpeechRecognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Continuous recognition
    recognition.interimResults = true; // Capture interim results
    recognition.lang = "en-US"; // Language for transcription
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTranscription(transcript); // Update transcription in real-time
      console.log("Transcription updated:", transcript);
    };

    recognition.onerror = (err) => {
      console.error("SpeechRecognition error:", err);
    };

    recognition.onend = () => {
      // Restart recognition if still recording
      if (recording) {
        console.log("Speech recognition stopped. Restarting...");
        startSpeechRecognition();
      }
    };

    console.log("SpeechRecognition initialized.");
  }, [recording]);

  // Start SpeechRecognition
  const startSpeechRecognition = () => {
    if (recognitionRef.current && !isRecognitionRunning) {
      try {
        console.log("Starting SpeechRecognition...");
        recognitionRef.current.start();
        setIsRecognitionRunning(true);
      } catch (err) {
        console.error("Error starting SpeechRecognition:", err);
        setIsRecognitionRunning(false);
      }
    }
  };

  // Stop SpeechRecognition
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      console.log("Stopping SpeechRecognition...");
      recognitionRef.current.stop();
      setIsRecognitionRunning(false);
    }
  };

  // Start recording and transcription
  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = webcamStream;
      }

      const combinedStream = new MediaStream([
        ...screenStream.getTracks(),
        ...webcamStream.getTracks(),
      ]);

      const recorder = new MediaRecorder(combinedStream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.start();
      setRecording(true);

      // Start timer
      const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
      setIntervalId(id);

      // Start speech recognition
      startSpeechRecognition();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop recording and transcription
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setRecording(false);

    // Stop timer
    clearInterval(intervalId);
    setIntervalId(null);
    setTimer(0); // Reset timer

    // Stop speech recognition
    stopSpeechRecognition();
  };

  const saveRecording = () => {
    if (recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Format time for display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "20px" }}>
        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px",zIndex:2000 }}>
          <button onClick={startRecording} disabled={recording}>
            Start Recording
          </button>
          <button onClick={stopRecording} disabled={!recording}>
            Stop Recording
          </button>
          <button onClick={saveRecording} disabled={recordedChunks.length === 0}>
            Save Recording
          </button>
          {/* Timer */}
          {recording && (
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              {formatTime(timer)}
            </span>
          )}
        </div>

        {/* Real-Time Transcription */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            overflowY: "auto",
            maxHeight: "150px",
            flex: "1",
          }}
        >
          <p>{transcription || "Listening..."}</p>
        </div>

        {/* Draggable Video */}
        <DraggableVideo
          videoRef={webcamVideoRef}
          position={position}
          setPosition={setPosition}
          size={size}
          setSize={setSize}
          isFullscreen={false}
          toggleFullscreen={() => {}}
        />
      </div>
    </DndProvider>
  );
};

export default ScreenRecorder;