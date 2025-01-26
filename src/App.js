import React from "react";
import ScreenRecorder from "./ScreenRecorder";
import DrawingCanvas from "./DrawingCanvas";
import SpeechRecognitionComponent from "./SpeechRecognitionComponent";

const App = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-100">
      <div className="absolute top-0 left-0 w-full p-4 bg-white shadow-md z-50">
        <h1 className="text-4xl font-bold text-center text-red-800">
          Modern Screen Recorder App
        </h1>
      </div>
      <ScreenRecorder />
      <SpeechRecognitionComponent />
      <DrawingCanvas />
    </div>
  );
};

export default App;