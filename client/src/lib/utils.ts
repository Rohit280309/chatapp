import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod";
import { JwtPayload, jwtDecode } from "jwt-decode";
import CryptoJS from 'crypto-js';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const authFormSchema = (type: string) => z.object({
  // sign up
  username: type === "login" ? z.string().optional() : z.string().min(3),
  // both
  email: z.string().email(),
  password: z.string().min(8),
});

interface CustomPayload extends JwtPayload {
  user: {
    id: string
  }
}

export const getDataFromToken = (token: string) => {
  try {
    const decoded = jwtDecode<CustomPayload>(token); 
    return decoded.user.id;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const encryptMessage = (message: string) => {
  const secretKey = import.meta.env.VITE_SOME_ENCRYPTION_KEY; 
  const encryptedMessage = CryptoJS.AES.encrypt(message, secretKey).toString();
  return encryptedMessage;
};

export const decryptMessage = (encryptedMessage: string) => {
  const secretKey = import.meta.env.VITE_SOME_ENCRYPTION_KEY; 
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedMessage;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const isThisWeek = (date: Date) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= startOfWeek && date <= endOfWeek;
  };

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (isThisWeek(date)) {
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    return date.toLocaleDateString([], { year: 'numeric', month: 'numeric', day: 'numeric' });
  }
};

export const formatEmail = (email: string) => {
  if (email.length > 12) {
    return email.substring(0,12);
  }
  return email;
}
