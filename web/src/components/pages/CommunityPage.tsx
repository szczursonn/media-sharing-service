import { CircularProgress, Container, Typography } from "@mui/material"
import { useEffect } from "react"
import { Route, Routes, useParams } from "react-router-dom"
import { fetchAlbums } from "../../redux/albumSlice"
import { selectCommunity } from "../../redux/communitySlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { fetchMembers } from "../../redux/memberSlice"
import { AlbumPage } from "./AlbumPage"
import { CommunityHomePage } from "./CommunityHomePage"
import { CommunitySettingsPage } from "./CommunitySettingsPage"
import { NotFoundPage } from "./NotFoundPage"

export const CommunityPage = () => {

    const { communityId: _communityId } = useParams()
    const communityId = parseInt(_communityId!)

    const dispatch = useAppDispatch()
    const communities = useAppSelector(state=>state.communityReducer.communities)
    const loadingCommunities = useAppSelector(state=>state.communityReducer.loading)

    const community = communities?.find(c=>c.id===communityId) ?? null
    
    useEffect(()=>{
        if (!loadingCommunities && communityId) dispatch(selectCommunity(communities?.find(c=>c.id===communityId)?.id ?? null))
        return ()=>{dispatch(selectCommunity(null))}
    }, [loadingCommunities, communityId])

    useEffect(()=>{
        if (community) {
            dispatch(fetchMembers(community.id))
            dispatch(fetchAlbums(community.id))
        }
    }, [community])

    return <Container maxWidth={false} sx={{display: 'flex', alignItems: 'center', flexDirection: 'column', maxWidth: '80vw'}}>
        {
            loadingCommunities
            ? <CircularProgress />
            : <>
                {
                    community
                    ? <>
                        <Routes>
                            <Route index element={<CommunityHomePage community={community}/>} />
                            <Route path='settings' element={<CommunitySettingsPage community={community} />} />
                            <Route path='albums/:albumId' element={<AlbumPage community={community}/>} />
                            <Route path='*' element={<NotFoundPage />} />
                        </Routes>
                    </>
                    : <Typography variant="h6">Community with id {communityId} doesn't exist</Typography>
                }
            </>
        }
    </Container>
}