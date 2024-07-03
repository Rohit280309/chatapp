import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define the type for a single contact
export type Contact = {
    _id: string,
    username: string,
    email: string,
    logo: string,
    lastMessage?: string;
    lastMessageStatus?: string;
    lastMessageDate?: string;
    unRead?: number;
}

export type ContactsState = Contact[]

const initialState: ContactsState = []

export const contactSlice = createSlice({
    name: 'contact',
    initialState,
    reducers: {
        setContacts: (state, action: PayloadAction<ContactsState>) => {
            return action.payload;
        },
        updateUnreadCount: (state, action: PayloadAction<{ _id: string, unRead: number }>) => {
            const { _id, unRead } = action.payload;
            const contact = state.find(contact => contact._id === _id);
            if (contact) {
                contact.unRead = unRead;
            }
        },
        updateMessage: (state, action: PayloadAction<{ _id: string, lastMessage: string, lastMessageStatus: string, lastMessageDate: string}>) => {
            const { _id, lastMessage, lastMessageStatus, lastMessageDate } = action.payload;
            const contact = state.find(contact => contact._id === _id);
            if (contact) {
                contact.lastMessage = lastMessage;
                contact.lastMessageStatus = lastMessageStatus;
                contact.lastMessageDate = lastMessageDate,
                contact.unRead = contact.unRead! + 1;
            }
        }
    },
})

export const { setContacts, updateUnreadCount, updateMessage } = contactSlice.actions

export default contactSlice.reducer
