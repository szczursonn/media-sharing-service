import { createSlice } from '@reduxjs/toolkit'

type DialogState = {
    loginOpen: boolean,
    communityCreateOpen: boolean,
    inviteOpen: boolean
}

const initialState: DialogState = {
    loginOpen: false,
    communityCreateOpen: false,
    inviteOpen: false
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
        }
    }
})

export const {openLoginDialog, closeLoginDialog, openCommunityCreateDialog, closeCommunityCreateDialog, openInviteDialog, closeInviteDialog} = dialogSlice.actions

export default dialogSlice.reducer