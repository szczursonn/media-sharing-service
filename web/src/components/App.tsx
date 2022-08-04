import React, { useEffect } from 'react';
import { MyAppBar } from './MyAppBar';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './HomePage';
import { Backdrop, Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { CallbackPage } from './CallbackPage';
import { NotFoundPage } from './NotFoundPage';
import { LoginDialog } from './LoginDialog';
import { SettingsPage } from './SettingsPage';
import { ErrorDialog } from './ErrorDialog';
import { MyDrawer } from './MyDrawer';
import { CommunityPage } from './CommunityPage';
import { InvitePage } from './InvitePage';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { openLoginDialog } from '../redux/loginSlice';
import { clearError, fetchCurrentUser } from '../redux/userSlice';
import { fetchCommunities } from '../redux/communitySlice';


const App = () => {

  const dispatch = useAppDispatch()
  const user = useAppSelector(state=>state.userReducer.user)
  const loadingUser = useAppSelector(state=>state.userReducer.loading)
  const errorUser = useAppSelector(state=>state.userReducer.error)

  const communities = useAppSelector(state=>state.communityReducer.communities)
  const loadingCommunities = useAppSelector(state=>state.communityReducer.loading)

  useEffect(()=>{
    dispatch(fetchCurrentUser())
  }, [])

  useEffect(()=>{
    if (user && !communities && !loadingCommunities) dispatch(fetchCommunities())
  }, [user])

  return (
    <div className="App">
      <MyAppBar />
      <Grid container>
        <Grid item xs={0.5}>
          <MyDrawer />
        </Grid>
        <Grid item xs={11.5}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/communities/:communityId' element={user ? <CommunityPage /> : <RequireLoginPage />}/>
            <Route path='/settings' element={user ? <SettingsPage /> : <RequireLoginPage />} />
            <Route path='/i/:inviteId' element={<InvitePage />} />
            <Route path='/callback/:provider' element={!loadingUser ? <CallbackPage /> : <></>} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Grid>
      </Grid>
      <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer+1}} open={loadingUser}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <LoginDialog />
      <ErrorDialog open={errorUser !== null} title='Unexpected error' description={`There was an unexpected error when logging in: ${errorUser}`} onClose={()=>dispatch(clearError())}/>
    </div>
  );
}

const RequireLoginPage = () => {

  const dispatch = useAppDispatch()

  const onLoginClick = () => {
    dispatch(openLoginDialog())
  }

  const loading = useAppSelector(state=>state.userReducer.loading)

  return <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
    {!loading && <>
      <Typography variant="h1">401</Typography>
      <Typography variant="h4">You need to be logged in to access <code>{window.location.pathname}</code></Typography>
      <Button variant="contained" onClick={onLoginClick}>Login</Button>
    </>}
  </Box>
}

export default App;
