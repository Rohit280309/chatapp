import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
    contacts: string[],
    _id: string,
    username: string,
    email: string,
    logo: string
}

const initialState: UserState = {
    contacts: [],
    _id: "",
    username: "",
    email: "",
    logo: "",
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState>) => {
            return { ...state, ...action.payload };
        },
        updateContacts: (state, action: PayloadAction<string[]>) => {
            state.contacts = action.payload;
        },
        updateUsername: (state, action: PayloadAction<string>) => {
            state.username = action.payload;
        },
        updateEmail: (state, action: PayloadAction<string>) => {
            state.email = action.payload;
        }
    },
})

export const { setUser, updateContacts, updateUsername, updateEmail } = userSlice.actions

export default userSlice.reducer
