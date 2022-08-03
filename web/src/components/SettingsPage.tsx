import { Avatar, Backdrop, Button, CircularProgress, IconButton, List, ListItem, ListItemAvatar, ListItemText, TextField, Typography } from "@mui/material"
import { Container } from "@mui/system"
import { useContext, useEffect, useState } from "react"
import { getUserConnections, getUserSessions, invalidateSession, removeUserConnection, updateUser } from "../api"
import { OAuth2Provider, UserConnection, UserSession } from "../types"
import { Clear, LaptopChromebook } from '@mui/icons-material';
import { AreYouSureDialog } from "./AreYouSureDialog"
import { ErrorDialog } from "./ErrorDialog"
import githubIcon from '../svg/githubIcon.svg'
import discordIcon from '../svg/discordIcon.svg'
import googleIcon from '../svg/googleIcon.svg'
import { CannotRemoveLastUserConnectionError } from "../errors"
import { DISCORD_OAUTH_URL, GITHUB_OAUTH_URL, GOOGLE_OAUTH_URL } from "../constants"
import { UserContext } from "../contexts/UserContext"

export const SettingsPage = () => {

    const ctx = useContext(UserContext)

    const [newUsername, setNewUsername] = useState(ctx.user?.username ?? '')
    const [savingUsername, setSavingUsername] = useState(false)

    const [sessions, setSessions] = useState<UserSession[]|null>(null)
    const [loadingSessions, setLoadingSessions] = useState(false)

    const [connections, setConnections] = useState<UserConnection[]|null>(null)
    const [loadingConnections, setLoadingConnections] = useState(false)

    const updateUsername = async () => {
        setSavingUsername(true)
        try {
            const user = await updateUser(newUsername)
            ctx.setUser(user)
        } catch (err) {

        }
        setSavingUsername(false)
    }

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

    const fetchConnections = async () => {
        setLoadingConnections(true)
        setConnections(null)
        try {
            const cons = await getUserConnections()
            setConnections(cons)
        } catch (err) {

        }
        setLoadingConnections(false)
    }

    const removeConnection = (type: OAuth2Provider) => {
        if (!connections) return
        const newCons = [...connections]
        const index = newCons.findIndex(c=>c.type===type)
        if (index < 0) return
        newCons.splice(index, 1)
        setConnections(newCons)
    }
    
    useEffect(()=>{
        fetchSessions()
        fetchConnections()
    }, [])

    return <Container maxWidth='xs' sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <Typography variant="h2">Settings</Typography>
        <Typography variant="h4">Username</Typography>
        <TextField
        autoFocus
        margin="dense"
        id="name"
        label="Username"
        type="text"
        fullWidth
        variant="standard"
        value={newUsername}
        onChange={(e)=>setNewUsername(e.currentTarget.value)}
        />
        <Button disabled={savingUsername} onClick={updateUsername}>Update</Button>
        <Typography variant="h4">Sessions</Typography>
        {
            loadingSessions
            ? <CircularProgress />
            : <>
                {sessions
                ? <>
                    <List>
                        {sessions.map((session)=><SessionListItem key={session.id} session={session} onDelete={() => {
                            const newSessions = [...sessions]
                            const index = sessions.indexOf(session)
                            newSessions.splice(index, 1)
                            setSessions(newSessions)
                        }}/>)}
                    </List>
                </>
                : <>
                        <Typography variant="h6">Error fetching sessions</Typography>
                        <Button variant='contained' onClick={fetchSessions}>Retry</Button>
                    </>
                }
            </>
        }
        <Typography variant="h4">Connections</Typography>
        {
            loadingConnections
            ? <CircularProgress />
            : <>
                {
                    connections
                    ? <List>
                        <ConnectionListItem connections={connections} type='discord' onDelete={()=>removeConnection('discord')} />
                        <ConnectionListItem connections={connections} type='google' onDelete={()=>removeConnection('google')} />
                        <ConnectionListItem connections={connections} type='github' onDelete={()=>removeConnection('github')} />
                    </List>
                    : <>
                        <Typography variant="h6">Error fetching connections</Typography>
                        <Button variant='contained' onClick={fetchConnections}>Retry</Button>
                    </>
                }
            </>
        }
    </Container>
}

