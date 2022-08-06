import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import communityApi from "../api/communityApi";
import { AppError } from "../errors";
import { Member, ThunkResult } from "../types";

type MemberState = {
    members: Member[]|null
    loading: boolean
    error: string|null
    removing: boolean
    removingError: string|null
}

const initialState: MemberState = {
    members: null,
    loading: false,
    error: null,
    removing: false,
    removingError: null
}

export const memberSlice = createSlice({
    name: 'member',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(fetchMembers.pending, (state) => {
            state.loading = true
            state.members = null
            state.error = null
        })
        builder.addCase(fetchMembers.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.error = err
            } else {
                state.members = action.payload.data
            }
            state.loading = false
        })

        builder.addCase(kickMember.pending, (state) => {
            state.removing = true
            state.removingError = null
        })
        builder.addCase(kickMember.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.removingError = err
            } else if (state.members) {
                const i = state.members.findIndex(m=>m.user.id===action.payload.data)
                if (i !==- 1) state.members.splice(i, 1)
            }
            state.removing = false
        })
    },
})

export const fetchMembers = createAsyncThunk('member/fetchMembers', async (communityId: number): Promise<ThunkResult<Member[]|null>> => {
    try {
        const members = await communityApi.getCommunityMembers(communityId)
        return {
            err: null,
            data: members
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

export const kickMember = createAsyncThunk('member/kickMember', async ({communityId, userId}: {communityId: number, userId: number}): Promise<ThunkResult<number>> => {
    try {
        await communityApi.removeMember(communityId, userId)
        return {
            err: null,
            data: userId
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

export const {} = memberSlice.actions

export default memberSlice.reducer