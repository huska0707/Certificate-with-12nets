import { configureStore } from "@reduxjs/toolkit"
import profileReducer from "./redux/profile"

export const store = configureStore({
    reducer: {
        profile: profileReducer
    },
    devTools: true
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch