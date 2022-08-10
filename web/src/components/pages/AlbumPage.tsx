import { Add, ArrowBack, Delete, PhotoSizeSelectLarge, PlayCircle, Settings } from "@mui/icons-material";
import { Avatar, Button, CircularProgress, Container, Dialog, Divider, Fab, IconButton, ImageList, ImageListItem, Paper, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import albumApi from "../../api/albumApi";
import { selectAlbum, setAlbums } from "../../redux/albumSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { Community, Media } from "../../types";
import { AlbumSettingsDialog } from "../dialogs/AlbumSettingsDialog";
import { AreYouSureDialog } from "../dialogs/AreYouSureDialog";
import { MediaCreateDialog } from "../dialogs/MediaCreateDialog";

export const AlbumPage = ({community}: {community: Community}) => {
    const {albumId: _albumId} = useParams()
    const albumId = parseInt(_albumId!)

    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const albums = useAppSelector(state=>state.albumReducer.albums)
    const album = useAppSelector(state=>state.albumReducer.albums?.find(a=>a.id===albumId))
    const albumsLoading = useAppSelector(state=>state.albumReducer.loading)
    const albumsError = useAppSelector(state=>state.albumReducer.error)
    const members = useAppSelector(state=>state.memberReducer.members)

    const [media, setMedia] = useState<Media[]|null>(null)
    const [loadingMedia, setLoadingMedia] = useState(false)
    const [error, setError] = useState<string|null>(null)

    const [selectedMedia, setSelectedMedia] = useState<Media|null>(null)
    const [openSelectedMediaDialog, setOpenSelectedMediaDialog] = useState(false)
    const selectedMediaUploader = members?.find(m=>m.user.id===selectedMedia?.authorId)?.user ?? null

    const [dialogOpen, setDialogOpen] = useState(false)
    const [areYouSureOpen, setAreYouSureOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deletingError, setDeletingError] = useState<string|null>(null)

    const [openSettings, setOpenSettings] = useState(false)

    useEffect(()=>{
        if (!albumsLoading && albumId) dispatch(selectAlbum(albumId))
        return ()=>{dispatch(selectAlbum(null))}
    }, [albumsLoading, albumId])

    const fetchMedia = async () => {
        setLoadingMedia(true)
        setMedia(null)
        setError(null)
        try {
            const media = await albumApi.getMedia(albumId)
            setMedia(media)
        } catch (err) {
            setError(String(err))
        }
        setLoadingMedia(false)
    }
    const deleteMedia = async () => {
        if (!selectedMedia || !media) return
        setDeleting(true)
        setDeletingError(null)
        try {
            await albumApi.deleteMedia(albumId, selectedMedia.filename)

            const newMedia = [...media]
            const i = newMedia.findIndex(m=>m.filename===selectedMedia.filename)
            newMedia.splice(i, 1)

            setSelectedMedia(null)
            setOpenSelectedMediaDialog(false)
            setMedia(newMedia)
        } catch (err) {
            setDeletingError(String(err))
        }
        setDeleting(false)
    }
    const setCover = async () => {
        if (!selectedMedia || !media || !albums) return
        setDeleting(true)
        setDeletingError(null)
        try {
            const a = await albumApi.setAlbumCover(albumId, selectedMedia.filename)
            const newAlbums = [...albums]
            const i = newAlbums.findIndex(al=>al.id===a.id)
            if (i !== -1) newAlbums[i] = a
            dispatch(setAlbums(newAlbums))
        } catch (err) {
            setDeletingError(String(err))
        }
        setDeleting(false)
    }

    const navigateBack = () => {
        navigate(`/communities/${community.id}`)
    }

    useEffect(()=>{
        if (album) fetchMedia()
    }, [album])

    return <Container sx={{display: 'flex', alignItems: 'center', flexDirection: 'column', paddingTop: 1}}>
        <IconButton sx={{alignSelf: 'flex-start', position: 'absolute'}} size='large' onClick={navigateBack}>
            <ArrowBack />
        </IconButton>
        {
            albumsLoading
            ? <CircularProgress />
            : <>
                {
                    album
                    ? <>
                        <Typography variant="h3">
                            <IconButton  size='large' sx={{opacity: 0}}>
                                <Settings />
                            </IconButton>
                            {album.name}
                            <IconButton  size='large' onClick={()=>setOpenSettings(true)}>
                                <Settings />
                            </IconButton>
                        </Typography>
                        
                        <AlbumSettingsDialog open={openSettings} onClose={()=>setOpenSettings(false)} />
                        {
                            loadingMedia
                            ? <CircularProgress />
                            : <>
                                {
                                    media
                                    ? <>
                                        <ImageList variant="masonry" cols={4} gap={8}>
                                            {media.map(m=><MediaListItem key={m.filename} media={m} onSelect={(m)=>{
                                                setSelectedMedia(m)
                                                setOpenSelectedMediaDialog(true)
                                                }}/>)}
                                        </ImageList>
                                        {media.length === 0 && <Typography>This album is empty.</Typography>}
                                        <Fab sx={{position: 'fixed', bottom: 50, right: 50}} onClick={()=>setDialogOpen(true)}>
                                            <Add />
                                        </Fab>
                                        <MediaCreateDialog open={dialogOpen} albumId={album.id} onCancel={()=>setDialogOpen(false)} onSuccess={(m)=>{
                                            setMedia([...media, m])
                                            setDialogOpen(false)
                                        }} />
                                        <Dialog open={openSelectedMediaDialog} onClose={()=>{
                                            if (!deleting) setOpenSelectedMediaDialog(false)
                                            }} maxWidth='xl'>
                                            {
                                                selectedMedia?.type === 'image'
                                                ? <img src={selectedMedia?.url} style={{maxHeight: '85vh', maxWidth: '90vw'}} />
                                                : <video controls autoPlay loop style={{maxHeight: '85vh', maxWidth: '90vw'}}>
                                                    <source src={selectedMedia?.url} />
                                                </video>
                                            }
                                            <Divider />
                                            <Paper sx={{display: 'flex', alignItems: 'center'}}>
                                                <Typography sx={{paddingLeft: 1}}>{selectedMedia?.filename}</Typography>
                                                <Container sx={{display: 'flex', alignItems: 'center', justifySelf: 'flex-end'}}>
                                                    <Typography>Uploaded by: </Typography>
                                                    <Avatar src={selectedMediaUploader?.avatarUrl ?? undefined}/>
                                                    <Typography>{selectedMediaUploader?.username}</Typography>
                                                </Container>
                                                {selectedMedia?.type === 'image' && <Tooltip title={`Set as album cover`}>
                                                    <IconButton disabled={deleting} onClick={setCover}>
                                                        <PhotoSizeSelectLarge />
                                                    </IconButton>
                                                </Tooltip>}
                                                <Tooltip title={`Remove ${selectedMedia?.type}`}>
                                                    <IconButton color="error" disabled={deleting} onClick={()=>setAreYouSureOpen(true)}>
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                                {deletingError && <Typography color='error'>Error: {deletingError}</Typography>}
                                            </Paper>
                                        </Dialog>
                                        <AreYouSureDialog
                                            open={areYouSureOpen}
                                            description={`Are you sure you want to remove ${selectedMedia?.filename}? (THIS CANNOT BE UNDONE)`}
                                            onNo={()=>setAreYouSureOpen(false)}
                                            onYes={()=>{
                                                setAreYouSureOpen(false)
                                                deleteMedia()
                                            }}
                                        />
                                    </>
                                    : <>
                                        <Typography variant="h4">Error loading media: {error}</Typography>
                                        <Button variant='contained' onClick={fetchMedia}>retry</Button>
                                    </>
                                }
                            </>
                        }
                    </>
                    : <>
                        {
                            albumsError
                            ? <Typography color={'error'}>Error loading albums: {albumsError}</Typography>
                            : <>
                                <Typography variant="h4">No album with id {albumId} in this community</Typography>
                                <Button variant='contained' onClick={navigateBack}>go back</Button>
                            </>
                        }
                    </>
                }
            </>
        }
    </Container>
}

const MediaListItem = ({media, onSelect}: {media: Media, onSelect: (media: Media)=>void}) => {
    return <ImageListItem sx={{postion: 'relative'}}>
        {media.type === 'video' && <PlayCircle sx={{position: 'absolute', left: 10, top: 10, fontSize: 35}} />}
        {
            media.type === 'image'
            ? <img src={media.url} alt={media.filename} loading="lazy" onClick={()=>onSelect(media)}/>
            : <video width={400} onClick={()=>onSelect(media)}>
                <source src={media.url} />
            </video>
        }
    </ImageListItem>
}