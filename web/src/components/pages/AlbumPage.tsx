import { Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { Community } from "../../types";

export const AlbumPage = ({community}: {community: Community}) => {
    const {albumId: _albumId} = useParams()
    const albumId = parseInt(_albumId!)

    const album = useAppSelector(state=>state.albumReducer.albums?.find(a=>a.id===albumId))

    return <Container>
        <Typography variant="h4">album id: {albumId}</Typography>
        <Typography variant="h5">album name: {album?.name ?? 'null'}</Typography>
        <Typography>community: {community.name}</Typography>
    </Container>
}