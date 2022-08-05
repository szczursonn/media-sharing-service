import { Avatar, Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Container, Grid, Paper, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import communityApi from "../../api/communityApi"
import { selectCommunity } from "../../redux/communitySlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { Album, Member } from "../../types"
import { AlbumCreateDialog } from "../dialogs/AlbumCreateDialog"

export const CommunityPage = () => {

    const { communityId: _communityId } = useParams()
    const communityId = parseInt(_communityId!)
    const [albums, setAlbums] = useState<Album[]|null>(null)
    const [loading, setLoading] = useState(false)
    const [AlbumCreateDialogOpen, setAlbumCreateDialogOpen] = useState(false)
    const [members, setMembers] = useState<Member[]|null>(null)
    const [loadingMembers, setLoadingMembers] = useState(false)

    const loadAlbums = async () => {
        setLoading(true)
        try {
            const a = await communityApi.getCommunityAlbums(communityId)
            setAlbums(a)
        } catch (err) {

        }
        setLoading(false)
    }

    const loadMembers = async () => {
        setMembers(null)
        setLoadingMembers(true)
        try {
            const mem = await communityApi.getCommunityMembers(communityId)
            setMembers(mem)
        } catch (err) {

        }
        setLoadingMembers(false)
    }

    const dispatch = useAppDispatch()
    const communities = useAppSelector(state=>state.communityReducer.communities)
    const loadingCommunities = useAppSelector(state=>state.communityReducer.loading)

    const community = communities?.find(c=>c.id===communityId) ?? null
    
    useEffect(()=>{
        if (!loadingCommunities && communityId) dispatch(selectCommunity(communities?.find(c=>c.id===communityId) ?? null))
        return ()=>{dispatch(selectCommunity(null))}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingCommunities, communityId])

    useEffect(()=>{
        if (community) loadAlbums().then(loadMembers)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [community])

    return <Container maxWidth='lg' sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        {
            community
            ? <>
                <Typography variant="h3">{community.name}</Typography>
                <Typography variant="h4">Albums</Typography>
                {
                    loading
                    ? <CircularProgress />
                    : <>
                        {
                            albums
                            ? <>
                                <Grid container>
                                    {albums.map((album)=><Grid item key={album.id} xs={4}><Card sx={{ maxWidth: 345 }}>
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
                                <Button sx={{marginTop: 1}} variant="outlined" onClick={()=>setAlbumCreateDialogOpen(true)}>add album</Button>
                                <AlbumCreateDialog open={AlbumCreateDialogOpen} communityId={communityId} onCancel={()=>setAlbumCreateDialogOpen(false)} onSuccess={(album)=>{
                                    setAlbums([...albums, album])
                                    setAlbumCreateDialogOpen(false)
                                }}/>
                                <Typography variant="h4">Members</Typography>
                                <Grid container>
                                    {
                                        loadingMembers
                                        ? <CircularProgress />
                                        : <>
                                            {
                                                members
                                                ? <>
                                                    {members.map(m=><Grid item key={m.user.id}>
                                                        <Paper sx={{padding: 1.5, alignItems: 'center', display: 'flex'}}>
                                                            <Avatar src={m.user.avatarUrl ?? undefined}/>
                                                            <Typography sx={{marginLeft: 1}}>{m.user.username}</Typography>
                                                        </Paper>
                                                    </Grid>)}
                                                </>
                                                : <Typography>eror :(</Typography>
                                            }
                                        </>
                                    }
                                </Grid>
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