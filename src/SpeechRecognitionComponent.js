import MicRecorder from "mic-recorder-to-mp3";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const SpeechRecognitionComponent = () => {
  // Mic-Recorder-To-MP3
  const recorder = useRef(null); // Recorder
  const audioPlayer = useRef(null); // Ref for the HTML Audio Tag
  const [blobURL, setBlobUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(null);
  const [transcription, setTranscription] = useState(""); // State to store API response
  const [loading, setLoading] = useState(false); // State for API loading

  useEffect(() => {
    // Declares the recorder object and stores it inside of ref
    recorder.current = new MicRecorder({ bitRate: 128 });
  }, []);

  const startRecording = () => {
    // Check if recording isn't blocked by browser
    recorder.current.start().then(() => {
      setIsRecording(true);
    });
  };

  const stopRecording = () => {
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "audio.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        });
        const newBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(newBlobUrl);
        setIsRecording(false);
        setAudioFile(file);
      })
      .catch((e) => console.log(e));
  };

  const submitAudio = async () => {
    if (!audioFile) {
      alert("Please record an audio file first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", audioFile); // Append the audio file

    try {
      const response = await axios.post("http://127.0.0.1:8000/transcribe/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Set the transcription received from the API
      setTranscription(response.data.transcription);
    } catch (error) {
      console.error("Error submitting audio:", error);
      alert("Failed to submit the audio file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ zIndex: 20000, padding: "20px" }}>
      <h1>React Speech Recognition App</h1>
      <audio ref={audioPlayer} src={blobURL} controls="controls" />
      <div>
        <button disabled={isRecording} onClick={startRecording}>
          START
        </button>
        <button disabled={!isRecording} onClick={stopRecording}>
          STOP
        </button>
        <button onClick={submitAudio} disabled={loading}>
          {loading ? "Submitting..." : "SUBMIT"}
        </button>
      </div>
      {transcription && (
        <div style={{ marginTop: "20px" }}>
          <h2>Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognitionComponent;