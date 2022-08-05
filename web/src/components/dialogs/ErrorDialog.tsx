import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"

export const ErrorDialog = ({open, title, description, onClose}: {open: boolean, title: string, description: string, onClose: ()=>void}) => {
    return <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
  }