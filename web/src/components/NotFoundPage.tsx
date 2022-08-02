import { Button, Box, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

export const NotFoundPage = () => {

    const navigate = useNavigate()

    return <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <Typography variant="h1">404</Typography>
        <Typography variant="h2">There is nothing here!</Typography>
        <Button variant="contained" onClick={()=>navigate('/')}>Home</Button>
    </Box>
}