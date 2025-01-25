import React, { useRef, useState, useEffect } from "react";

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("red");
  const [penSize, setPenSize] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    contextRef.current = ctx;
  }, []);

  const startDrawing = ({ clientX, clientY }) => {
    contextRef.current.beginPath();
    contextRef.current.moveTo(clientX, clientY);
    setIsDrawing(true);
  };

  const draw = ({ clientX, clientY }) => {
    if (!isDrawing) return;
    contextRef.current.lineTo(clientX, clientY);
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = penSize;
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 500,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          zIndex: 1000,
        }}
      >
        <button onClick={clearCanvas}>Clear</button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
        <input
          type="range"
          min="1"
          max="10"
          value={penSize}
          onChange={(e) => setPenSize(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;