import { createSlice } from '@reduxjs/toolkit'

type DialogState = {
    loginOpen: boolean,
    communityCreateOpen: boolean,
    inviteOpen: boolean,
    inviteCreateOpen: boolean,
    inviteCreateTargetId: number|null
}

const initialState: DialogState = {
    loginOpen: false,
    communityCreateOpen: false,
    inviteOpen: false,
    inviteCreateOpen: false,
    inviteCreateTargetId: null
}

export const dialogSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        openLoginDialog: (state) => {
            state.loginOpen = true
        },
        closeLoginDialog: (state) => {
            state.loginOpen = false
        },

        openCommunityCreateDialog: (state) => {
            state.communityCreateOpen = true
        },
        closeCommunityCreateDialog: (state) => {
            state.communityCreateOpen = false
        },

        openInviteDialog: (state) => {
            state.inviteOpen = true
        },
        closeInviteDialog: (state) => {
            state.inviteOpen = false
        },

        openInviteCreateDialog: (state, action: {payload: number}) => {
            state.inviteCreateOpen = true
            state.inviteCreateTargetId = action.payload
        },
        closeInviteCreateDialog: (state) => {
            state.inviteCreateOpen = false
        }
    }
})

export const {openLoginDialog, closeLoginDialog, openCommunityCreateDialog, closeCommunityCreateDialog, openInviteDialog, closeInviteDialog, openInviteCreateDialog, closeInviteCreateDialog} = dialogSlice.actions

export default dialogSlice.reducer