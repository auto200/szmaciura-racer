import React, { useState, useRef } from "react";
import styled from "styled-components";
import Modal from "react-modal";
import * as szmaciuraVideo from "../../assets/szmaciura.mp4";
import "./style.css";

Modal.setAppElement("#___gatsby");

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
  isOpen: boolean;
  onClose: () => void;
  time: string;
}
const OnCompleteModal = ({ isOpen, onClose, time }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackRate, setPlaybackRate] = useState<number>(0);
  return (
    <Modal
      isOpen={isOpen}
      overlayClassName="on-complete-modal-backdrop"
      className="on-complete-modal-content"
      onRequestClose={onClose}
    >
      <ExitButton onClick={onClose}>X</ExitButton>
      <div>Twój czas {time}s</div>
      {playbackRate && playbackRate.toFixed(2) + " prędkości rafonixa"}
      <Video
        src={szmaciuraVideo}
        ref={videoRef}
        autoPlay
        onCanPlay={() => {
          const timeAsNum = Number(time);
          if (videoRef.current && timeAsNum) {
            const playbackRate = videoRef.current.duration / timeAsNum;
            videoRef.current.playbackRate = playbackRate;
            setPlaybackRate(playbackRate);
          }
        }}
      />
    </Modal>
  );
};

export default OnCompleteModal;
