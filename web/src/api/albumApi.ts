import { customFetch } from "."
import { Album, Media } from "../types"

const getMedia = async (albumId: number): Promise<Media[]> => {
    const res = await customFetch(`/albums/${albumId}/media`, {method: 'GET'})

    const body = await res.json()
    return body as Media[]
}

const uploadMedia = async (albumId: number, file: File): Promise<Media> => {
    const payload = new FormData()
    payload.append('media', file, file.name)

    const res = await customFetch(`/albums/${albumId}/media`, {method: 'POST', body: payload, contentType: null})

    const body = await res.json()
    return body as Media
}

const deleteMedia = async (albumId: number, filename: string): Promise<void> => {
    await customFetch(`/albums/${albumId}/media/${filename}`, {method: 'DELETE'})
}

const renameAlbum = async (albumId: number, name: string) => {
    const res = await customFetch(`/albums/${albumId}`, {method: 'PATCH', body: JSON.stringify({name})})

    const body = await res.json()
    return body as Album
}

const deleteAlbum = async (albumId: number) => {
    await customFetch(`/albums/${albumId}`, {method: 'DELETE'})
}

const albumApi = {
    getMedia,
    uploadMedia,
    deleteMedia,
    renameAlbum,
    deleteAlbum
}

export default albumApi