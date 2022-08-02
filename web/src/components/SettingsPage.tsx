import { Avatar, Backdrop, CircularProgress, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material"
import { Container } from "@mui/system"
import { useEffect, useState } from "react"
import { getUserSessions, invalidateSession } from "../db"
import { UserSession } from "../types"
import { Clear, LaptopChromebook } from '@mui/icons-material';

export const SettingsPage = () => {

    const [sessions, setSessions] = useState<UserSession[]|null>(null)
    const [loadingSessions, setLoadingSessions] = useState(false)

    const fetchSessions = async () => {
        setLoadingSessions(true)
        setSessions(null)
        try {
            const sessions = await getUserSessions()
            setSessions(sessions)
        } catch (err) {

        }
        setLoadingSessions(false)
    }
    
    useEffect(()=>{
        fetchSessions()
    }, [])

    return <Container maxWidth='xs' sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <Typography variant="h2">Settings</Typography>
        <Typography variant="h4">Sessions</Typography>
        {
            loadingSessions
            ? <CircularProgress />
            : <>
                {sessions
                ? <List>
                    {sessions.map((session)=><SessionListItem key={session.id} session={session} onDelete={()=>{
                        const newSessions = [...sessions]
                        const index = sessions.indexOf(session)
                        newSessions.splice(index, 1)
                        setSessions(newSessions)
                    }}/>)}
                </List>
                : <Typography variant="h6">eror</Typography>
                }
            </>
        }
    </Container>
}

const SessionListItem = ({session, onDelete}: {session: UserSession, onDelete: ()=>void}) => {
    const [removing, setRemoving] = useState(false)

    const removeSession = async () => {
        setRemoving(true)
        try {
            await invalidateSession(session.id)
            onDelete()
        } catch (err) {

        }
        setRemoving(false)
    }

    return <ListItem secondaryAction={<IconButton onClick={removeSession} edge='end'><Clear /></IconButton>}>
        <ListItemAvatar>
            <Avatar>
                <LaptopChromebook />
            </Avatar>
        </ListItemAvatar>
        <ListItemText primary={session.deviceName ?? 'unknown device'} secondary={`id: ${session.id}`}/>
        <Backdrop sx={{position: 'absolute'}} open={removing}><CircularProgress color='inherit'/></Backdrop>
    </ListItem>
}