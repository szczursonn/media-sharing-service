import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import communityApi from '../api/communityApi'
import userApi from '../api/userApi'
import { AppError } from '../errors'
import { Community, ThunkResult } from '../types'

type CommunityState = {
    communities: Community[]|null,
    loading: boolean,
    error: string|null,
    selected: Community|null,
    saving: boolean,
    savingError: string|null,
    leaving: boolean,
    leavingError: string|null
}

const initialState: CommunityState = {
    communities: null,
    loading: false,
    error: null,
    selected: null,
    saving: false,
    savingError: null,
    leaving: false,
    leavingError: null
}

export const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        selectCommunity: (state, action: {payload: Community|null})=>{
            state.selected = action.payload
        },
        setCommunities: (state, action: {payload: Community[]|null}) => {
            state.communities = action.payload
            if (!state.communities) state.selected = null
            if (state.communities && state.selected && !state.communities.includes(state.selected)) state.selected = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCommunities.pending, (state) => {
            state.communities = null
            state.selected = null
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

export const {selectCommunity, setCommunities} = communitySlice.actions

export default communitySlice.reducer