import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import communityApi from "../api/communityApi";
import { AppError } from "../errors";
import { Album, ThunkResult } from "../types";

type AlbumState = {
    albums: Album[]|null
    loading: boolean
    error: string|null
    creating: boolean
    creatingError: string|null
}

const initialState: AlbumState = {
    albums: null,
    loading: false,
    error: null,
    creating: false,
    creatingError: null
}

export const albumSlice = createSlice({
    name: 'album',
    initialState,
    reducers: {

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

//export const {} = albumSlice.actions

export default albumSlice.reducer