import { configureStore } from '@reduxjs/toolkit'
import dialogReducer from './dialogSlice'
import userReducer from './userSlice'
import communityReducer from './communitySlice'

const store = configureStore({
    reducer: {
        dialogReducer,
        userReducer,
        communityReducer
    }
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch