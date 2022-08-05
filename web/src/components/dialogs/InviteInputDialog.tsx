import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { closeInviteDialog } from "../../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"

export const InviteInputDialog = () => {

    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const [inviteId, setInviteId] = useState('')
    const open = useAppSelector(state=>state.dialogReducer.inviteOpen)

    const onClose = () => {
        setInviteId('')
        dispatch(closeInviteDialog())
    }
    const onSubmit = () => {
        onClose()
        navigate(`/i/${inviteId}`)
    }

    const isValid = (()=>{
        if (inviteId.length===8) return true
        return false
    })()

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>Join Community</DialogTitle>
        <DialogContent>
        <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Invite id"
            type="text"
            fullWidth
            variant="standard"
            value={inviteId}
            onChange={(e)=>setInviteId(e.currentTarget.value)}
        />
        </DialogContent>
        <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!isValid} onClick={onSubmit}>Submit</Button>
        </DialogActions>
    </Dialog>
}