import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { deleteAlbum, renameAlbum, selectSelectedAlbum } from "../../redux/albumSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { AreYouSureDialog } from "./AreYouSureDialog"

export const AlbumSettingsDialog = ({open, onClose}: {open: boolean, onClose: ()=>void}) => {

    const [name, setName] = useState('')
    const [areYouSureOpen, setAreYouSureOpen] = useState(false)

    const dispatch = useAppDispatch()
    const album = useAppSelector(selectSelectedAlbum())
    const renaming = useAppSelector(state=>state.albumReducer.renaming)
    const renamingError = useAppSelector(state=>state.albumReducer.renamingError)
    const deleting = useAppSelector(state=>state.albumReducer.deleting)
    const deletingError = useAppSelector(state=>state.albumReducer.deletingError)

    const blocked = renaming || deleting

    useEffect(()=>{
        if (album) setName(album.name)
    }, [open])

    const onRename = () => {
        if (album) dispatch(renameAlbum({albumId: album.id, name}))
    }

    const onRemove = () => {
        if (album) dispatch(deleteAlbum(album.id))
    }

    const _onClose = () => {
        if (!blocked) onClose()
    }

    return <Dialog open={open} onClose={_onClose}>
        <DialogTitle>Album Settings</DialogTitle>
        <DialogContent sx={{display: 'flex', flexDirection: 'column'}}>
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="New name"
                type="text"
                fullWidth
                variant="standard"
                disabled={blocked}
                value={name}
                onChange={(e)=>setName(e.currentTarget.value)}
            />
            <Button disabled={blocked} variant="contained" onClick={onRename}>Rename</Button>
            {renamingError && <Typography color='error'>Error: {renamingError}</Typography>}
            <Divider sx={{marginBottom: 1, marginTop: 1}} />
            {deletingError && <Typography color='error'>Error: {deletingError}</Typography>}
            <Button disabled={blocked} onClick={()=>setAreYouSureOpen(true)} variant="contained" color="error">REMOVE ALBUM</Button>
            <AreYouSureDialog
                open={areYouSureOpen}
                description={'Are you sure you want to remove the album including media inside of it?'}
                onNo={()=>setAreYouSureOpen(false)}
                onYes={()=>{
                    setAreYouSureOpen(false)
                    onRemove()
                }}
            />
        </DialogContent>
        <DialogActions>
            <Button disabled={blocked} onClick={_onClose}>Close</Button>
        </DialogActions>
    </Dialog>
}