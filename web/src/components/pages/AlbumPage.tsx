import { Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { Community } from "../../types";

export const AlbumPage = ({community}: {community: Community}) => {
    const {albumId: _albumId} = useParams()
    const albumId = parseInt(_albumId!)


    return <Container>
        <Typography variant="h4">album id: {albumId}</Typography>
        <Typography>community: {community.name}</Typography>
    </Container>
}