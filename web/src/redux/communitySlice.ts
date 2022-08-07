import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import communityApi from '../api/communityApi'
import userApi from '../api/userApi'
import { AppError } from '../errors'
import { Community, ThunkResult } from '../types'
import { RootState } from './store'

type CommunityState = {
    communities: Community[]|null,
    loading: boolean,
    error: string|null,
    selectedId: number|null,
    saving: boolean,
    savingError: string|null,
    leaving: boolean,
    leavingError: string|null,
    deleting: boolean,
    deletingError: string|null
}

const initialState: CommunityState = {
    communities: null,
    loading: false,
    error: null,
    selectedId: null,
    saving: false,
    savingError: null,
    leaving: false,
    leavingError: null,
    deleting: false,
    deletingError: null
}

export const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        selectCommunity: (state, action: {payload: number|null})=>{
            state.selectedId = action.payload
        },
        setCommunities: (state, action: {payload: Community[]|null}) => {
            state.communities = action.payload
            if (!state.communities) state.selectedId = null
            if (state.communities && state.selectedId && !state.communities.map(c=>c.id).includes(state.selectedId)) state.selectedId = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCommunities.pending, (state) => {
            state.communities = null
            state.selectedId = null
            state.loading = true
            state.error = null
        })
        builder.addCase(fetchCommunities.fulfilled, (state, action) => {
            if (action.payload.err) {
                state.error = action.payload.err
            } else {
                state.communities = action.payload.data
            }
            state.loading = false
        })

        builder.addCase(createCommunity.pending, (state) => {
            state.saving = true
            state.savingError = null
        })
        builder.addCase(createCommunity.fulfilled, (state, action) => {
            const {err, data: community} = action.payload
            if (err) {
                state.savingError = err
            } else {
                state.communities?.push(community!)
            }
            state.saving = false
        })

        builder.addCase(leaveCommunity.pending, (state) => {
            state.leaving = true
            state.leavingError = null
        })
        builder.addCase(leaveCommunity.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.leavingError = err
            } else if (state.communities) {
                const i = state.communities.findIndex(c=>c.id === action.payload.data!)
                state.communities.splice(i, 1)
            }
            state.leaving = false
        })

        builder.addCase(deleteCommunity.pending, (state) => {
            state.deleting = true
            state.deletingError = null
        })
        builder.addCase(deleteCommunity.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.deletingError = err
            } else if (state.communities) {
                const i = state.communities.findIndex(c=>c.id===action.payload.data!)
                if (i !== -1) state.communities.splice(i, 1)
            }
            state.deleting = false
        })
    },
})

export const fetchCommunities = createAsyncThunk('community/fetchCommunities', async (): Promise<ThunkResult<Community[]|null>> => {
    try {
        const communities = await userApi.getUserCommunities()
        return {
            err: null,
            data: communities
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

export const createCommunity = createAsyncThunk('community/createCommunity', async (name: string): Promise<ThunkResult<Community|null>> => {
    try {
        const com = await communityApi.createNewCommunity(name)
        return {
            err: null,
            data: com
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

export const leaveCommunity = createAsyncThunk('community/leaveCommunity', async (communityId: number): Promise<ThunkResult<number|null>> => {
    try {
        await communityApi.leaveCommunity(communityId)
        return {
            err: null,
            data: communityId
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

export const deleteCommunity = createAsyncThunk('community/deleteCommunity', async (communityId: number): Promise<ThunkResult<number>> => {
    try {
        await communityApi.removeCommunity(communityId)
        return {
            err: null,
            data: communityId
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

export const selectSelectedCommunity = () => (state: RootState): Community|null => {
    return state.communityReducer.communities?.find(c=>c.id===state.communityReducer.selectedId) ?? null
}

export const {selectCommunity, setCommunities} = communitySlice.actions

export default communitySlice.reducer