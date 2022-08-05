import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Home } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { openLoginDialog } from '../redux/dialogSlice';
import { setCurrentUser } from '../redux/userSlice';
import { selectCommunity } from '../redux/communitySlice';
import userApi from '../api/userApi';

export const MyAppBar = () => {

    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const user = useAppSelector(state=>state.userReducer.user)

    const selectedCommunity = useAppSelector(state=>state.communityReducer.selected)
    const [logoutInProgress, setLogoutInProgress] = useState(false)

    const onLoginClick = () => {
      dispatch(openLoginDialog())
    }

    const onLogoutClick = async () => {
      setLogoutInProgress(true)
      await userApi.invalidateCurrentSession()
      dispatch(setCurrentUser(null))
      setLogoutInProgress(false)
    }
    
    const onHomeClick = () => {
      dispatch(selectCommunity(null))
      navigate('/')
    }
  
    return <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size='large' onClick={onHomeClick} sx={{marginRight: 2}}>
            <Home />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            media-sharing-service{selectedCommunity && ` > ${selectedCommunity.name}`}
          </Typography>
          {
            user
            ? <Box sx={{display: 'flex', flexGrow: 0, alignItems: 'center'}}>
                <Tooltip title='Open settings'>
                  <IconButton onClick={()=>navigate('/settings')}>
                    <Avatar alt='marcinek' src={user.avatarUrl ?? undefined}/>
                  </IconButton>
                </Tooltip>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  {user.username}
                </Typography>
                <Button size='large' disabled={logoutInProgress} color="inherit" onClick={onLogoutClick}>Logout</Button>
              </Box>
            : <Box>
                <Button size='large' color="inherit" onClick={onLoginClick}>Login</Button>
              </Box>
          }
        </Toolbar>
      </AppBar>
    </Box>
}

