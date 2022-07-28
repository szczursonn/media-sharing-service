import { DataSource } from "typeorm"
import { createTestDataSource } from "../createDataSource"
import { AlreadyAMemberError, InsufficientPermissionsError, ResourceNotFoundError } from "../errors"
import { CommunityInvite } from "../models/CommunityInvite"
import { CommunityMember } from "../models/CommunityMember"
import { InviteService } from "./InviteService"

describe('InviteService tests', () => {

    let dataSource: DataSource
    let inviteService: InviteService
    
    beforeEach((done)=>{
        createTestDataSource().then((ds)=>{
            dataSource = ds
            inviteService = new InviteService(ds)
            done()
        })
    })

    it('allows to get info about invite', async () => {
        const x = await inviteService.getInvite('abc')
        expect(x.user === null).toBe(false)
    })

    it('disallows to get info about non-existent invite', async () => {
        await expect(inviteService.getInvite('fdsfjhdsfjhsdf')).rejects.toThrowError(ResourceNotFoundError)
    })

    it('allows to get community invites', async () => {
        const invites = await inviteService.getCommunityInvites(1, 3)

        expect(invites.length).toBe(3)
    })

    it('disallows to get invites as non-owner', async () => {
        await expect(inviteService.getCommunityInvites(1, 1)).rejects.toThrowError(InsufficientPermissionsError)
    })

    it('disallows to get invites to non-existent community', async () => {
        await expect(inviteService.getCommunityInvites(555, 1)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('allows to create invite', async () => {
        const invite = await inviteService.createInvite(2, 1, 60000, 3)
        expect(invite.maxUses).toBe(3)
        expect(invite.inviterId).toBe(1)
        expect(invite.communityId).toBe(2)
    })

    it('disallows to create invite for non-existent community', async () => {
        await expect(inviteService.createInvite(999, 1, 60000, 3)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('disallows to create invite if inviter is not an owner', async () => {
        await expect(inviteService.createInvite(1, 2, 60000, 3)).rejects.toThrowError(InsufficientPermissionsError)
    })

    it('allows user to join community', async () => {
        await inviteService.acceptInvite('abc', 4)

        await dataSource.manager.findOneByOrFail(CommunityMember, {
            userId: 4,
            communityId: 2
        })
    })

    it('disallows user to use expired invite', async () => {
        await expect(inviteService.acceptInvite('aaa', 4)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('disallows user to use overused invite', async () => {
        await inviteService.acceptInvite('abc', 4)

        await expect(inviteService.acceptInvite('abc', 3)).rejects.toThrowError(ResourceNotFoundError)
    })

    it('disallows user to join a community he is already in', async () => {
        await expect(inviteService.acceptInvite('abc', 1)).rejects.toThrowError(AlreadyAMemberError)
    })

    it('allows to invalidate an invite', async () => {
        await inviteService.removeInvite('ccc', 3)

        const invite = await dataSource.manager.findOneBy(CommunityInvite, {
            id: 'ccc'
        })

        expect(invite).toBeNull()
    })

    it('disallows to invalidate an invite as non-owner', async () => {
        await expect(inviteService.removeInvite('ccc', 1)).rejects.toThrowError(InsufficientPermissionsError)
    })

    it('disallows to invalidate non-existent invite', async () => {
        await expect(inviteService.removeInvite('fdsfsdfds', 1)).rejects.toThrowError(ResourceNotFoundError)
    })
})