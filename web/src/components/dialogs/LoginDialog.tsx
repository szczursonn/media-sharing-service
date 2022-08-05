import { Button, Dialog, DialogTitle, Stack, Typography } from "@mui/material"
import githubIcon from '../../svg/githubIcon.svg'
import discordIcon from '../../svg/discordIcon.svg'
import googleIcon from '../../svg/googleIcon.svg'
import { DISCORD_OAUTH_URL, GITHUB_OAUTH_URL } from "../../constants"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { closeLoginDialog } from "../../redux/dialogSlice"

export const LoginDialog = () => {

  const dispatch = useAppDispatch()

  const open = useAppSelector(state=>state.dialogReducer.loginOpen)
  
  const onClose = () => {
    dispatch(closeLoginDialog())
  }

  return <Dialog onClose={onClose} open={open}>
    <DialogTitle>Login/Register with OAuth2 Provider</DialogTitle>
    <Stack marginBottom={4}>
      <LoginOption textColor="#fff" bgColor="#7289da" iconSrc={discordIcon} name='discord' onSelect={()=>window.location.href = DISCORD_OAUTH_URL} />
      <LoginOption textColor="#111" bgColor="#fff" iconSrc={googleIcon} name='google' onSelect={()=>{}} />
      <LoginOption textColor="#fff" bgColor="#111" iconSrc={githubIcon} name='github' onSelect={()=>window.location.href = GITHUB_OAUTH_URL} />
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