export type ParticipantType = {
  id: string | undefined;
  updateType: "reaction" | "track" | "sharing" | "add-new";
  updatedAt: number;
  fullName?: string;
  isSpeaking?: boolean;
  isMicEnabled?: boolean;
  isCamEnabled?: boolean;
  canRemoteControl?: boolean;
  isRecorder?: boolean;
  isAsharing?: boolean;
  avatar?: StaticImageData;
  isHand?: boolean;
  stream?: MediaStream | string;
  socketId?: string;
  peer?: Peer.instance;
};
