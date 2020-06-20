import React, { useRef } from "react";
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
  return (
    <Modal
      isOpen={isOpen}
      overlayClassName="on-complete-modal-backdrop"
      className="on-complete-modal-content"
      onRequestClose={onClose}
    >
      <ExitButton onClick={onClose}>X</ExitButton>
      <div>Twój czas {time}</div>
      <Video
        src={szmaciuraVideo}
        ref={videoRef}
        autoPlay
        onCanPlay={() => {
          const timeAsNum = Number(time);
          if (videoRef.current && timeAsNum) {
            videoRef.current.playbackRate =
              videoRef.current.duration / timeAsNum;
          }
        }}
      />
    </Modal>
  );
};

export default OnCompleteModal;
