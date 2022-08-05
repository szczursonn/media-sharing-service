import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material"
import { useState } from "react"
import communityApi from "../../api/communityApi"
import { Album } from "../../types"

export const AlbumCreateDialog = ({open, communityId, onCancel, onSuccess}: {open: boolean, communityId: number, onCancel: ()=>void, onSuccess: (album: Album)=>void}) => {

    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string|null>(null)

    const onClose = () => {
        if (!loading) onCancel()
    }

    const createAlbum = async () => {
        setLoading(true)
        setError(null)
        try {
            const com = await communityApi.createNewAlbum(communityId, name)
            setName('')
            onSuccess(com)
        } catch (err) {
            setError(String(err))
        }
        setLoading(false)
    }

    return <Dialog open={open} onClose={onClose}>
    <DialogTitle>Create Album</DialogTitle>
    <DialogContent>
      {error && <Typography variant="body2" color={'red'}>ERROR: {error}</Typography>}
      <TextField
        autoFocus
        margin="dense"
        id="name"
        label="Album name"
        type="text"
        fullWidth
        variant="standard"
        value={name}
        onChange={(e)=>setName(e.currentTarget.value)}
      />
    </DialogContent>
    <DialogActions>
      <Button disabled={loading} onClick={onClose}>Cancel</Button>
      <Button disabled={loading} onClick={createAlbum}>Create</Button>
    </DialogActions>
  </Dialog>
}