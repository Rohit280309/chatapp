type MessageProps = {
    message: string,
    date: string,
    type: "sent" | "received",
    status: "sent" | "received" | "read",
    id: string,
}

type SidebarProps = {
    socket: WebSocket | null
}

type ContactDetails = {
    _id: string,
    username: string,
    email: string,
    logo: string,
    lastMessage?: string;
    lastMessageStatus?: string;
    lastMessageDate?: string;
    unRead?: number;
}[]

type ChatScreenProps = {
    socket: WebSocket | null,
    setIsVideoCall: SetStateAction<Boolean>,
    setIncomingCall: SetStateAction<Boolean>,
    setCaller: SetStateAction<string | null>,
    incomingCall: Boolean
}

interface CallNotificationProps {
    acceptCall: () => void
    rejectCall: () => void
}


interface VideoCallProps {
    socket: WebSocket | null;
    setIsVideoCall: SetStateAction<Boolean>;
    rejectCall: () => void
}
