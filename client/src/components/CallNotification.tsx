import React, { useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

const CallNotification: React.FC<CallNotificationProps> = ({ acceptCall, rejectCall }) => {
  const openRef = useRef<any>(null);
  const chat = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    openRef.current.click();
  }, [])

  return (
    <AlertDialog>
      <AlertDialogTrigger className='hidden' ref={openRef}>Open</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Incoming Call From {chat?.username}</AlertDialogTitle>
          <AlertDialogDescription>
            You have an incoming video call from {chat?.username}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={rejectCall} className='bg-red-500'>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={acceptCall} className='bg-green-500'>Accept</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CallNotification;
