import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
    _id: string,
    username: string,
    email: string,
    logo: string,
    lastMessage?: string;
    lastMessageStatus?: string;
    lastMessageDate?: string;
}

const initialState: UserState = {
    _id: "",
    username: "",
    email: "",
    logo: "",
    lastMessage: "",
    lastMessageStatus: "",
    lastMessageDate: "",
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChat: (state, action: PayloadAction<UserState>) => {
            return { ...state, ...action.payload };
        },
    },
})

export const { setChat } = chatSlice.actions

export default chatSlice.reducer
