import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createNewCommunity, getUserCommunities } from '../api'
import { AppError } from '../errors'
import { Community, ThunkResult } from '../types'

type CommunityState = {
    communities: Community[]|null,
    loading: boolean,
    error: string|null,
    selected: Community|null,
    saving: boolean,
    savingError: string|null
}

const initialState: CommunityState = {
    communities: null,
    loading: false,
    error: null,
    selected: null,
    saving: false,
    savingError: null
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
    },
})

export const fetchCommunities = createAsyncThunk('community/fetchCommunities', async (): Promise<ThunkResult<Community[]|null>> => {
    try {
        const communities = await getUserCommunities()
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
        } as any
    }
})

export const createCommunity = createAsyncThunk('community/createCommunity', async (name: string): Promise<ThunkResult<Community|null>> => {
    try {
        const com = await createNewCommunity(name)
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
        } as any
    }
})

export const {selectCommunity, setCommunities} = communitySlice.actions

export default communitySlice.reducer