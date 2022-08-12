import { Container, Typography, CircularProgress, Button, Grid, Backdrop, Divider } from "@mui/material"
import { useEffect, useState } from "react"
import communityApi from "../../api/communityApi"
import inviteApi from "../../api/inviteApi"
import { deleteCommunity } from "../../redux/communitySlice"
import { openInviteCreateDialog } from "../../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { Community, Invite } from "../../types"
import { AreYouSureDialog } from "../dialogs/AreYouSureDialog"
import { ErrorDialog } from "../dialogs/ErrorDialog"
import { MemberGrid } from "../MemberGrid"

export const CommunitySettingsPage = ({community}: {community: Community}) => {

    const dispatch = useAppDispatch()
    const isOwner = useAppSelector(state=>state.userReducer.user)?.id === community.ownerId
    
    const deleting = useAppSelector(state=>state.communityReducer.deleting)
    const deletingError = useAppSelector(state=>state.communityReducer.deletingError)

    const removingError = useAppSelector(state=>state.memberReducer.removingError)
    const [openRemovingErrorDialog, setOpenRemovingErrorDialog] = useState(false)

    const [invites, setInvites] = useState<Invite[]|null>(null)
    const [loadingInvites, setLoadingInvites] = useState(false)
    const [removingInvite, setRemovingInvite] = useState(false)
    const [openAreYouSureDialog, setOpenAreYouSureDialog] = useState(false)

    const loadInvites = async () => {
        setLoadingInvites(true)
        setInvites(null)
        try {
            const invites = await communityApi.getCommunityInvites(community.id)
            setInvites(invites)
        } catch (err) {

        }
        setLoadingInvites(false)
    }
    const invalidateInvite = async (inviteId: string) => {
        setRemovingInvite(true)
        try {
            await inviteApi.invalidateInvite(inviteId)
            if (invites) {
                const newInvites = [...invites]
                const i = newInvites.findIndex(inv=>inv.id===inviteId)
                if (i !== -1) {
                    newInvites.splice(i, 1)
                    setInvites(newInvites)
                }
            }
        } catch (err) {

        }
        setRemovingInvite(false)
    }
    const removeCommunity = () => {
        setOpenAreYouSureDialog(false)
        dispatch(deleteCommunity(community.id))
    }

    useEffect(()=>{
        if (removingError !== null) setOpenRemovingErrorDialog(true)
    }, [removingError])

    useEffect(()=>{
        loadInvites()
    }, [community])

    return <Container maxWidth='lg' sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <Typography variant="h4">Members</Typography>
        <MemberGrid showRemove={isOwner} showUpload={true} community={community} />
        <Divider light sx={{width: '100%', marginTop: 2, marginBottom: 2}}/>
        <Typography variant="h4">Invites</Typography>
        {
            loadingInvites
            ? <CircularProgress />
            : <Grid container>
                {
                    invites
                    ? <>
                        {invites.map(i=><Grid item key={i.id} sx={{bgcolor: '#1e1e1e', padding: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 1}}>
                            <Typography>{i.id}</Typography>
                            <Typography>Created by: {i.inviter ? i.inviter.username : 'deleted user'}</Typography>
                            <Typography>Uses: {i.uses}/{i.maxUses ?? '∞'}</Typography>
                            <Typography>expires at: {i.expiresAt ? new Date((i.expiresAt)).toLocaleString() : 'never'}</Typography>
                            <Button variant='outlined' disabled={removingInvite} onClick={()=>invalidateInvite(i.id)}>Invalidate</Button>
                        </Grid>)}
                        {invites.length === 0 && <Typography>There are currently no invites for this community</Typography>}
                    </>
                    : <Typography>error loading invites :(</Typography>
                }
            </Grid>
        }
        <Button variant="outlined" onClick={()=>dispatch(openInviteCreateDialog(community.id))}>Invite</Button>
        <Divider light sx={{width: '100%', marginTop: 2, marginBottom: 2}}/>
        <Button variant="contained" color="error" onClick={()=>setOpenAreYouSureDialog(true)}>DELETE COMMUNITY</Button>
        {deletingError && <Typography color='error'>Error: {deletingError}</Typography>}
        <Backdrop open={deleting}><CircularProgress /></Backdrop>
        <AreYouSureDialog open={openAreYouSureDialog} onNo={() => setOpenAreYouSureDialog(false)} onYes={removeCommunity} description={'Are you sure you want do delete this community?'} />
        <ErrorDialog open={openRemovingErrorDialog} title='Error' description={`Error kicking member: ${removingError}`} onClose={()=>setOpenRemovingErrorDialog(false)} />
    </Container>
}

