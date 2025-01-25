import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableVideo from "./DraggableVideo";

const ScreenRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [transcription, setTranscription] = useState(""); // Store transcribed speech
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recognition, setRecognition] = useState(null); // SpeechRecognition instance
  const [position, setPosition] = useState({ x: 20, y: 20 }); // Position of draggable video
  const [size, setSize] = useState({ width: 150, height: 150 }); // Size of draggable video
  const [timer, setTimer] = useState(0); // Timer state
  const [intervalId, setIntervalId] = useState(null); // Interval for timer
  const webcamVideoRef = useRef(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.error("SpeechRecognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = true; // Continuous recognition
    speechRecognition.interimResults = true; // Capture interim results
    speechRecognition.lang = "en-US"; // Language for transcription
    setRecognition(speechRecognition);

    speechRecognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setTranscription(transcript); // Update transcription in real-time
    };

    speechRecognition.onerror = (err) => {
      console.error("SpeechRecognition error:", err);
    };

    speechRecognition.onend = () => {
      // Restart recognition if recording is still active
      if (isTranscribing) {
        speechRecognition.start();
      }
    };
  }, [isTranscribing]);

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
      if (recognition) {
        setIsTranscribing(true);
        recognition.start();
      }
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
    if (recognition) {
      recognition.stop();
      setIsTranscribing(false);
    }
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
      <div style={{ position: "relative", zIndex: 1000 }}>
        {/* Controls */}
        <div style={{ position: "absolute", top: "10px", left: "10px" }}>
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
            <span style={{ marginLeft: "10px", fontSize: "18px", fontWeight: "bold" }}>
              {formatTime(timer)}
            </span>
          )}
        </div>

        {/* Real-Time Transcription */}
          <div
            style={{
              width: "calc(100% - 20px)",
              background: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              zIndex: 1100,
            }}
          >
            <p style={{marginTop:100}}>{transcription || "Listening..."}</p>
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