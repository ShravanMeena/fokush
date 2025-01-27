import React, { useState, useRef, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableVideo from "./DraggableVideo";
import MicRecorder from "mic-recorder-to-mp3";
import axios from "axios";

const ScreenRecorder = ({setTranscriptionFinal}) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [transcription, setTranscription] = useState("");
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const [position, setPosition] = useState({ x: 20, y: 20 }); // Draggable position
  const [size, setSize] = useState({ width: 150, height: 150 }); // Resizable size
  const [isFullscreen, setIsFullscreen] = useState(false); // Fullscreen toggle

  const webcamVideoRef = useRef(null);
  const recorder = useRef(null);

  useEffect(() => {
    if(transcription){
      setTranscriptionFinal(transcription)

    }
  }, [transcription])
  
  // Initialize MicRecorder
  useEffect(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
  }, []);

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true , audio: true });
      const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = webcamStream;
      }

      const combinedStream = new MediaStream([
        ...screenStream.getTracks(),
        ...webcamStream.getTracks(),
      ]);

      const recorderInstance = new MediaRecorder(combinedStream);
      setMediaRecorder(recorderInstance);

      recorderInstance.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      recorderInstance.start();
      setRecording(true);

      const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
      setIntervalId(id);

      recorder.current.start();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setRecording(false);

    clearInterval(intervalId);
    setIntervalId(null);
    setTimer(0);

    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "audio.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        });
        setAudioFile(file);
        submitAudio(file);
      })
      .catch((e) => console.log(e));
  };

  const submitAudio = async (file) => {
    if (!file) {
      alert("No audio file to submit.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", "en");
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/transcribe/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: { language: "en" }, // ✅ Correct way to send language query
      });
  
      setTranscription(response.data.transcription);
    } catch (error) {
      console.error("Error submitting audio for transcription:", error);
      alert("Failed to transcribe audio. Please try again.");
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
    } else {
      setPosition({ x: 20, y: 20 });
      setSize({ width: 150, height: 150 });
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-6 p-6 bg-gray-100  w-full">
    
        {/* Controls */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={startRecording}
            disabled={recording}
            className={`px-4 py-2 font-semibold text-white rounded ${
              recording ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Start Recording
          </button>
          <button
            onClick={stopRecording}
            disabled={!recording}
            className={`px-4 py-2 font-semibold text-white rounded ${
              !recording ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Stop Recording
          </button>
          <button
            onClick={saveRecording}
            disabled={recordedChunks.length === 0}
            className={`px-4 py-2 font-semibold text-white rounded ${
              recordedChunks.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Save Recording
          </button>
        </div>

        {/* Timer */}
        {recording && (
          <div className="text-center text-xl font-bold text-gray-700">
            Timer: {formatTime(timer)}
          </div>
        )}

        {/* Draggable Video */}
        <DraggableVideo
          videoRef={webcamVideoRef}
          position={position}
          setPosition={setPosition}
          size={size}
          setSize={setSize}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />
      </div>
    </DndProvider>
  );
};

export default ScreenRecorder;