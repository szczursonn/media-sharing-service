import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Home } from '@mui/icons-material';
import { CommunityContext } from '../contexts/CommunityContext';

export const MyAppBar = ({onLoginClick}: {onLoginClick: ()=>void}) => {

    const navigate = useNavigate()

    const {user} = useContext(UserContext)

    const {selected: selectedCommunity, select: setSelectedCommunity} = useContext(CommunityContext)
  
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
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  {user.username}
                </Typography>
                <Tooltip title='Open settings'>
                  <IconButton onClick={()=>navigate('/settings')}>
                    <Avatar alt='marcinek' src={user.avatarUrl ?? undefined}/>
                  </IconButton>
                </Tooltip>
              </Box>
            : <Box>
                <Button size='large' color="inherit" onClick={onLoginClick}>Login</Button>
              </Box>
          }
        </Toolbar>
      </AppBar>
    </Box>
}

