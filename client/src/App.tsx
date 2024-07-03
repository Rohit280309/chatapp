import { useEffect, useState } from 'react';
import './App.css';
import ChatScreen from './components/ChatScreen';
import Sidebar from './components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUser } from './state/userState';
import { setChat } from './state/chatState';
import { addMessage, addRequest, getMessages } from '@/lib/indexedDb';
import { RootState } from './store';
import CallNotification from './components/CallNotification';
import { VideoCall } from './components/VideoCall';
import { setContacts, updateMessage } from './state/contactsState';

function App() {
  const host = import.meta.env.VITE_SOME_HOST;

  const user = useSelector((state: RootState) => state.user);

  const [socketInstance, setSocketInstance] = useState<WebSocket | null>(null);
  const [isVideoCall, setIsVideoCall] = useState<Boolean>(false);
  const [incomingCall, setIncomingCall] = useState<boolean>(false);
  const [caller, setCaller] = useState<string | null>(null);

  const [contactDetails, setContactDetails] = useState<ContactDetails>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (authToken) {
      const headers = { "auth-token": authToken };

      axios.get(`${host}/getUser`, { headers })
        .then((res: any) => {
          dispatch(setUser(res.data.user));
        })
        .catch(err => console.log(err));

      axios.get(`${host}/getContactDetails`, { headers })
        .then(async (res: any) => {
          const contacts = res.data.contacts;
          const updatedContacts = await Promise.all(contacts.map(async (contact: any) => {
            const messages = await getMessages(contact._id);
            console.log(messages)
            if (messages.length > 0) {
              let unRead = 0;
              messages.filter((item: any) => (item.status === "sent" && unRead++));
              const lastMessage = messages[messages.length - 1];
              return {
                ...contact,
                lastMessage: lastMessage.message,
                lastMessageStatus: lastMessage.status,
                lastMessageDate: lastMessage.date,
                unRead: unRead
              };
            }
            return contact;
          }));
          setContactDetails(updatedContacts);
          console.log(typeof (updatedContacts))
          dispatch(setContacts(updatedContacts));
        })
        .catch(err => console.log(err));
    }
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const socket = new WebSocket(`ws://localhost:8080?token=${token}`);

    setSocketInstance(socket);

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "video-call") {
        const callerId = data.callerId;
        const item: any = contactDetails.find((item: any) => item._id === callerId);
        dispatch(setChat(item));
        setCaller(callerId);
        setIncomingCall(true);
      } else if (data.type === "msg") {
        console.log(data);
        let payload = {
          _id: data.senderId,
          lastMessage: data.data.message,
          lastMessageStatus: data.data.status,
          lastMessageDate: data.data.date,
        }
        dispatch(updateMessage(payload));
        await addMessage(data.senderId, data.data);
      } else if (data.type === "reject-call") {
        console.log("reject-call");
        setIsVideoCall(false);
      } else if (data.type === "request") {
        console.log(data);
        await addRequest(data.senderId);
      }
    }

    socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [contactDetails, dispatch]);

  useEffect(() => {
    const handleChatClose = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(setChat({
          _id: "",
          email: "",
          username: "",
          logo: ""
        }));
      }
    };

    document.addEventListener('keydown', handleChatClose);

    return () => {
      document.removeEventListener('keydown', handleChatClose);
    };
  }, [dispatch]);

  const acceptCall = () => {
    setIncomingCall(false);
    setIsVideoCall(true);

    socketInstance?.send(JSON.stringify({
      type: "video-call",
      event: "accept-call",
      receiverId: user._id,
      callerId: caller
    }));

    let chat: any = contactDetails.find((item) => item._id === caller);
    dispatch(setChat(chat));
  };

  const rejectCall = () => {
    setIsVideoCall(false);

    socketInstance?.send(JSON.stringify({
      type: "video-call",
      event: "reject-call",
      receiverId: caller,
      callerId: user._id
    }));
  }

  return (
    <>
      <div className="flex">
        {!isVideoCall ?
          <>
            <Sidebar socket={socketInstance} />
            <ChatScreen socket={socketInstance} setIsVideoCall={setIsVideoCall} incomingCall={incomingCall} setIncomingCall={setIncomingCall} setCaller={setCaller} />
          </>
          :
          <VideoCall socket={socketInstance} setIsVideoCall={setIsVideoCall} rejectCall={rejectCall} />
        }
      </div>
      {incomingCall && <CallNotification acceptCall={acceptCall} rejectCall={rejectCall} />}
    </>
  );
}

export default App;
