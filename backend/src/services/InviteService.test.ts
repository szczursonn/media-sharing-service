import { createTestDataSource } from "../createDataSource"
import { InviteService } from "./InviteService"

describe('InviteService tests', () => {
    it('allows to get info about invite', async () => {
        const inviteService = await thereIsInviteService()

        const x = await inviteService.getInvite('abc')
        expect(x.user === null).toBe(false)
    })
})

const thereIsInviteService = async () => {
    const dataSource = await createTestDataSource()
    const inviteService = new InviteService(dataSource)
    return inviteService
}