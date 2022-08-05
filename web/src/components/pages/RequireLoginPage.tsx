import { Box, Button, Typography } from "@mui/material"
import { openLoginDialog } from "../../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"

export const RequireLoginPage = () => {

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