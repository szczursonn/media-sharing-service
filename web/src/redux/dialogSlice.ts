import { createSlice } from '@reduxjs/toolkit'
import { createAlbum } from './albumSlice'

type DialogState = {
    loginOpen: boolean,
    communityCreateOpen: boolean,
    inviteOpen: boolean,
    inviteCreateOpen: boolean,
    inviteCreateTargetId: number|null,
    albumCreateOpen: boolean,
    albumCreateTargetId: number|null,
    mockLoginOpen: boolean
}

const initialState: DialogState = {
    loginOpen: false,
    communityCreateOpen: false,
    inviteOpen: false,
    inviteCreateOpen: false,
    inviteCreateTargetId: null,
    albumCreateOpen: false,
    albumCreateTargetId: null,
    mockLoginOpen: false
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
        },

        openAlbumCreateDialog: (state, action: {payload: number}) => {
            state.albumCreateOpen = true
            state.albumCreateTargetId = action.payload
        },
        closeAlbumCreateDialog: (state) => {
            state.albumCreateOpen = false
        },

        openMockLoginDialog: (state) => {
            state.mockLoginOpen = true
        },
        closeMockLoginDialog: (state) => {
            state.mockLoginOpen = false
        }
    },
    extraReducers: (builder) => {
        builder.addCase(createAlbum.fulfilled, (state, action) => {
            if (action.payload.err === null) state.albumCreateOpen = false
        })
    },
})

export const {
    openLoginDialog, 
    closeLoginDialog, 
    openCommunityCreateDialog, 
    closeCommunityCreateDialog, 
    openInviteDialog, 
    closeInviteDialog, 
    openInviteCreateDialog, 
    closeInviteCreateDialog,
    openAlbumCreateDialog,
    closeAlbumCreateDialog,
    openMockLoginDialog,
    closeMockLoginDialog
} = dialogSlice.actions

export default dialogSlice.reducer