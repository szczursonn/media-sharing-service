import { createSlice } from '@reduxjs/toolkit'

type LoginState = {
    open: boolean
}

const initialState: LoginState = {
    open: false
}

export const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        openLoginDialog: (state) => {
            state.open = true
        },
        closeLoginDialog: (state) => {
            state.open = false
        }
    }
})

export const {openLoginDialog, closeLoginDialog} = loginSlice.actions

export default loginSlice.reducer