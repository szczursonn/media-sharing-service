import { customFetch } from "."
import { Album, Community, Member } from "../types"

const createNewCommunity = async (name: string) => {
    const res = await customFetch('/communities', {method: 'POST', body: JSON.stringify({name})})

    const body = await res.json()
    return body as Community
}

const getCommunityAlbums = async (communityId: number) => {
    const res = await customFetch(`/communities/${communityId}/albums`, {method: 'GET'})

    const body = await res.json()
    return body as Album[]
}

const createNewAlbum = async (communityId: number, name: string) => {
    const res = await customFetch(`/communities/${communityId}/albums`, {method: 'POST', body: JSON.stringify({name})})

    const body = await res.json()
    return body as Album
}

const getCommunityMembers = async (communityId: number) => {
    const res = await customFetch(`/communities/${communityId}/members`, {method: 'GET'})

    const body = await res.json()
    return body as Member[]
}

const leaveCommunity = async (communityId: number) => {
    await customFetch(`/users/@me/communities/${communityId}`, {method: 'DELETE'})
}

const communityApi = {
    createNewCommunity,
    getCommunityAlbums,
    createNewAlbum,
    getCommunityMembers,
    leaveCommunity
}

export default communityApi