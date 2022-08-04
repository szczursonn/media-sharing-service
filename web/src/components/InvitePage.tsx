import { Avatar, Box, Button, CircularProgress, Paper, Stack, Typography, Container } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { acceptInvite, getInvite } from "../api"
import { AppError } from "../errors"
import { setCommunities } from "../redux/communitySlice"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { openLoginDialog } from "../redux/loginSlice"
import { Invite } from "../types"

export const InvitePage = () => {

    const {inviteId} = useParams()

    const dispatch = useAppDispatch()

    const communities = useAppSelector(state=>state.communityReducer.communities)
    const loadingCommunities = useAppSelector(state=>state.communityReducer.loading)

    const navigate = useNavigate()

    const [invite, setInvite] = useState<Invite|null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [acceptingInvite, setAcceptingInvite] = useState(false)

    const onLoginClick = () => {
        dispatch(openLoginDialog())
    }

    const loadInvite = async () => {
        setLoading(true)
        setInvite(null)
        try {
            const inv = await getInvite(inviteId!)
            setInvite(inv)
            setError('')
        } catch (err) {
            if (err instanceof AppError) {
                if (err.type === 'resource_not_found') setError('Invalid invite')
                setError(`Unexpected error when fetching invite: ${err.type}`)
            }
            else setError(`Unknown error fetching invite: ${err}`)
        }
        setLoading(false)
    }

    const onJoin = async () => {
        if (!inviteId) return
        setAcceptingInvite(true)
        try {
            const com = await acceptInvite(inviteId)
            if (communities) {
                const newComs = [...communities, com]
                dispatch(setCommunities(newComs))
            }
            navigate(`/communities/${com.id}`)
        } catch (err) {
            setError(`Unknown error accepting invite: ${err}`)
        }
        setAcceptingInvite(false)
    }

    const user = useAppSelector(state=>state.userReducer.user)
    const loadingUser = useAppSelector(state=>state.userReducer.loading)

    const alreadyJoined = (invite && communities) ? !!communities.find(c=>c.id===invite.community.id) : false

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
                                {(!loadingUser && !user)
                                ? <Button variant="outlined" onClick={onLoginClick}>Sign up</Button>
                                : <>
                                    <Button disabled={alreadyJoined || loadingCommunities || acceptingInvite} variant="contained" onClick={onJoin}>Join</Button>
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