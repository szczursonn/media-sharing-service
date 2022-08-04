import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Home } from '@mui/icons-material';
import { CommunityContext } from '../contexts/CommunityContext';
import { invalidateCurrentSession } from '../api';

export const MyAppBar = ({onLoginClick}: {onLoginClick: ()=>void}) => {

    const navigate = useNavigate()

    const {user, setUser} = useContext(UserContext)

    const {selected: selectedCommunity, select: setSelectedCommunity} = useContext(CommunityContext)
    const [logoutInProgress, setLogoutInProgress] = useState(false)

    const onLogoutClick = async () => {
      setLogoutInProgress(true)
      await invalidateCurrentSession()
      setUser(null)
      setLogoutInProgress(false)
    }
  
    return <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size='large' onClick={()=>{setSelectedCommunity(null);navigate('/')}} sx={{marginRight: 2}}>
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

