import React, { useEffect, useState } from 'react';
import { MyAppBar } from './MyAppBar';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from './HomePage';
import { UserContext } from '../contexts/UserContext';
import { User } from '../types';
import { getCurrentUser } from '../db';
import { Backdrop, CircularProgress } from '@mui/material';
import { CallbackPage } from './CallbackPage';
import { NotFoundPage } from './NotFoundPage';
import { LoginDialog } from './LoginDialog';
import { SettingsPage } from './SettingsPage';


const App = () => {

  const [loginOpen, setLoginOpen] = useState(false)
  const [loadingUser, setLoadingUser] = useState(true)
  const [user, setUser] = useState<User|null>(null)

  const contextValue = {
    user,
    setUser: (u: User|null)=>{
      setUser(u)
    }
  }

  useEffect(()=>{
    setLoadingUser(true)
    getCurrentUser()
      .then(u=>setUser(u))
      .catch(e=>e)
      .finally(()=>setLoadingUser(false))
  }, [])

  return (
    <div className="App">
      <UserContext.Provider value={contextValue}>
        <MyAppBar onLoginClick={()=>setLoginOpen(true)} />
        {!loadingUser && <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/settings' element={<SettingsPage />} />
          <Route path='/callback/:provider' element={<CallbackPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>}
        <Backdrop sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer+1}} open={loadingUser}>
          <CircularProgress color='inherit' />
        </Backdrop>
        <LoginDialog open={loginOpen} onClose={()=>setLoginOpen(false)}/>
      </UserContext.Provider>
    </div>
  );
}

export default App;
