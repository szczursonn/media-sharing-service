import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { Community } from "../../types"
import { MemberGrid } from "../MemberGrid"

export const MemberGridDialog = ({open, community, onClose}: {open: boolean, community: Community, onClose: ()=>void}) => {
    return <Dialog
      open={open}
      onClose={onClose}
      >
        <DialogTitle id="alert-dialog-title">
          Members of {community.name}
        </DialogTitle>
        <DialogContent>
            <MemberGrid community={community} showRemove={false} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} autoFocus>
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
  }