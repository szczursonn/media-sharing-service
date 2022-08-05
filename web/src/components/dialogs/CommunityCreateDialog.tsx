import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createCommunity } from "../../redux/communitySlice"
import { closeCommunityCreateDialog, openInviteDialog } from "../../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"

export const CommunityCreateDialog = () => {

    const [name, setName] = useState('')

    const navigate = useNavigate()

    const dispatch = useAppDispatch()
    const saving = useAppSelector(state=>state.communityReducer.saving)
    const error = useAppSelector(state=>state.communityReducer.error)
    const newCommunity = useAppSelector(state=>state.communityReducer.communities?.find(c=>c.name===name))

    const open = useAppSelector(state=>state.dialogReducer.communityCreateOpen)

    const onClose = () => {
        if (!saving) {
            setName('')
            dispatch(closeCommunityCreateDialog())
        }
    }
    const onCreate = () => {
        dispatch(createCommunity(name))
    }

    useEffect(()=>{
        if (newCommunity && !saving && !error) {
            onClose()
            navigate(`/communities/${newCommunity.id}`)
        }
    }, [newCommunity])

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>Create Community</DialogTitle>
        <DialogContent>
        {error !== null && <Typography variant="body2" color={'red'}>ERROR: {error}</Typography>}
        <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Community name"
            type="text"
            fullWidth
            variant="standard"
            value={name}
            onChange={(e)=>setName(e.currentTarget.value)}
        />
        </DialogContent>
        <DialogActions>
            <Button disabled={saving} onClick={()=>{
                dispatch(closeCommunityCreateDialog())
                dispatch(openInviteDialog())
            }} variant='outlined'>Use invite</Button>
            <Button disabled={saving} onClick={onClose} variant='outlined'>Cancel</Button>
            <Button disabled={saving} onClick={onCreate} variant='contained'>Create</Button>
        </DialogActions>
    </Dialog>
}