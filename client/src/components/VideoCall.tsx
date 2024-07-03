import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { PhoneCallIcon } from 'lucide-react';


export const VideoCall: React.FC<VideoCallProps> = ({ socket, setIsVideoCall, rejectCall }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);  // Store the local media stream
  const chat = useSelector((state: RootState) => state.chat);
  const pendingCandidates = useRef<RTCIceCandidate[]>([]);
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    const startVideoCall = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = localStream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        };

        peerConnection.current = new RTCPeerConnection(configuration);

        localStream.getTracks().forEach(track => {
          if (peerConnection.current) {
            peerConnection.current.addTrack(track, localStream);
          }
        });

        peerConnection.current.ontrack = (event) => {
          const [remoteStream] = event.streams;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setCallStarted(true);  // Update state here to trigger re-render
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket?.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate, receiverId: chat._id }));
          }
        };

        socket!.onmessage = async (event) => {
          const data = JSON.parse(event.data);
          console.log("Received data:", data);

          if (data.type === 'offer') {
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));

            const answer = await peerConnection.current!.createAnswer();
            await peerConnection.current?.setLocalDescription(new RTCSessionDescription(answer));

            socket?.send(JSON.stringify({ type: 'answer', answer, receiverId: chat._id }));

            pendingCandidates.current.forEach(async (candidate) => {
              await peerConnection.current?.addIceCandidate(candidate);
            });
            pendingCandidates.current = [];
          } else if (data.type === 'answer') {
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));

            pendingCandidates.current.forEach(async (candidate) => {
              await peerConnection.current?.addIceCandidate(candidate);
            });
            pendingCandidates.current = [];
            setCallStarted(true);  // Update state here to trigger re-render
          } else if (data.type === 'ice-candidate' && data.candidate) {
            if (peerConnection.current?.remoteDescription) {
              await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
            } else {
              pendingCandidates.current.push(new RTCIceCandidate(data.candidate));
            }
          } else if (data.type === "reject-call") {
            setIsVideoCall(false);
          }
        };

        const offer = await peerConnection.current?.createOffer();
        await peerConnection.current?.setLocalDescription(new RTCSessionDescription(offer));
        socket?.send(JSON.stringify({ type: 'offer', offer, receiverId: chat._id }));

      } catch (error) {
        console.error('Error starting video call:', error);
      }
    };

    startVideoCall();

    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());  // Stop all tracks of the local stream
      }
    };
  }, [socket, chat._id]);

  return (
    <div className="relative h-screen w-screen">
      <video ref={remoteVideoRef} autoPlay className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]" />
      <div className={`absolute top-0 left-0 w-full h-full ${callStarted ? 'hidden' : 'flex'} flex-col space-y-5 items-center justify-center`}>
        <img className='rounded-full w-36 h-36' src={`http://localhost:5000/${chat.logo}`} alt="chat logo" />
        <h3 className='font-semibold text-xl'>Calling... {chat.username}</h3>
      </div>
      <div className="flex w-full h-32 items-center absolute bottom-0">
        <div className='flex justify-center w-5/6 h-12'>
          <div className='flex items-center justify-center w-1/2 border-2 rounded-lg opacity-100'>

            <div onClick={rejectCall} className='flex items-center justify-center cursor-pointer hover:bg-red-500 bg-red-600 rounded-full w-9 h-9'>
              <PhoneCallIcon className='w-5 h-5' />
            </div>

          </div>
        </div>
        <div className='flex justify-end w-1/5 mb-5 mr-5'>
          <video ref={localVideoRef} autoPlay muted className="object-cover w-36 h-32 border-2 border-white rounded-lg transform scale-x-[-1]" />
        </div>
      </div>
      {/* <video ref={localVideoRef} autoPlay muted className="absolute object-cover bottom-4 right-4 w-36 h-32 border-2 border-white rounded-lg transform scale-x-[-1]" /> */}
    </div>
  );
};
