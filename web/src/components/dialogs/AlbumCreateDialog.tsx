import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { createAlbum } from "../../redux/albumSlice"
import { closeAlbumCreateDialog } from "../../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"

export const AlbumCreateDialog = () => {

    const [name, setName] = useState('')

    const dispatch = useAppDispatch()
    const loading = useAppSelector(state=>state.albumReducer.creating)
    const error = useAppSelector(state=>state.albumReducer.creatingError)

    const open = useAppSelector(state=>state.dialogReducer.albumCreateOpen)
    const communityId = useAppSelector(state=>state.dialogReducer.albumCreateTargetId)

    const onClose = () => {
        if (!loading) dispatch(closeAlbumCreateDialog())
    }
    const onCreateClick = () => {
      if (communityId) dispatch(createAlbum({communityId, albumName: name}))
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
      <Button disabled={loading} onClick={onCreateClick}>Create</Button>
    </DialogActions>
  </Dialog>
}