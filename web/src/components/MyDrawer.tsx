import { GitHub } from "@mui/icons-material"
import { Avatar, Box, CircularProgress, Divider, IconButton, List, ListItem, ListItemIcon, Tooltip, Typography } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { selectCommunity } from "../redux/communitySlice"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { Community } from "../types"
import { CommunityCreateDialog } from "./CommunityCreateDialog"

export const MyDrawer = () => {

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const navigate = useNavigate()

    const dispatch = useAppDispatch()
    const user = useAppSelector(state=>state.userReducer.user)
    const communities = useAppSelector(state=>state.communityReducer.communities)
    const loadingCommunities = useAppSelector(state=>state.communityReducer.loading)
    const selectedCommunity = useAppSelector(state=>state.communityReducer.selected)

    const onCommunityClick = (community: Community) => {
        dispatch(selectCommunity(community))
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
                                        <IconButton sx={{boxShadow: (selectedCommunity === community ? '0px 0px 15px 5px #0ff' : '')}} onClick={()=>onCommunityClick(community)}>
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
        <CommunityCreateDialog open={createDialogOpen} onClose={()=>setCreateDialogOpen(false)} />
    </Box>
}
