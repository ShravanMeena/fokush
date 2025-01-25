import React from "react";
import ScreenRecorder from "./ScreenRecorder";
import DrawingCanvas from "./DrawingCanvas";

const App = () => {
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ScreenRecorder />
      <DrawingCanvas />
    </div>
  );
};

export default App;