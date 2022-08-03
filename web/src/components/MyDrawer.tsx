import { GitHub } from "@mui/icons-material"
import { Avatar, Box, Button, CircularProgress, Divider, IconButton, List, ListItem, ListItemIcon, Tooltip, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { getUserCommunities } from "../api"
import { UserContext } from "../contexts/UserContext"
import { Community } from "../types"
import { CommunityCreateDialog } from "./CommunityCreateDialog"

export const MyDrawer = () => {

    const [communities, setCommunities] = useState<Community[]|null>(null)
    const [loadingCommunities, setLoadingCommunities] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    const {user} = useContext(UserContext)

    const fetchCommunities = async () => {
        if (!user) return
        setCommunities(null)
        setLoadingCommunities(true)
        try {
            const com = await getUserCommunities()
            setCommunities(com)
        } catch (err) {

        }
        setLoadingCommunities(false)
    }

    const onSuccess = (community: Community) => {
        if (!communities) return
        const newCommunities = [...communities, community]
        setCommunities(newCommunities)
        setCreateDialogOpen(false)
    }

    useEffect(()=>{
        fetchCommunities()
    }, [user])

    return <Box sx={{borderColor: '#111', borderWidth: 2, borderStyle: 'solid', borderRightColor: '#333', height: '93.5vh'}}>
        {
            user && <>{
                    loadingCommunities
                    ? <CircularProgress />
                    : <>
                        {
                            communities
                            ? <List disablePadding>
                                {communities.map((community)=><ListItem key={community.id} sx={{paddingLeft: '8px'}}>
                                    <ListItemIcon>
                                        <IconButton>
                                            <Tooltip title={community.name}>
                                                <Avatar alt={community.name} src={'fdsfds'} />
                                            </Tooltip>
                                        </IconButton>
                                    </ListItemIcon>
                                </ListItem>)}

                                <ListItem sx={{paddingLeft: '8px'}}>
                                    <ListItemIcon>
                                        <IconButton onClick={()=>setCreateDialogOpen(true)}>
                                            <Tooltip title='Create new community'>
                                                <Avatar>+</Avatar>
                                            </Tooltip>
                                        </IconButton>
                                    </ListItemIcon>
                                </ListItem>
                            </List>
                            : <>
                                <Typography variant="body2">Failed to fetch communities</Typography>
                                <Button onClick={fetchCommunities}>retry</Button>
                            </>
                        }
                    </>
                }</>
        }
        <Divider />
        <List disablePadding>
            <ListItem>
                <ListItemIcon>
                    <Tooltip title='Github repo'>
                        <IconButton onClick={()=>window.open('https://github.com/szczursonn/media-sharing-service', '_blank')}>
                            <GitHub />
                        </IconButton>
                    </Tooltip>
                </ListItemIcon>
            </ListItem>
        </List>
        <CommunityCreateDialog open={createDialogOpen} onCancel={()=>setCreateDialogOpen(false)} onSuccess={onSuccess} />
    </Box>
}
