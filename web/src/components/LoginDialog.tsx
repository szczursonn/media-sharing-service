import { Dangerous, GitHub, Google } from "@mui/icons-material"
import { Avatar, Dialog, DialogTitle, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material"

export const LoginDialog = ({open, onClose}: {open: boolean, onClose: ()=>void}) => {
    return <Dialog onClose={onClose} open={open}>
      <DialogTitle>Login/Register</DialogTitle>
      <List sx={{ pt: 0 }}>
        <ListItem autoFocus button onClick={() => window.location.href='http://localhost:2000/callback/discord?code=abcd'}>
          <ListItemAvatar>
            <Avatar>
              <Dangerous color='secondary' />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Discord"/>
        </ListItem>
        <ListItem autoFocus button onClick={() => {}}>
          <ListItemAvatar>
            <Avatar>
              <Google color='success' />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Google" />
        </ListItem>
        <ListItem autoFocus button onClick={() => {}}>
          <ListItemAvatar>
            <Avatar>
              <GitHub color='warning' />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Github" />
        </ListItem>
      </List>
    </Dialog>
}