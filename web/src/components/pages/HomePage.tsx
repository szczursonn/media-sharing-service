import { Add, Mail } from "@mui/icons-material"
import { Avatar, Button, CircularProgress, Container, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { openCommunityCreateDialog, openInviteDialog, openLoginDialog } from "../../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"

export const HomePage = () => {

    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    
    const user = useAppSelector(state=>state.userReducer.user)
    const userLoading = useAppSelector(state=>state.userReducer.loading)
    const communities = useAppSelector(state=>state.communityReducer.communities)

    const onCommunityClick = (communityId: number) => {
        navigate(`communities/${communityId}`)
    }

    return <Container sx={{textAlign: 'center'}}>
        <Typography variant="h3">media-sharing-service</Typography>
        {
            userLoading
            ? <CircularProgress />
            : <Container maxWidth='sm' sx={{display: 'flex', alignItems: 'center'}}>
                {
                    user
                    ? <>
                        <Container>
                            <Typography variant='h6'>Communities</Typography>
                            {communities
                                ? <List sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    {communities.map(c=><ListItem sx={{backgroundColor: '#1c1c1c'}}>
                                        <ListItemButton onClick={()=>onCommunityClick(c.id)}>
                                            <ListItemIcon>
                                                <Avatar alt={c.name} src={'fdsfds'} />
                                            </ListItemIcon>
                                            <ListItemText primary={c.name} />
                                        </ListItemButton>
                                    </ListItem>)}
                                    <Divider />
                                    <ListItem sx={{backgroundColor: '#1c1c1c'}}>
                                        <ListItemButton onClick={()=>dispatch(openInviteDialog())}>
                                            <ListItemIcon>
                                                <Avatar>
                                                    <Mail />
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText primary='Use an invite'/>
                                        </ListItemButton>
                                    </ListItem>
                                    <ListItem sx={{backgroundColor: '#1c1c1c'}}>
                                        <ListItemButton onClick={()=>dispatch(openCommunityCreateDialog())}>
                                            <ListItemIcon>
                                                <Avatar>
                                                    <Add />
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText primary='Create a new community!'/>
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                                : <CircularProgress />
                            }
                        </Container>
                    </>
                    : <Container maxWidth='xs' sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                        <Button variant="contained" onClick={()=>dispatch(openLoginDialog())}>Login</Button>
                    </Container>
                }
            </Container>
        }
    </Container>
}