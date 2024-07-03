import { decryptMessage } from "@/lib/utils";

const Message = ({ message, date, type, status }: MessageProps) => {
    const isImageMessage = message.startsWith('http');

    return (
        <div className={`flex ${type === "sent" ? "justify-end" : "justify-start"} mb-4`}>
            <div className={`max-w-md break-words p-2 rounded-lg ${type === "sent" ? "bg-green-100 text-black" : "bg-gray-200 text-black"}`}>
                {isImageMessage ? (
                    <img src={message} alt="Sent media" className="rounded-lg max-w-full h-auto" />
                ) : (
                    <p className="whitespace-pre-wrap">{decryptMessage(message)}</p>
                )}
                <div className="flex items-center justify-between space-x-1 mt-1">
                    <p className="text-xs">{new Date(date).toLocaleTimeString()}</p>
                    {type === "sent" && (
                        status === "sent" ? (
                            <img src="/assets/singletick.png" alt="single tick" className="w-3 h-3" />
                        ) : status === "received" ? (
                            <img src="/assets/doubletickgrey.png" alt="double tick" className="w-3 h-3" />
                        ) : status === "read" ? (
                            <img src="/assets/doubletickblue.png" alt="double tick blue" className="w-3 h-3" />
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
};

export default Message;
