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

const inviteApi = {
    getInvite,
    acceptInvite
}

export default inviteApi