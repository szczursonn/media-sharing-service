import { GitHub } from "@mui/icons-material"
import { Avatar, Box, CircularProgress, Divider, IconButton, List, ListItem, ListItemIcon, Tooltip, Typography } from "@mui/material"
import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CommunityContext } from "../contexts/CommunityContext"
import { UserContext } from "../contexts/UserContext"
import { Community } from "../types"
import { CommunityCreateDialog } from "./CommunityCreateDialog"

export const MyDrawer = () => {

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const navigate = useNavigate()

    const {user} = useContext(UserContext)
    const {communities, setCommunities, loading: loadingCommunities, selected: selectedCommunity, select: setSelectedCommunity} = useContext(CommunityContext)

    const onSuccess = (community: Community) => {
        if (!communities) return
        const newCommunities = [...communities, community]
        setCommunities(newCommunities)
        setCreateDialogOpen(false)
        navigate(`/communities/${community.id}`)
    }

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
                                        <IconButton sx={{boxShadow: (selectedCommunity === community ? '0px 0px 15px 5px #0ff' : '')}} onClick={()=>{setSelectedCommunity(community);navigate(`/communities/${community.id}`)}}>
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
