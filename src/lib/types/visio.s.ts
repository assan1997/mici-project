export interface VisioContextInterface {
    generateRandomLink: () => void;
    callId: string | null;
    enterInCall: (callId: string) => void;
    joinCall: (arg: string | null) => void;
    localStream: any;
    remoteStreams: any;
    createPeer: (type: string) => any;
    callRooms: string[];
    setSessionCredentials: (arg?: any) => void;
    getSessionCredentials: (arg?: any) => any;
    handleControls: (arg: any) => void;
    controls: any;
    handleQuit: () => void;
    participants: any;
    getTrack: (track: string, stream: any) => any;
    handleReactions: (type: string, metadata: any) => void,
    reactions: {
        id: any;
        name: string;
        fullName: string;
    }[],
    addReaction: (inputs: {
        id: any; name: string; fullName: string
    }[]) => void;
    handleSharingScreen: () => void;
    handleRemoteControl: (arg: string) => void;
    handleSetDisplayControl: (arg: any) => void;
    displayControlModal: any;
    handleRemoteControlActions: (arg: any) => void;
    remoteControl: () => any,
    handleVideoTrack: any
}