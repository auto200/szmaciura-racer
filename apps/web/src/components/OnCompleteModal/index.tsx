import React, { useRef, useState } from "react";
import Modal from "react-modal";
import styled from "styled-components";

Modal.setAppElement("#__next");

const ExitButton = styled.button`
  all: unset;
  color: ${({ theme }) => theme.colors.secondary};
  position: absolute;
  top: 5px;
  right: 10px;
  padding: 0 5px;
  :hover {
    cursor: pointer;
    color: white;
  }
`;
const Video = styled.video`
  width: 90%;
  max-width: 400px;
`;

interface Props {
  onClose: () => void;
  time: string;
}
const OnCompleteModal: React.FC<Props> = ({ onClose, time }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(0);

  const setPlaybackRateOnVideoElement = () => {
    // we use setTimeout to ensure that video is ready
    setTimeout(() => {
      const timeAsNum = Number(time);
      if (videoRef.current && timeAsNum) {
        try {
          const playbackRate = videoRef.current.duration / timeAsNum;
          videoRef.current.playbackRate = playbackRate;

          setPlaybackRate(playbackRate);
        } catch (err) {
          console.log(err);
        }
      }
    }, 0);
  };

  return (
    <Modal
      isOpen={true}
      overlayClassName="on-complete-modal-backdrop"
      className="on-complete-modal-content"
      onRequestClose={onClose}
    >
      <ExitButton onClick={onClose}>X</ExitButton>
      <div>Twój czas: {time}s</div>
      {playbackRate && playbackRate.toFixed(2) + " prędkości rafonixa"}
      <Video
        src={"/szmaciura.mp4"}
        ref={videoRef}
        autoPlay
        onCanPlay={setPlaybackRateOnVideoElement}
      />
    </Modal>
  );
};

export default OnCompleteModal;
