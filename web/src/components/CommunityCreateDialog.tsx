import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { createNewCommunity } from "../api"
import { Community } from "../types"

export const CommunityCreateDialog = ({open, onCancel, onSuccess}: {open: boolean, onCancel: ()=>void, onSuccess: (community: Community)=>void}) => {

    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string|null>(null)

    const onClose = () => {
        if (!loading) onCancel()
    }

    const createCommunity = async () => {
        setLoading(true)
        setError(null)
        try {
            const com = await createNewCommunity(name)
            setName('')
            onSuccess(com)
        } catch (err) {
            setError(String(err))
        }
        setLoading(false)
    }

    return <Dialog open={open} onClose={onClose}>
    <DialogTitle>Create Community</DialogTitle>
    <DialogContent>
      {error && <Typography variant="body2" color={'red'}>ERROR: {error}</Typography>}
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
      <Button disabled={loading} onClick={onClose}>Cancel</Button>
      <Button disabled={loading} onClick={createCommunity}>Create</Button>
    </DialogActions>
  </Dialog>
}