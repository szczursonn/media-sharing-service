import { Button, Dialog, DialogTitle, Divider, Stack, Typography } from "@mui/material"
import githubIcon from '../../svg/githubIcon.svg'
import discordIcon from '../../svg/discordIcon.svg'
import googleIcon from '../../svg/googleIcon.svg'
import { DISCORD_OAUTH_URL, GITHUB_OAUTH_URL, GOOGLE_OAUTH_URL, MOCK_LOGIN_ENABLED } from "../../constants"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { closeLoginDialog, openMockLoginDialog } from "../../redux/dialogSlice"
import { useEffect } from "react"

export const LoginDialog = () => {

  const dispatch = useAppDispatch()

  const open = useAppSelector(state=>state.dialogReducer.loginOpen)

  const onClose = () => {
    dispatch(closeLoginDialog())
  }
  const onMockLogin = () => {
    onClose()
    dispatch(openMockLoginDialog())
  }

  useEffect(()=>{
    if (open) localStorage.setItem('beforeLoginPage', window.location.pathname)
  }, [open])

  return <Dialog onClose={onClose} open={open}>
    <DialogTitle>Login/Register with OAuth2 Provider</DialogTitle>
    <Stack marginBottom={4}>
      <LoginOption textColor="#fff" bgColor="#7289da" iconSrc={discordIcon} name='discord' onSelect={()=>window.location.href = DISCORD_OAUTH_URL} />
      <LoginOption textColor="#111" bgColor="#fff" iconSrc={googleIcon} name='google' onSelect={()=>window.location.href = GOOGLE_OAUTH_URL} />
      <LoginOption textColor="#fff" bgColor="#111" iconSrc={githubIcon} name='github' onSelect={()=>window.location.href = GITHUB_OAUTH_URL} />
      {MOCK_LOGIN_ENABLED && <>
        <Divider sx={{marginTop: 2, marginBottom: 2}}/>
        <Button sx={{marginLeft: 5, marginRight: 5, padding: 0.5, display: 'flex', alignItems: 'center', backgroundColor: 'orange'}} onClick={onMockLogin}>
          <Typography variant="subtitle2" color={'#111'}>
            [DEV] mock OAuth2 login
          </Typography>
        </Button>
      </>}
    </Stack>
  </Dialog>
}

const LoginOption = ({textColor, bgColor, iconSrc, name, onSelect}: {textColor: string, bgColor: string, iconSrc: string, name: string, onSelect: ()=>void}) => { 
  return <Button onClick={onSelect} sx={{marginLeft: 5, marginRight: 5, padding: 1, display: 'flex', alignItems: 'center', backgroundColor: bgColor, marginTop: 1}}>
    <img style={{maxHeight: 30}} src={iconSrc} alt={`${name} logo`} />
    <Typography color={textColor} marginLeft={2} variant="body1">
      LOGIN WITH {name.toUpperCase()}
    </Typography>
  </Button>
}