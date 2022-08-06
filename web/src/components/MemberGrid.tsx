import { PersonRemove } from "@mui/icons-material"
import { Avatar, Box, CircularProgress, Grid, IconButton, Paper, Typography } from "@mui/material"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { kickMember } from "../redux/memberSlice"
import { Community, Member } from "../types"
import { AreYouSureDialog } from "./dialogs/AreYouSureDialog"

export const MemberGrid = ({showRemove, community}: {showRemove: boolean, community: Community}) => {

    const members = useAppSelector(state=>state.memberReducer.members)
    const loadingMembers = useAppSelector(state=>state.memberReducer.loading)

    return <>
        {
            loadingMembers
            ? <CircularProgress />
            : <Grid container>
                {
                    members
                    ? <>
                        {members.map(m=><MemberGridItem key={m.user.id} community={community} member={m} showRemove={showRemove} />)}
                    </>
                    : <Typography>eror :(</Typography>
                }
            </Grid>
        }
    </>
}

const MemberGridItem = ({community, member, showRemove}: {community: Community, member: Member, showRemove: boolean}) => {

    const dispatch = useAppDispatch()
    const [areYouSureOpen, setAreYouSureOpen] = useState(false)
    const removing = useAppSelector(state=>state.memberReducer.removing)

    const removeMember = async () => {
        setAreYouSureOpen(false)
        dispatch(kickMember({
            communityId: community.id,
            userId: member.user.id
        }))
    }

    const isOwner = member.user.id===community.ownerId

    return <Grid item key={member.user.id} sx={{margin: 1}}>
        <Paper sx={{padding: 1.5, alignItems: 'center', display: 'flex'}}>
            <Avatar src={member.user.avatarUrl ?? undefined}/>
            <Box>
                <Typography sx={{marginLeft: 1}}>{member.user.username}</Typography>
                {isOwner && <Typography variant='caption' sx={{marginLeft: 1}}>OWNER</Typography>}
            </Box>
            {showRemove && <IconButton disabled={removing || isOwner} onClick={()=>setAreYouSureOpen(true)}>
                <PersonRemove />
            </IconButton>}
        </Paper>
        <AreYouSureDialog open={areYouSureOpen} description={`Are you sure you want to kick ${member.user.username} from the community?`} onYes={removeMember} onNo={()=>setAreYouSureOpen(false)}/>
    </Grid>
}