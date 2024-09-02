import { User } from "@prisma/client"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

interface ProfileState {
    user: User | null
}

const initialState: ProfileState = {
    user: null
}

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        createProfile: (state, action: PayloadAction<Partial<User>>) => {
            state.user = action.payload as User
        },
        updateProfile: (state, action: PayloadAction<Partial<User>>) => {
            if(state.user) {
                state.user = { ...state.user, ...action.payload }
            }
        }, 
        getProfile: (state, action) => {
            
        },
        deleteProfile: (state) => {
            state.user = null
        }
    }
})

export const { createProfile, updateProfile, getProfile, deleteProfile } = profileSlice.actions
export default profileSlice.reducer