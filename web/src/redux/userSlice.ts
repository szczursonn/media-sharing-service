import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userApi from '../api/userApi'
import { AppError } from '../errors'
import { ThunkResult, User } from '../types'

type UserState = {
    user: User|null,
    loading: boolean,
    error: string|null,
    errorDialogOpen: boolean
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
    errorDialogOpen: false
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setCurrentUser: (state, action: {payload: User|null}) => {
            state.user = action.payload
        },
        closeUserErrorDialog: (state) => {
            state.errorDialogOpen = false
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCurrentUser.pending, (state) => {
            state.loading = true
            state.error = null
            state.errorDialogOpen = false
            state.user = null
        })
        builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
            const err = action.payload.err
            state.loading = false
            if (err) {
                if (err !== 'unauthenticated') {
                    state.error = err
                    state.errorDialogOpen = true
                }
            } else {
                state.user = action.payload.data
            }
        })
    }
})

export const fetchCurrentUser = createAsyncThunk('user/fetchUser', async (): Promise<ThunkResult<User>> => {
    try {
        const user = await  userApi.getCurrentUser()
        return {
            err: null,
            data: user
        }
    } catch (err) {
        let e: string
        if (err instanceof AppError) {
            e = err.type
        } else e = String(err)
        
        return {
            err: e,
            data: null
        }
    }
})

export const {setCurrentUser, closeUserErrorDialog} = userSlice.actions

export default userSlice.reducer