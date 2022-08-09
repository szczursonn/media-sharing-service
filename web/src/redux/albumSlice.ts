import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import albumApi from "../api/albumApi";
import communityApi from "../api/communityApi";
import { AppError } from "../errors";
import { Album, ThunkResult } from "../types";
import { RootState } from "./store";

type AlbumState = {
    albums: Album[]|null
    loading: boolean
    error: string|null
    creating: boolean
    creatingError: string|null
    selectedAlbumId: number|null
    renaming: boolean
    renamingError: string|null
    deleting: boolean
    deletingError: string|null
}

const initialState: AlbumState = {
    albums: null,
    loading: false,
    error: null,
    creating: false,
    creatingError: null,
    selectedAlbumId: null,
    renaming: false,
    renamingError: null,
    deleting: false,
    deletingError: null
}

export const albumSlice = createSlice({
    name: 'album',
    initialState,
    reducers: {
        selectAlbum: (state, action: {payload: number|null}) => {
            state.selectedAlbumId = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAlbums.pending, (state) => {
            state.loading = true
            state.albums = null
            state.error = null
        })
        builder.addCase(fetchAlbums.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.error = action.payload.err
            } else {
                state.albums = action.payload.data
            }
            state.loading = false
        })

        builder.addCase(createAlbum.pending, (state) => {
            state.creating = true
            state.creatingError = null
        })
        builder.addCase(createAlbum.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.creatingError = err
            } else {
                state.albums?.push(action.payload.data!)
            }
            state.creating = false
        })

        builder.addCase(renameAlbum.pending, (state) => {
            state.renaming = true
            state.renamingError = null
        })
        builder.addCase(renameAlbum.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.renamingError = err
            } else if (state.albums) {
                const i = state.albums.findIndex(a=>a.id===action.payload.data?.id)
                if (i!==-1) state.albums[i]=action.payload.data!
            }
            state.renaming = false
        })

        builder.addCase(deleteAlbum.pending, (state) => {
            state.deleting = true
            state.deletingError = null
        })
        builder.addCase(deleteAlbum.fulfilled, (state, action) => {
            const err = action.payload.err
            if (err) {
                state.deletingError = err
            } else if (state.albums) {
                const i = state.albums.findIndex(a=>a.id===action.payload.data)
                if (i!==-1) state.albums.splice(i, 1)
            }
            state.deleting = false
        })
    },
})

export const fetchAlbums = createAsyncThunk('album/fetchAlbums', async (communityId: number): Promise<ThunkResult<Album[]>> => {
    try {
        const albums = await communityApi.getCommunityAlbums(communityId)
        return {
            err: null,
            data: albums
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

export const createAlbum = createAsyncThunk('album/createAlbum', async ({communityId, albumName}: {communityId: number, albumName: string}): Promise<ThunkResult<Album>> => {
    try {
        const album = await communityApi.createNewAlbum(communityId, albumName)
        return {
            err: null,
            data: album
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

export const renameAlbum = createAsyncThunk('album/renameAlbum', async ({albumId, name}: {albumId: number, name: string}): Promise<ThunkResult<Album>> => {
    try {
        const album = await albumApi.renameAlbum(albumId, name)
        return {
            err: null,
            data: album
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

export const deleteAlbum = createAsyncThunk('album/deleteAlbum', async (albumId: number): Promise<ThunkResult<number>> => {
    try {
        await albumApi.deleteAlbum(albumId)
        return {
            err: null,
            data: albumId
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

export const selectSelectedAlbum = () => (state: RootState): Album|null => {
    return state.albumReducer.albums?.find(a=>a.id===state.albumReducer.selectedAlbumId) ?? null
}

export const {selectAlbum} = albumSlice.actions

export default albumSlice.reducer