import React, { useEffect, useState } from 'react';
import { MyAppBar } from './MyAppBar';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './HomePage';
import { UserContext } from '../contexts/UserContext';
import { User } from '../types';
import { getCurrentUser } from '../api';
import { Backdrop, Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { CallbackPage } from './CallbackPage';
import { NotFoundPage } from './NotFoundPage';
import { LoginDialog } from './LoginDialog';
import { SettingsPage } from './SettingsPage';
import { UnauthenticatedError } from '../errors';
import { ErrorDialog } from './ErrorDialog';
import { MyDrawer } from './MyDrawer';
import { CommunityCreateDialog } from './CommunityCreateDialog';


const App = () => {

  const [loginOpen, setLoginOpen] = useState(false)
  const [loadingUser, setLoadingUser] = useState(false)
  const [user, setUser] = useState<User|null>(null)
  const [error, setError] = useState<string>('')
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)

  const contextValue = {
    user,
    setUser: (u: User|null)=>{
      setUser(u)
    }
  }

  const loadUser = async () => {
    setLoadingUser(true)
    try {
      const user = await getCurrentUser()
      setUser(user)
    } catch (err) {
      if (!(err instanceof UnauthenticatedError)) {
        setErrorDialogOpen(true)
        setError(String(err))
      }
    }
    setLoadingUser(false)
  }

  useEffect(()=>{
    loadUser()
  }, [])

  return (
    <div className="App">
      <UserContext.Provider value={contextValue}>
        <MyAppBar onLoginClick={()=>setLoginOpen(true)} />
        <Grid container>
          <Grid item xs={0.5}>
            <MyDrawer />
          </Grid>
          <Grid item xs={11.5}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/settings' element={user ? <SettingsPage /> : <RequireLoginPage onLoginClick={()=>setLoginOpen(true)} />} />
              <Route path='/callback/:provider' element={<CallbackPage />} />
              <Route path='*' element={<NotFoundPage />} />
            </Routes>
          </Grid>
        </Grid>
        <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer+1}} open={loadingUser}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <LoginDialog open={loginOpen} onClose={()=>setLoginOpen(false)}/>
        <ErrorDialog open={errorDialogOpen} title='Unexpected error' description={`There was an unexpected error when logging in: ${error}`} onClose={()=>setErrorDialogOpen(false)}/>
        
      </UserContext.Provider>
    </div>
  );
}

const RequireLoginPage = ({onLoginClick}: {onLoginClick: ()=>void}) => {
  return <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
    <Typography variant="h1">401</Typography>
    <Typography variant="h4">You need to be logged in to access <code>{window.location.pathname}</code></Typography>
    <Button variant="contained" onClick={onLoginClick}>Login</Button>
  </Box>
}

export default App;
