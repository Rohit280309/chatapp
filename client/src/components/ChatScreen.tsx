import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollArea } from "./ui/scroll-area";
import EmojiPicker from 'emoji-picker-react';
import Message from './Message';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { encryptMessage } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { addMessage, getMessages, updateAllMessageStatus, updateMessageStatus } from '@/lib/indexedDb';
import { v4 as uuid } from "uuid";
import { VideoIcon } from 'lucide-react';

const ChatScreen = ({ socket, setIsVideoCall, setCaller, setIncomingCall }: ChatScreenProps) => {
  const user = useSelector((state: RootState) => state.user);
  const chat = useSelector((state: RootState) => state.chat);
  const scrollRef = useRef<React.ElementRef<typeof ScrollArea>>(null);

  const [inputValue, setInputValue] = useState('');
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  
  const loadMessages = useCallback(async () => {
    if (chat._id) {
      const newMessages = await getMessages(chat._id);

      const formatted = newMessages.map(msg => ({
        ...msg,
        date: new Date(msg.date),
        status: "read"
      }));
      formatted.sort((a, b) => a.date.getTime() - b.date.getTime());

      setMessages(formatted);
    }
  }, [chat._id]);

  useEffect(() => {
    loadMessages();
    const update = async () => {
      await updateAllMessageStatus(chat._id, "read");
      console.log(messages);
    }
    update();
  }, [loadMessages]);

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.onmessage = async (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "msg") {
          const msgData = data.data;
          setMessages((prevMessages) => [...prevMessages, msgData]);
          await addMessage(data.senderId, data.data);
          scrollToBottom();

        } else if (data.type === "ack") {
          await updateMessageStatus(chat._id, data.data.id, data.status)
          setMessages((prevMessages) =>
            prevMessages.map((msg: MessageProps) =>
              msg.id === data.data.id ? { ...msg, status: data.status } : msg
            )
          );

        } else if (data.type === "video-call") {
          console.log("Call Incoming");
          setIncomingCall(true);
          const callerId = data.callerId;
          setCaller(callerId);

        } else if(data.type === "reject-call") {
          console.log("reject-call");
          setIsVideoCall(false);
        }
      }
    }
  }, [messages, chat._id, socket]);

  const onEmojiClick = (emojiData: any) => {
    setInputValue(prevInputValue => prevInputValue + emojiData.emoji);
    setIsEmojiPickerVisible(false);
  };

  const sendMessage = async () => {
    if (inputValue.trim() !== "" && socket) {
      const newMessage: MessageProps = { message: encryptMessage(inputValue), date: new Date().toString(), type: "sent", status: "sent", id: uuid() };
      setMessages([...messages, newMessage]);
      setInputValue('');

      const messageData = {
        senderId: user._id,
        recipientId: chat._id,
        data: { ...newMessage, type: "received" }
      }

      await addMessage(chat._id, newMessage);
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(messageData));
      }
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const newValue = value.substring(0, start) + "\t" + value.substring(end);
      setInputValue(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startVideoCall = () => {
    setIsVideoCall(true);

    socket?.send(JSON.stringify({
      type: "video-call",
      event: "video-call",
      callerId: user._id,
      receiverId: chat._id
    }));
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {
        chat._id !== "" ?
          <>
            <div className="flex items-center justify-between bg-c-bg dark:bg-c-bg-1 h-16 border-b-2">
              <div className="flex items-center space-x-5 w-1/6">
                <img className="rounded-full w-10 h-10 ml-2 cursor-pointer" src={`http://localhost:5000/${chat.logo}`} alt="icon" />
                <p className="font-semibold text-lg">{chat.username}</p>
              </div>
              <div className="flex space-x-5 mr-4">
                <VideoIcon onClick={startVideoCall} className="cursor-pointer w-7 h-7" />
              </div>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <ScrollArea className="h-full" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <Message key={index} {...msg} />
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="relative h-16 flex items-center bg-c-bg dark:bg-c-bg-1">
              <div className="flex items-center cursor-pointer w-1/12 pl-5" onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}>
                <img className="w-6 h-6" src="/assets/smile.png" alt="smile" />
              </div>
              {isEmojiPickerVisible && (
                <div className="absolute bottom-16 left-5 z-10">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
              <div className="flex items-center space-x-5 w-full pr-5">
                <Textarea
                  className='resize-none'
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {inputValue !== "" ? (
                  <svg onClick={sendMessage} viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" className="cursor-pointer" version="1.1" x="0px" y="0px" enableBackground="new 0 0 24 24"><title>send</title><path fill="currentColor" d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z"></path></svg>
                ) : (
                  <img className="w-5 h-5 cursor-pointer" src="/assets/mic.png" alt="mic" />
                )}
              </div>
            </div>
          </>
          : null
      }

      {/* {incomingCall && <CallNotification acceptCall={acceptCall} />} */}
    </div>
  );
};

export default ChatScreen;
