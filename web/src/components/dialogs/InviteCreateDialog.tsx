import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputLabel, MenuItem, Select, Typography } from "@mui/material"
import { useState } from "react"
import communityApi from "../../api/communityApi"
import { closeInviteCreateDialog } from "../../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { Invite } from "../../types"

export const InviteCreateDialog = () => {

    const dispatch = useAppDispatch()
    const open = useAppSelector(state=>state.dialogReducer.inviteCreateOpen)
    const [creating, setCreating] = useState(false)
    const [creatingError, setCreatingError] = useState<string|null>(null)
    const [createdInvite, setCreatedInvite] = useState<Invite|null>(null)

    const [maxUses, setMaxUses] = useState<number>(Infinity)
    const [expiresIn, setExpiresIn] = useState<number>(604800)

    const createInvite = async () => {
        if (!community) return
        setCreating(true)
        setCreatingError(null)
        try {
            const inv = await communityApi.createInvite(community.id, maxUses===Infinity ? null : maxUses, expiresIn===Infinity ? null : expiresIn)
            setCreatedInvite(inv)
        } catch (err) {
            setCreatingError(`Unexpected error: ${err}`)
        }
        setCreating(false)
    }

    const onClose = () => {
        if (!creating) {
          setCreatedInvite(null)
          dispatch(closeInviteCreateDialog())
        }
    }

    const community = useAppSelector(state=>state.communityReducer.communities?.find(c=>c.id===state.dialogReducer.inviteCreateTargetId) ?? null)

    return <Dialog
        open={open}
        onClose={onClose}
      >
        <DialogTitle>
          Invite
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{marginBottom: 1}}>
            Invite others to join {community?.name}
          </DialogContentText>
          {creatingError!==null && <DialogContentText color='error' sx={{marginBottom: 1}}>
            Error: {creatingError}
          </DialogContentText>}
          <Box display='flex' alignItems='center'>
            <InputLabel>Max uses</InputLabel>
            <Select disabled={creating || !!createdInvite} value={maxUses} label='Max uses' onChange={(e)=>setMaxUses(e.target.value as any)}>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={Infinity}>Infinity</MenuItem>
            </Select>
            <Box sx={{width: 15}}/>
            <InputLabel>Expires in</InputLabel>
            <Select disabled={creating || !!createdInvite} value={expiresIn} label='Expires in' onChange={(e)=>setExpiresIn(e.target.value as any)}>
                <MenuItem value={1800}>30 minutes</MenuItem>
                <MenuItem value={3600}>1 hour</MenuItem>
                <MenuItem value={43200}>12 hours</MenuItem>
                <MenuItem value={86400}>1 day</MenuItem>
                <MenuItem value={604800}>7 days</MenuItem>
                <MenuItem value={Infinity}>never</MenuItem>
            </Select>
          </Box>
          {createdInvite && <Typography>URL: <code>{`${window.location.host}/i/${createdInvite.id}`}</code></Typography>}
        </DialogContent>
        <DialogActions>
          {createdInvite && <Button variant='contained' onClick={onClose}>Close</Button>}
          <Button variant="contained" disabled={creating || !!createdInvite} onClick={createInvite}>Create invite</Button>
        </DialogActions>
      </Dialog>
}