import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCurrentUser } from '../api'
import { AppError } from '../errors'
import { ThunkResult, User } from '../types'

type UserState = {
    user: User|null,
    loading: boolean,
    error: string|null
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setCurrentUser: (state, action: {payload: User|null}) => {
            state.user = action.payload
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCurrentUser.pending, (state) => {
            state.loading = true
            state.error = null
            state.user = null
        })
        builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
            const err = action.payload.err
            state.loading = false
            if (err) {
                if (err !== 'unauthenticated') {
                    state.error = err
                }
            } else {
                state.user = action.payload.data
            }
        })
    }
})

export const fetchCurrentUser = createAsyncThunk('user/fetchUser', async (): Promise<ThunkResult<User>> => {
    try {
        const user = await getCurrentUser()
        return {
            err: null,
            data: user
        }
    } catch (err) {
        if (err instanceof AppError) {
            err = err.type
        } else err = String(err)
        
        return {
            err,
            data: null
        } as any
    }
})

export const {setCurrentUser, clearError} = userSlice.actions

export default userSlice.reducer