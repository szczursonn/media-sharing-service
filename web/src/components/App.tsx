import React, { useContext, useEffect, useState } from 'react';
import { MyAppBar } from './MyAppBar';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './HomePage';
import { UserContext } from '../contexts/UserContext';
import { Community, User } from '../types';
import { getCurrentUser, getUserCommunities } from '../api';
import { Backdrop, Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { CallbackPage } from './CallbackPage';
import { NotFoundPage } from './NotFoundPage';
import { LoginDialog } from './LoginDialog';
import { SettingsPage } from './SettingsPage';
import { UnauthenticatedError } from '../errors';
import { ErrorDialog } from './ErrorDialog';
import { MyDrawer } from './MyDrawer';
import { CommunityContext } from '../contexts/CommunityContext';
import { CommunityPage } from './CommunityPage';
import { InvitePage } from './InvitePage';


const App = () => {

  const [loginOpen, setLoginOpen] = useState(false)
  const [loadingUser, setLoadingUser] = useState(false)
  const [user, setUser] = useState<User|null>(null)
  const [loadingCommunities, setLoadingCommunities] = useState(false)
  const [communities, setCommunities] = useState<Community[]|null>(null)
  const [error, setError] = useState<string>('')
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<Community|null>(null)

  const userContextValue = {
    user,
    setUser: (u: User|null)=>{
      setUser(u)
    },
    loading: loadingUser
  }

  const communityContextValue = {
    communities,
    setCommunities: (c: Community[]|null)=>{
      setCommunities(c)
      if (selectedCommunity && c && !c.includes(selectedCommunity)) {
        setSelectedCommunity(null)
      }
      if (!c) {
        setSelectedCommunity(null)
      }
    },
    loading: loadingCommunities,
    selected: selectedCommunity,
    select: (c: Community|null)=>{
      if (c===null || communities?.includes(c)) setSelectedCommunity(c)
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

  const loadCommunities = async () => {
    setCommunities(null)
    setSelectedCommunity(null)
    setLoadingCommunities(true)
    try {
        const com = await getUserCommunities()
        setCommunities(com)
    } catch (err) {

    }
    setLoadingCommunities(false)
}

  useEffect(()=>{
    loadUser().then(loadCommunities)
  }, [])

  useEffect(()=>{
    if (user && !communities && !loadingCommunities) loadCommunities()
  }, [user])

  return (
    <div className="App">
      <UserContext.Provider value={userContextValue}>
        <CommunityContext.Provider value={communityContextValue}>
          <MyAppBar onLoginClick={()=>setLoginOpen(true)} />
          <Grid container>
            <Grid item xs={0.5}>
              <MyDrawer />
            </Grid>
            <Grid item xs={11.5}>
              <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/communities/:communityId' element={user ? <CommunityPage /> : <RequireLoginPage onLoginClick={()=>setLoginOpen(true)} />}/>
                <Route path='/settings' element={user ? <SettingsPage /> : <RequireLoginPage onLoginClick={()=>setLoginOpen(true)} />} />
                <Route path='/i/:inviteId' element={<InvitePage onLoginClick={()=>setLoginOpen(true)} />} />
                <Route path='/callback/:provider' element={!loadingUser ? <CallbackPage /> : <></>} />
                <Route path='*' element={<NotFoundPage />} />
              </Routes>
            </Grid>
          </Grid>
          <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer+1}} open={loadingUser}>
            <CircularProgress color='inherit' />
          </Backdrop>
          <LoginDialog open={loginOpen} onClose={()=>setLoginOpen(false)}/>
          <ErrorDialog open={errorDialogOpen} title='Unexpected error' description={`There was an unexpected error when logging in: ${error}`} onClose={()=>setErrorDialogOpen(false)}/>
        </CommunityContext.Provider>
      </UserContext.Provider>
    </div>
  );
}

const RequireLoginPage = ({onLoginClick}: {onLoginClick: ()=>void}) => {

  const {loading} = useContext(UserContext)

  return <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
    {!loading && <>
      <Typography variant="h1">401</Typography>
      <Typography variant="h4">You need to be logged in to access <code>{window.location.pathname}</code></Typography>
      <Button variant="contained" onClick={onLoginClick}>Login</Button>
    </>}
  </Box>
}

export default App;
