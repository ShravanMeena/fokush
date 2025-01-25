import React, { useState } from "react";

const DraggableVideo = ({
  videoRef,
  position,
  setPosition,
  size,
  setSize,
  isFullscreen,
  toggleFullscreen,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Handle dragging
  const handleMouseDownDrag = (e) => {
    if (!isResizing) {
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, e.clientX - size.width / 2),
        y: Math.max(0, e.clientY - size.height / 2),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false); // Reset resizing state
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Handle resizing
  const handleResize = (e) => {
    const newWidth = Math.max(100, e.clientX - position.x);
    const newHeight = Math.max(100, e.clientY - position.y);
    setSize({ width: newWidth, height: newHeight });
  };

  const startResize = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    document.addEventListener("mousemove", handleResize); // Attach resize listener
    document.addEventListener("mouseup", handleMouseUp); // Clean up on mouse up
  };

  // Enter Picture-in-Picture (PiP) mode
  const enterPictureInPicture = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        await videoRef.current.requestPictureInPicture();
      } catch (err) {
        console.error("Failed to enter Picture-in-Picture mode:", err);
      }
    }
  };

  return (
    <div
      onMouseDown={handleMouseDownDrag}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        borderRadius: "10px",
        border: "2px solid black",
        cursor: isDragging ? "grabbing" : "grab",
        background: "black",
        zIndex: 1000,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          width: "100%",
          height: "100%",
          transform: "scaleX(-1)", // Flip horizontally
        }}
      />

      {/* Resize Handle */}
      <div
        onMouseDown={startResize}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "20px",
          height: "20px",
          background: "gray",
          cursor: "nwse-resize",
          zIndex: 2000,
        }}
      />

      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: "absolute",
          top: "5px",
          right: "70px",
          background: "white",
          border: "1px solid black",
          cursor: "pointer",
        }}
      >
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>

      {/* Picture-in-Picture Button */}
      <button
        onClick={enterPictureInPicture}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          background: "white",
          border: "1px solid black",
          cursor: "pointer",
        }}
      >
        PiP
      </button>
    </div>
  );
};

export default DraggableVideo;