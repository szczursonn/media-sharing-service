import { Create, GitHub, Logout, Mail, Person, Settings } from "@mui/icons-material"
import { Avatar, Box, Button, CircularProgress, Divider, IconButton, List, ListItem, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { fetchCommunities, leaveCommunity, selectCommunity, selectSelectedCommunity } from "../redux/communitySlice"
import { openAlbumCreateDialog, openCommunityCreateDialog, openInviteCreateDialog, openInviteDialog } from "../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { Community } from "../types"
import { ErrorDialog } from "./dialogs/ErrorDialog"
import { MemberGridDialog } from "./dialogs/MemberGridDialog"

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

    return <Box sx={{borderColor: '#111', borderWidth: 2, borderStyle: 'solid', borderRightColor: '#333', height: '100%', minHeight: '93vh'}}>
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
    const selectedCommunity = useAppSelector(selectSelectedCommunity())

    const user = useAppSelector(state=>state.userReducer.user)

    const [openMemberList, setOpenMemberList] = useState(false)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const onCommunityClick = () => {
        dispatch(selectCommunity(community.id))
        navigate(`/communities/${community.id}`)
    }
    const onRightClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEl(e.currentTarget)
    }
    const onSettingsClick = () => {
        setAnchorEl(null)
        navigate(`/communities/${community.id}/settings`)
    }
    const onInviteClick = () => {
        setAnchorEl(null)
        dispatch(openInviteCreateDialog(community.id))
    }
    const onMembersClick = () => {
        setAnchorEl(null)
        navigate(`/communities/${community.id}`)
        setOpenMemberList(true)
    }
    const onAlbumClick = () => {
        setAnchorEl(null)
        navigate(`/communities/${community.id}`)
        dispatch(openAlbumCreateDialog(community.id))
    }

    const menuBlocked = useAppSelector(state=>state.communityReducer.leaving)

    const closeMenu = () => {
        if (!menuBlocked) setAnchorEl(null)
    }

    const isOwner = (user && community.ownerId === user.id)

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
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={closeMenu}>
            <MenuItem disabled={menuBlocked} onClick={onInviteClick}>
                <ListItemIcon>
                    <Mail />
                </ListItemIcon>
                <Typography>Invite</Typography>
            </MenuItem>
            <MenuItem onClick={onAlbumClick}>
                <ListItemIcon>
                    <Create />
                </ListItemIcon>
                <Typography>Create album</Typography>
            </MenuItem>
            <MenuItem onClick={onMembersClick}>
                <ListItemIcon>
                    <Person />
                </ListItemIcon>
                <Typography>Members</Typography>
            </MenuItem>
            {isOwner && <MenuItem onClick={onSettingsClick}>
                <ListItemIcon>
                    <Settings />
                </ListItemIcon>
                <Typography>Settings</Typography>
            </MenuItem>}
            {!isOwner && [
                <Divider key={1}/>,
                <MenuItem key={2} onClick={()=>dispatch(leaveCommunity(community.id))} disabled={menuBlocked}>
                    <ListItemIcon>
                        <Logout />
                    </ListItemIcon>
                    <Typography color={'red'}>Leave community</Typography>
                </MenuItem>]
            }
        </Menu>
        <MemberGridDialog open={openMemberList} onClose={()=>setOpenMemberList(false)} community={community} />
    </ListItem>
}