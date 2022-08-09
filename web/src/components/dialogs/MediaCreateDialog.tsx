import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Typography } from "@mui/material";
import { useRef, useState } from "react";
import albumApi from "../../api/albumApi";
import { Media } from "../../types";

export const MediaCreateDialog = ({open, albumId, onCancel, onSuccess}: {open: boolean, albumId: number, onCancel: ()=>void, onSuccess: (media: Media)=>void}) => {

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string|null>(null)

    const fileInput = useRef<HTMLInputElement>(null)

    const upload = async () => {
        if (!fileInput.current) return
        setSaving(true)
        setError(null)
        try {
            const file = fileInput.current?.files?.[0]
            if (!file) throw new Error('No file selected')
            const media = await albumApi.uploadMedia(albumId, file)
            onSuccess(media)
        } catch (err) {
            setError(String(err))
        }
        setSaving(false)
    }

    const onClose = () => {
        if (!saving) onCancel()
    }

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>Upload image/video</DialogTitle>
        <DialogContent>
            {error && <Typography variant="body2" color={'red'}>ERROR: {error}</Typography>}
            <Paper sx={{borderStyle: 'solid', borderColor: '#333', borderWidth: 1, borderRadius: 1, padding: 1}}>
                <input type='file' accept="image/*,video/*" ref={fileInput}/>
            </Paper>
            {saving && <Typography>Uploading...</Typography>}
        </DialogContent>
        <DialogActions>
            <Button disabled={saving} onClick={onClose}>Cancel</Button>
            <Button disabled={saving} onClick={upload}>Upload</Button>
        </DialogActions>
    </Dialog>
}