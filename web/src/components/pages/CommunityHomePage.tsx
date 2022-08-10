import { Button, Card, CardActionArea, CardContent, CardMedia, Divider, Grid, Skeleton, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { openAlbumCreateDialog } from "../../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { Community } from "../../types"

export const CommunityHomePage = ({community}: {community: Community}) => {

    const navigate = useNavigate()

    const dispatch = useAppDispatch()
    const albums = useAppSelector(state=>state.albumReducer.albums)
    const loading = useAppSelector(state=>state.albumReducer.loading)
    const error = useAppSelector(state=>state.albumReducer.error)

    return <>
        <Typography variant="h4">Albums</Typography>
        {
            loading
            ? <Grid container>
                <Grid item xs={3}><Skeleton variant="rectangular" width={345} height={253}/></Grid>
                <Grid item xs={3}><Skeleton variant="rectangular" width={345} height={253}/></Grid>
                <Grid item xs={3}><Skeleton variant="rectangular" width={345} height={253}/></Grid>
                <Grid item xs={3}><Skeleton variant="rectangular" width={345} height={253}/></Grid>
            </Grid>
            : <>
                {
                    albums
                    ? <>
                        <Grid container>
                            {albums.map((album)=><Grid item key={album.id} xs={3}>
                                <Card sx={{ maxWidth: 345 }} onClick={()=>navigate(`albums/${album.id}`)}>
                                    <CardActionArea>
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={album.cover ? album.cover.url : "/logo512.png"}
                                            alt={album.name}
                                        />
                                        <Divider />
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="div">
                                                {album.name}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>)}
                        </Grid>
                        <Button sx={{marginTop: 1}} variant="outlined" onClick={()=>dispatch(openAlbumCreateDialog(community.id))}>add album</Button>
                    </>
                    : <Typography variant="h6" color='error'>error: {error}</Typography>
                }
            </>
        }
    </>
}