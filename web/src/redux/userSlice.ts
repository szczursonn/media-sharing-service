import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userApi from '../api/userApi'
import { AppError } from '../errors'
import { ThunkResult, User } from '../types'

type UserState = {
    user: User|null,
    loading: boolean,
    error: string|null,
    errorDialogOpen: boolean,
    updating: boolean,
    updatingError: string|null,
    deleting: boolean,
    deletingError: string|null
}

const initialState: UserState = {
    user: null,
    loading: false,
    error: null,
    errorDialogOpen: false,
    updating: false,
    updatingError: null,
    deleting: false,
    deletingError: null
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

        builder.addCase(updateCurrentUser.pending, (state) => {
            state.updating = true
            state.updatingError = null
        })
        builder.addCase(updateCurrentUser.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.updatingError = err
            } else {
                state.user = action.payload.data
            }
            state.updating = false
        })

        builder.addCase(deleteCurrentUser.pending, (state) => {
            state.deleting = true
            state.deletingError = null
        })
        builder.addCase(deleteCurrentUser.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.deletingError = err
            } else {
                state.user = null
                localStorage.removeItem('token')
                localStorage.removeItem('sessionId')
            }
            state.deleting = false
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

export const updateCurrentUser = createAsyncThunk('user/updateUser', async ({username}: {username: string}): Promise<ThunkResult<User>> => {
    try {
        const updated = await userApi.updateUser(username)
        return {
            err: null,
            data: updated
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

export const deleteCurrentUser = createAsyncThunk('user/deleteUser', async (): Promise<ThunkResult<null>> => {
    try {
        await userApi.deleteCurrentUser()
        return {
            err: null,
            data: null
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