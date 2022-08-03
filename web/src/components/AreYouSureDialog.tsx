import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"

export const AreYouSureDialog = ({open, description, onYes, onNo}: {open: boolean, description: string, onYes: ()=>void, onNo: ()=>void}) => {
    return <Dialog
        open={open}
        onClose={onNo}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onNo} autoFocus>No</Button>
          <Button onClick={onYes}>Yes</Button>
        </DialogActions>
      </Dialog>
}