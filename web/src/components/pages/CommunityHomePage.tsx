import { Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Grid, Typography } from "@mui/material"
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
                        <Button sx={{marginTop: 1}} variant="outlined" onClick={()=>dispatch(openAlbumCreateDialog(community.id))}>add album</Button>
                    </>
                    : <Typography variant="h6" color='error'>error: {error}</Typography>
                }
            </>
        }
    </>
}