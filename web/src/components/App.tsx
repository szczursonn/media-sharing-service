import React, { useEffect } from 'react';
import { MyAppBar } from './MyAppBar';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { Backdrop, CircularProgress, Grid } from '@mui/material';
import { CallbackPage } from './pages/CallbackPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginDialog } from './dialogs/LoginDialog';
import { SettingsPage } from './pages/SettingsPage';
import { ErrorDialog } from './dialogs/ErrorDialog';
import { MyDrawer } from './MyDrawer';
import { CommunityPage } from './pages/CommunityPage';
import { InvitePage } from './pages/InvitePage';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { closeUserErrorDialog, fetchCurrentUser } from '../redux/userSlice';
import { fetchCommunities } from '../redux/communitySlice';
import { CommunityCreateDialog } from './dialogs/CommunityCreateDialog';
import { InviteInputDialog } from './dialogs/InviteInputDialog';
import { RequireLoginPage } from './pages/RequireLoginPage';
import { InviteCreateDialog } from './dialogs/InviteCreateDialog';
import { AlbumCreateDialog } from './dialogs/AlbumCreateDialog';


const App = () => {

  const dispatch = useAppDispatch()
  const user = useAppSelector(state=>state.userReducer.user)
  const loadingUser = useAppSelector(state=>state.userReducer.loading)
  const errorUser = useAppSelector(state=>state.userReducer.error)
  const errorDialogOpen = useAppSelector(state=>state.userReducer.errorDialogOpen)

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
            <Route path='/communities/:communityId/*' element={user ? <CommunityPage /> : <RequireLoginPage />}/>
            <Route path='/settings' element={user ? <SettingsPage /> : <RequireLoginPage />} />
            <Route path='/i/:inviteId' element={<InvitePage />} />
            <Route path='/callback/:provider' element={<CallbackPage />} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Grid>
      </Grid>
      <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer+1}} open={loadingUser}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <LoginDialog />
      <CommunityCreateDialog />
      <AlbumCreateDialog />
      <InviteInputDialog />
      <InviteCreateDialog />
      <ErrorDialog open={errorDialogOpen} title='Unexpected error' description={`There was an unexpected error when logging in: ${errorUser}`} onClose={()=>dispatch(closeUserErrorDialog())}/>
    </div>
  );
}

export default App;
