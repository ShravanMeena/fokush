import React, { useState } from "react";
import ScreenRecorder from "./ScreenRecorder";
import ReactMarkdown from "react-markdown";

const App = () => {
  const [transcriptionFinal, setTranscriptionFinal] = useState("");
  const [aiResponse, setAiResponse] = useState(""); // Store AI response
  const [selectedTask, setSelectedTask] = useState("summary"); // Default to summary
  const [loading, setLoading] = useState(false);

  // Function to send transcription to AI API
  const processTranscript = async () => {
    if (!transcriptionFinal.trim()) {
      alert("Please provide a valid transcription!");
      return;
    }

    setLoading(true); // Show loading state

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcription: transcriptionFinal,
          task: selectedTask,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process transcription.");
      }

      const data = await response.json();
      setAiResponse(data.result);
    } catch (error) {
      console.error("Error processing transcript:", error);
      setAiResponse("Error processing transcript.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meeting Summarize App</h1>

      {/* Screen Recorder */}
      <div className="w-full max-w-3xl">
        <ScreenRecorder setTranscriptionFinal={setTranscriptionFinal} />
      </div>

      {transcriptionFinal && (
        <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 mt-6">
          {/* Task Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Choose Task:</label>
            <select
              className="w-full mt-2 p-2 border rounded"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
            >
              <option value="summary">Summarize Meeting</option>
              <option value="meetings">Find Meetings</option>
              <option value="tasks">Extract Tasks</option>
            </select>
          </div>

          {/* Transcription Result */}
          <div className="mb-4 p-3 bg-gray-50 border rounded-md">
            <h2 className="font-semibold text-gray-700">📜 Transcription:</h2>
            <p className="text-gray-600">{transcriptionFinal}</p>
          </div>

          {/* Process Button */}
          <div className="text-center">
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
              onClick={processTranscript}
              disabled={loading}
            >
              {loading ? "Processing..." : "Process with AI"}
            </button>
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div className="mt-6 p-4 bg-gray-100 border rounded-md">
              <h2 className="font-semibold text-gray-700">🤖 AI Response:</h2>
              <div className="mt-2 p-3 bg-white border rounded-md shadow-sm">
                <ReactMarkdown className="prose">{aiResponse}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
