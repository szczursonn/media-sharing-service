import { customFetch } from "."
import { Community, Invite } from "../types"

const getInvite = async (inviteId: string) => {
    const res = await customFetch(`/invite/${inviteId}`, {method: 'GET', auth: false})

    const body = await res.json()
    return body as Invite
}

const acceptInvite = async (inviteId: string) => {
    const res = await customFetch(`/invite/${inviteId}`, {method: 'POST'})

    const body = await res.json()
    return body as Community
}

const invalidateInvite = async (inviteId: string) => {
    await customFetch(`/invite/${inviteId}`, {method: 'DELETE'})
}

const inviteApi = {
    getInvite,
    acceptInvite,
    invalidateInvite
}

export default inviteApi