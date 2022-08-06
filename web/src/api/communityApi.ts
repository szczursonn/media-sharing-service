import { customFetch } from "."
import { Album, Community, Invite, Member } from "../types"

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

const createInvite = async (communityId: number, maxUses: number|null, expiresIn: number|null) => {
    const res = await customFetch(`/communities/${communityId}/invites`, {method: 'POST', body: JSON.stringify({maxUses: maxUses??undefined, validTime: expiresIn??undefined})})

    const body = await res.json()
    return body as Invite
}

const removeMember = async (communityId: number, userId: number) => {
    await customFetch(`/communities/${communityId}/members/${userId}`, {method: 'DELETE'})
}

const getCommunityInvites = async (communityId: number) => {
    const res = await customFetch(`/communities/${communityId}/invites`, {method: 'GET'})

    const body = await res.json()
    return body as Invite[]
}

const communityApi = {
    createNewCommunity,
    getCommunityAlbums,
    createNewAlbum,
    getCommunityMembers,
    leaveCommunity,
    createInvite,
    removeMember,
    getCommunityInvites
}

export default communityApi