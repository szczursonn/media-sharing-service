import { GitHub, Logout, Mail, Settings } from "@mui/icons-material"
import { Avatar, Box, Button, CircularProgress, Divider, IconButton, List, ListItem, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchCommunities, leaveCommunity, selectCommunity } from "../redux/communitySlice"
import { openCommunityCreateDialog, openInviteDialog } from "../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { Community } from "../types"
import { ErrorDialog } from "./dialogs/ErrorDialog"

export const MyDrawer = () => {

    const dispatch = useAppDispatch()
    const user = useAppSelector(state=>state.userReducer.user)
    const communities = useAppSelector(state=>state.communityReducer.communities)
    const loadingCommunities = useAppSelector(state=>state.communityReducer.loading)
    
    const leavingError = useAppSelector(state=>state.communityReducer.leavingError)
    const [leavingErrorOpened, setLeavingErrorOpened] = useState(false)

    useEffect(()=>{
        if (leavingError !== null) setLeavingErrorOpened(true)
    }, [leavingError])

    return <Box sx={{borderColor: '#111', borderWidth: 2, borderStyle: 'solid', borderRightColor: '#333', height: '93.5vh'}}>
        <List disablePadding>
        {
            user && <>{
                    loadingCommunities
                    ? <CircularProgress />
                    : <>
                        {
                            communities
                            ? <>
                                {communities.map((community)=><CommunityListItem key={community.id} community={community}/>)}
                            </>
                            : <>
                                <Typography variant="body2">Failed to fetch communities</Typography>
                                <Button variant='contained' onClick={()=>dispatch(fetchCommunities())}>Retry</Button>
                            </>
                        }
                    </>
                }</>
        }
            <ListItem sx={{paddingLeft: '8px'}}>
                <ListItemIcon>
                    <IconButton onClick={()=>{
                        if (user) dispatch(openCommunityCreateDialog())
                        else dispatch(openInviteDialog())
                        }}>
                        <Tooltip title={user ? 'Join/Create new community' : 'Join a community'} placement='right'>
                            <Avatar>+</Avatar>
                        </Tooltip>
                    </IconButton>
                </ListItemIcon>
            </ListItem>
        </List>
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
        <ErrorDialog open={leavingErrorOpened} title='Error' description={`There was an error leaving community: ${leavingError}`} onClose={()=>setLeavingErrorOpened(false)} />
    </Box>
}

const CommunityListItem = ({community}: {community: Community}) => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const selectedCommunity = useAppSelector(state=>state.communityReducer.selected)

    const user = useAppSelector(state=>state.userReducer.user)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const onCommunityClick = () => {
        dispatch(selectCommunity(community))
        navigate(`/communities/${community.id}`)
    }
    const onRightClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEl(e.currentTarget)
    }

    const menuBlocked = useAppSelector(state=>state.communityReducer.leaving)

    const closeMenu = () => {
        if (!menuBlocked) setAnchorEl(null)
    }

    return <ListItem sx={{paddingLeft: '8px'}}>
        <ListItemIcon>
            <IconButton
                sx={{boxShadow: (selectedCommunity === community ? '0px 0px 15px 5px #0ff' : '')}}
                onClick={onCommunityClick}
                onContextMenu={onRightClick}
                >
                <Tooltip title={community.name} placement='right'>
                    <Avatar alt={community.name} src={'fdsfds'} />
                </Tooltip>
            </IconButton>
        </ListItemIcon>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
            <MenuItem>
                <ListItemIcon>
                    <Mail />
                </ListItemIcon>
                <Typography>Invite</Typography>
            </MenuItem>
            <MenuItem>
                <ListItemIcon>
                    <Settings />
                </ListItemIcon>
                <Typography>Settings</Typography>
            </MenuItem>
            {(user && community.ownerId !== user.id) && [
                <Divider />,
                <MenuItem onClick={()=>dispatch(leaveCommunity(community.id))} disabled={menuBlocked}>
                    <ListItemIcon>
                        <Logout />
                    </ListItemIcon>
                    <Typography color={'red'}>Leave community</Typography>
                </MenuItem>]
            }
        </Menu>
    </ListItem>
}