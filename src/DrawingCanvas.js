import React, { useRef, useState, useEffect } from "react";

const DrawingCanvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState("pen"); // Options: 'pen', 'line', 'rectangle', 'circle', 'arrow'
  const [color, setColor] = useState("#FF0000");
  const [penSize, setPenSize] = useState(2);
  const [startPoint, setStartPoint] = useState(null); // For shapes like circle/rectangle
  const [shapes, setShapes] = useState([]); // Store drawn shapes

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = penSize;
    contextRef.current = ctx;
  }, [color, penSize]);

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPoint({ x, y });
    setIsDrawing(true);

    if (drawMode === "pen") {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawMode === "pen") {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    } else {
      redrawShapes(); // Redraw existing shapes before showing the new one
      const currentPoint = { x, y };
      switch (drawMode) {
        case "line":
          drawLine(startPoint, currentPoint);
          break;
        case "rectangle":
          drawRectangle(startPoint, currentPoint);
          break;
        case "circle":
          drawCircle(startPoint, currentPoint);
          break;
        case "arrow":
          drawArrow(startPoint, currentPoint);
          break;
        default:
          break;
      }
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;

    setIsDrawing(false);

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const currentPoint = { x, y };

    if (drawMode !== "pen") {
      const newShape = { mode: drawMode, startPoint, currentPoint, color, penSize };
      setShapes((prevShapes) => [...prevShapes, newShape]);
    }
  };

  const redrawShapes = () => {
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    shapes.forEach((shape) => {
      const { mode, startPoint, currentPoint, color, penSize } = shape;
      ctx.strokeStyle = color;
      ctx.lineWidth = penSize;

      switch (mode) {
        case "line":
          drawLine(startPoint, currentPoint);
          break;
        case "rectangle":
          drawRectangle(startPoint, currentPoint);
          break;
        case "circle":
          drawCircle(startPoint, currentPoint);
          break;
        case "arrow":
          drawArrow(startPoint, currentPoint);
          break;
        default:
          break;
      }
    });
  };

  const drawLine = (start, end) => {
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
  };

  const drawRectangle = (start, end) => {
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.strokeRect(
      start.x,
      start.y,
      end.x - start.x,
      end.y - start.y
    );
    ctx.closePath();
  };

  const drawCircle = (start, end) => {
    const ctx = contextRef.current;
    const radius = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    ctx.beginPath();
    ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  };

  const drawArrow = (start, end) => {
    const ctx = contextRef.current;

    // Draw the line
    drawLine(start, end);

    // Arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headLength = 10;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
    ctx.closePath();
  };

  const clearCanvas = () => {
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setShapes([]);
  };

  return (
    <div>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="absolute top-[50vh] right-[80vh] w-full h-full  bg-gray-200 pointer-events-auto"
      />

      {/* Tools Panel */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-md flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Clear
          </button>
          <div>
            <label className="text-sm font-medium text-gray-700">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="ml-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Pen Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={penSize}
            onChange={(e) => setPenSize(e.target.value)}
            className="w-24"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Tool:</label>
          <button
            onClick={() => setDrawMode("pen")}
            className={`px-3 py-1 rounded-md ${
              drawMode === "pen" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            } hover:bg-blue-600`}
          >
            Pen
          </button>
          <button
            onClick={() => setDrawMode("line")}
            className={`px-3 py-1 rounded-md ${
              drawMode === "line" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            } hover:bg-blue-600`}
          >
            Line
          </button>
          <button
            onClick={() => setDrawMode("rectangle")}
            className={`px-3 py-1 rounded-md ${
              drawMode === "rectangle" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            } hover:bg-blue-600`}
          >
            Rectangle
          </button>
          <button
            onClick={() => setDrawMode("circle")}
            className={`px-3 py-1 rounded-md ${
              drawMode === "circle" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            } hover:bg-blue-600`}
          >
            Circle
          </button>
          <button
            onClick={() => setDrawMode("arrow")}
            className={`px-3 py-1 rounded-md ${
              drawMode === "arrow" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
            } hover:bg-blue-600`}
          >
            Arrow
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;