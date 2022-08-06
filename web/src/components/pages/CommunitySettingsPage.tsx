import { PersonRemove } from "@mui/icons-material"
import { Container, Typography, Grid, CircularProgress, Paper, Avatar, IconButton } from "@mui/material"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { kickMember } from "../../redux/memberSlice"
import { Community, Member } from "../../types"
import { AreYouSureDialog } from "../dialogs/AreYouSureDialog"
import { ErrorDialog } from "../dialogs/ErrorDialog"

export const CommunitySettingsPage = ({community}: {community: Community}) => {

    const isOwner = useAppSelector(state=>state.userReducer.user)?.id === community.ownerId
    
    const members = useAppSelector(state=>state.memberReducer.members)
    const loadingMembers = useAppSelector(state=>state.memberReducer.loading)
    const removingError = useAppSelector(state=>state.memberReducer.removingError)
    const [openRemovingErrorDialog, setOpenRemovingErrorDialog] = useState(false)

    useEffect(()=>{
        if (removingError !== null) setOpenRemovingErrorDialog(true)
    }, [removingError])

    return <Container maxWidth='lg' sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <Typography variant="h4">Members</Typography>
        {
            loadingMembers
            ? <CircularProgress />
            : <Grid container>
                {
                    members
                    ? <>
                        {members.map(m=><MemberGridItem key={m.user.id} communityId={community.id} member={m} showRemove={isOwner} />)}
                    </>
                    : <Typography>eror :(</Typography>
                }
            </Grid>
        }
        <ErrorDialog open={openRemovingErrorDialog} title='Error' description={`Error kicking member: ${removingError}`} onClose={()=>setOpenRemovingErrorDialog(false)} />
    </Container>
}

const MemberGridItem = ({communityId, member, showRemove}: {communityId: number, member: Member, showRemove: boolean}) => {

    const dispatch = useAppDispatch()
    const [areYouSureOpen, setAreYouSureOpen] = useState(false)
    const removing = useAppSelector(state=>state.memberReducer.removing)

    const removeMember = async () => {
        setAreYouSureOpen(false)
        dispatch(kickMember({
            communityId,
            userId: member.user.id
        }))
    }

    return <Grid item key={member.user.id} sx={{margin: 1}}>
        <Paper sx={{padding: 1.5, alignItems: 'center', display: 'flex'}}>
            <Avatar src={member.user.avatarUrl ?? undefined}/>
            <Typography sx={{marginLeft: 1}}>{member.user.username}</Typography>
            {showRemove && <IconButton disabled={removing} onClick={()=>setAreYouSureOpen(true)}>
                <PersonRemove />
            </IconButton>}
        </Paper>
        <AreYouSureDialog open={areYouSureOpen} description={`Are you sure you want to kick ${member.user.username} from the community?`} onYes={removeMember} onNo={()=>setAreYouSureOpen(false)}/>
    </Grid>
}