import { Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Container, Grid, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getCommunityAlbums } from "../api"
import { CommunityContext } from "../contexts/CommunityContext"
import { Album } from "../types"
import { AlbumCreateDialog } from "./AlbumCreateDialog"

export const CommunityPage = () => {

    const { communityId: _communityId } = useParams()
    const communityId = parseInt(_communityId!)
    const [albums, setAlbums] = useState<Album[]|null>(null)
    const [loading, setLoading] = useState(false)
    const [AlbumCreateDialogOpen, setAlbumCreateDialogOpen] = useState(false)

    const loadAlbums = async () => {
        setLoading(true)
        try {
            const a = await getCommunityAlbums(communityId)
            setAlbums(a)
        } catch (err) {

        }
        setLoading(false)
    }

    const ctx = useContext(CommunityContext)

    const community = ctx.communities?.find(c=>c.id===communityId) ?? null

    useEffect(()=>{
        if (!ctx.loading && communityId) ctx.select(ctx.communities?.find(c=>c.id===communityId) ?? null)
        return ()=>ctx.select(null)
    }, [ctx, communityId])

    useEffect(()=>{
        if (community) loadAlbums()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [community])

    return <Container maxWidth='lg' sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <Typography variant="h5">communityId: {communityId}</Typography>
        {
            community
            ? <>
                <Typography>name: {community.name}</Typography>
                {
                    loading
                    ? <CircularProgress />
                    : <>
                        {
                            albums
                            ? <>
                                <Grid container>
                                    {albums.map((album)=><Grid item xs={4}><Card sx={{ maxWidth: 345 }}>
                                            <CardActionArea>
                                                <CardMedia
                                                component="img"
                                                height="140"
                                                image="/logo512.png"
                                                alt="green iguana"
                                                />
                                                <CardContent>
                                                <Typography gutterBottom variant="h5" component="div">
                                                    {album.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Lizards are a widespread group of squamate reptiles, with over 6,000
                                                    species, ranging across all continents except Antarctica
                                                </Typography>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card></Grid>)}
                                </Grid>
                                <Button onClick={()=>setAlbumCreateDialogOpen(true)}>add album</Button>
                                <AlbumCreateDialog open={AlbumCreateDialogOpen} communityId={communityId} onCancel={()=>setAlbumCreateDialogOpen(false)} onSuccess={(album)=>{
                                    setAlbums([...albums, album])
                                    setAlbumCreateDialogOpen(false)
                                }}/>
                            </>
                            : <Typography variant="h6">eror :(</Typography>
                        }
                    </>
                }
            </>
            : <Typography variant="h6">Community doesn't exist</Typography>
        }
    </Container>
}