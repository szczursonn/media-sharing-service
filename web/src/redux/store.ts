import { configureStore } from '@reduxjs/toolkit'
import loginReducer from './loginSlice'
import userReducer from './userSlice'
import communityReducer from './communitySlice'

const store = configureStore({
    reducer: {
        loginReducer,
        userReducer,
        communityReducer
    }
})

export default store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch