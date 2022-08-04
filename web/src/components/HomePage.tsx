import { Box, Typography } from "@mui/material"
import { useContext } from "react"
import { useAppSelector } from "../redux/hooks"

export const HomePage = () => {

    const user = useAppSelector(state=>state.userReducer.user)

    return <Box sx={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
        <Typography variant="h3">
            user logged in?: {String(!!user)}
        </Typography>
    </Box>
}