const SessionListItem = ({session, onDelete}: {session: UserSession, onDelete: ()=>void}) => {
    const [removing, setRemoving] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [openErrorDialog, setOpenErrorDialog] = useState(false)
    const [error, setError] = useState<string>('')

    const removeSession = async () => {
        setOpenDialog(false)
        setRemoving(true)
        try {
            await invalidateSession(session.id)
            onDelete()
        } catch (err) {
            setOpenErrorDialog(true)
            setError(String(err))
        }
        setRemoving(false)
    }

    return <ListItem secondaryAction={<IconButton onClick={()=>setOpenDialog(true)} edge='end'><Clear /></IconButton>}>
        <ListItemAvatar>
            <Avatar>
                <LaptopChromebook />
            </Avatar>
        </ListItemAvatar>
        <ListItemText primary={session.deviceName ?? 'unknown device'} secondary={`id: ${session.id}`}/>
        <Backdrop sx={{position: 'absolute'}} open={removing}><CircularProgress color='inherit'/></Backdrop>
        <AreYouSureDialog
            open={openDialog}
            description='Are you sure you want to invalidate the session?'
            onNo={()=>setOpenDialog(false)}
            onYes={()=>removeSession()}
        />
        <ErrorDialog
            open={openErrorDialog}
            title='Unexpected error'
            description={`There was an error invalidating session ${session.id}: ${error}`}
            onClose={()=>setOpenErrorDialog(false)}
        />
    </ListItem>
}

const ConnectionListItem = ({connections, type, onDelete}: {connections: UserConnection[], type: OAuth2Provider, onDelete: ()=>void}) => {

    const [removing, setRemoving] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [openErrorDialog, setOpenErrorDialog] = useState(false)
    const [error, setError] = useState<string>('')

    const removeConnection = async () => {
        setOpenDialog(false)
        setRemoving(true)
        try {
            await removeUserConnection(type)
            onDelete()
        } catch (err) {
            
            setOpenErrorDialog(true)
            if (err instanceof CannotRemoveLastUserConnectionError) setError('Cannot remove the last user connection')
            else setError(String(err))
        }
        setRemoving(false)
    }

    let icon: string
    switch (type) {
        case 'google':
            icon=googleIcon
            break
        case 'discord':
            icon=discordIcon
            break
        case 'github':
            icon=githubIcon
            break
    }

    let connectUrl: string
    switch (type) {
        case 'google':
            connectUrl=GOOGLE_OAUTH_URL
            break
        case 'discord':
            connectUrl=DISCORD_OAUTH_URL
            break
        case 'github':
            connectUrl=GITHUB_OAUTH_URL
            break
    }

    const connection = connections.find(con=>con.type===type)

    return <ListItem>
        <ListItemAvatar>
            <Avatar>
                <img style={{maxHeight: 20}} src={icon} alt={`${type} logo`} />
            </Avatar>
        </ListItemAvatar>
        {
            connection
            ? <>
                <ListItemText primary={connection.foreignUsername} secondary={`since ${new Date(connection.createdAt).toLocaleDateString()}`}/>
                <Button sx={{marginLeft: 2}} variant='outlined' onClick={()=>setOpenDialog(true)}>Disconnect</Button>
            </>
            : <>
                <ListItemText primary='Not connected'/>
                <Button sx={{marginLeft: 2}} variant='outlined' onClick={()=>window.location.href = connectUrl}>Connect</Button>
            </>
        }
        <Backdrop sx={{position: 'absolute'}} open={removing}><CircularProgress color='inherit'/></Backdrop>
        <AreYouSureDialog
            open={openDialog}
            description={`Are you sure you want to remove connection with ${type}?`}
            onNo={()=>setOpenDialog(false)}
            onYes={()=>removeConnection()}
        />
        <ErrorDialog
            open={openErrorDialog}
            title='Unexpected error'
            description={`There was an error removing connection with ${type}: ${error}`}
            onClose={()=>setOpenErrorDialog(false)}
        />
    </ListItem>
}