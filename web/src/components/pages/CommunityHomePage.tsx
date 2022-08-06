import { Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Grid, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import communityApi from "../../api/communityApi"
import { Album, Community } from "../../types"
import { AlbumCreateDialog } from "../dialogs/AlbumCreateDialog"

export const CommunityHomePage = ({community}: {community: Community}) => {

    const navigate = useNavigate()
    const [albums, setAlbums] = useState<Album[]|null>(null)
    const [loading, setLoading] = useState(false)
    const [albumCreateDialogOpen, setAlbumCreateDialogOpen] = useState(false)

    const loadAlbums = async () => {
        setLoading(true)
        try {
            const a = await communityApi.getCommunityAlbums(community.id)
            setAlbums(a)
        } catch (err) {

        }
        setLoading(false)
    }

    useEffect(()=>{
        if (community) loadAlbums()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [community])

    return <>
        <Typography variant="h4">Albums</Typography>
        {
            loading
            ? <CircularProgress />
            : <>
                {
                    albums
                    ? <>
                        <Grid container>
                            {albums.map((album)=><Grid item key={album.id} xs={4}>
                                <Card sx={{ maxWidth: 345 }} onClick={()=>navigate(`albums/${album.id}`)}>
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
                                </Card>
                            </Grid>)}
                        </Grid>
                        <Button sx={{marginTop: 1}} variant="outlined" onClick={()=>setAlbumCreateDialogOpen(true)}>add album</Button>
                        <AlbumCreateDialog open={albumCreateDialogOpen} communityId={community.id} onCancel={()=>setAlbumCreateDialogOpen(false)} onSuccess={(album)=>{
                            setAlbums([...albums, album])
                            setAlbumCreateDialogOpen(false)
                        }}/>
                    </>
                    : <Typography variant="h6">eror :(</Typography>
                }
            </>
        }
    </>
}