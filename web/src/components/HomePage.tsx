import { Box, Typography } from "@mui/material"
import { useContext } from "react"
import { UserContext } from "../contexts/UserContext"

export const HomePage = () => {

    const context = useContext(UserContext)

    return <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <Typography variant="h3">
            user logged in?: {String(!!context.user)}
        </Typography>
    </Box>
}