import { Avatar, Box, Button, CircularProgress, Paper, Stack, Typography, Container } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { acceptInvite, getInvite } from "../api"
import { CommunityContext } from "../contexts/CommunityContext"
import { UserContext } from "../contexts/UserContext"
import { ResourceNotFoundError } from "../errors"
import { Invite } from "../types"

export const InvitePage = ({onLoginClick}: {onLoginClick: ()=>void}) => {

    const {inviteId} = useParams()

    const navigate = useNavigate()

    const [invite, setInvite] = useState<Invite|null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [acceptingInvite, setAcceptingInvite] = useState(false)

    const loadInvite = async () => {
        setLoading(true)
        setInvite(null)
        try {
            const inv = await getInvite(inviteId!)
            setInvite(inv)
            setError('')
        } catch (err) {
            if (err instanceof ResourceNotFoundError) setError('Invalid invite')
            else setError(`Unknown error fetching invite: ${err}`)
        }
        setLoading(false)
    }

    const onJoin = async () => {
        if (!inviteId) return
        setAcceptingInvite(true)
        try {
            const com = await acceptInvite(inviteId)
            if (comCtx.communities) {
                const newComs = [...comCtx.communities, com]
                comCtx.setCommunities(newComs)
            }
            navigate(`/communities/${com.id}`)
        } catch (err) {
            setError(`Unknown error accepting invite: ${err}`)
        }
        setAcceptingInvite(false)
    }

    const userCtx = useContext(UserContext)
    const comCtx = useContext(CommunityContext)

    const alreadyJoined = (invite && comCtx.communities) ? !!comCtx.communities.find(c=>c.id===invite.community.id) : false

    useEffect(()=>{
        loadInvite()
    }, [])

    return <Box>
        <Stack sx={{alignItems: 'center'}}>
            <Box sx={{height: 40}}></Box>
            {
                loading
                ? <CircularProgress />
                : <>
                    {
                        invite
                        ? <>
                            <Paper elevation={5} sx={{padding: '15px', display: 'flex', justifyItems: 'center', flexDirection: 'column', textAlign: 'center'}}>
                                <Typography variant="h4">You have been invited to join</Typography>
                                <Typography variant="h5">{invite.community.name}</Typography>
                                {invite.inviter && <>
                                    <Typography>by</Typography>
                                    <Container sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <Avatar alt={invite.inviter.username} src={invite.inviter.avatarUrl ?? undefined} />
                                        <Typography sx={{marginLeft: 1}}>{invite.inviter.username}</Typography>
                                    </Container>
                                </>}
                                <Box sx={{marginTop: 1}}></Box>
                                {(!userCtx.loading && !userCtx.user)
                                ? <Button variant="outlined" onClick={onLoginClick}>Sign up</Button>
                                : <>
                                    <Button disabled={alreadyJoined || comCtx.loading || acceptingInvite} variant="contained" onClick={onJoin}>Join</Button>
                                    {alreadyJoined && <Typography>You are already a member of this community!</Typography>}
                                </>
                                }
                            </Paper>
                        </>
                        : <Paper elevation={5} sx={{padding: '15px', display: 'flex', justifyItems: 'center', flexDirection: 'column'}}>
                            <Typography variant="h5" color='error'>{error}</Typography>
                            <Button variant="contained" onClick={()=>navigate('/')}>HOME</Button>
                        </Paper>
                    }
                </>
            }
        </Stack>
    </Box>
}