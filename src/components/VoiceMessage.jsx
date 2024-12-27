import { useReactMediaRecorder } from "react-media-recorder";
import { useState } from "react";
import { IoMicOutline, IoStopOutline, IoPlayOutline, IoPauseOutline } from "react-icons/io5";

const VoiceMessage = ({ onVoiceSubmit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState("");

  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl, blob) => {
      setAudioURL(blobUrl);
    }
  });

  const handleSubmit = async () => {
    if (audioURL) {
      const response = await fetch(audioURL);
      const blob = await response.blob();
      onVoiceSubmit(blob);
      setAudioURL("");
    }
  };

  const handleStartRecording = (e) => {
    e.stopPropagation();
    startRecording();
  };

  return (
    <div className="voice-message-controls">
      {status !== "recording" ? (
        <button
          type="button"
          className="voice-btn"
          onClick={handleStartRecording}
          disabled={status === "recording"}
        >
          <IoMicOutline size={20} />
        </button>
      ) : (
        <button 
          type="button"
          className="voice-btn recording" 
          onClick={stopRecording}
        >
          <IoStopOutline size={20} />
        </button>
      )}

      {audioURL && (
        <>
          <audio
            src={audioURL}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
          <button
            type="button"
            className="voice-btn"
            onClick={() => document.querySelector("audio").play()}
          >
            {isPlaying ? <IoPauseOutline size={20} /> : <IoPlayOutline size={20} />}
          </button>
          <button 
            type="button"
            className="voice-btn send" 
            onClick={handleSubmit}
          >
            Send
          </button>
        </>
      )}
    </div>
  );
};

export default VoiceMessage; 