import { Backdrop, Button, CircularProgress, Grid, Paper, Stack, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { getCurrentUser, loginOrRegisterWithOAuth2Provider } from "../db"
import { UserContext } from "../contexts/UserContext"

export const CallbackPage = () => {

    const navigate = useNavigate()
    const { provider } = useParams()
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(true)

    const context = useContext(UserContext)

    const code = searchParams.get('code')
    const isProviderValid = (provider !== undefined && (provider === 'google' || provider === 'discord' || provider === 'github'))

    useEffect(()=>{
        if (code !== null && isProviderValid) {
            setLoading(true)
            loginOrRegisterWithOAuth2Provider(code, provider)
                .then(()=>getCurrentUser())
                .then((u)=>{
                    context.setUser(u)
                    navigate('/')
                })
                .catch(e=>e)
                .finally(()=>setLoading(false))
        }
    }, [])

    let error: string | null = null

    if (!isProviderValid) error = `Invalid OAuth2 Provider: ${provider}`
    else if (code === null) error = `Missing code in query params`
    else if (!loading) error = `There was an error`

    if (error) {
        return <Grid container alignItems='center' justifyItems='center' direction='column' marginTop='10vh'>
            <Paper elevation={5} sx={{padding: '15px', display: 'flex', justifyItems: 'center', flexDirection: 'column'}}>
                <Typography variant="h5" color='error'>{error}</Typography>
                <Button variant="contained" onClick={()=>navigate('/')}>HOME</Button>
            </Paper>
            
        </Grid>
    }

    return <div>
            <Backdrop open={true} sx={{color: '#fff', zIndex: (theme)=>theme.zIndex.drawer+1}}>
                <Stack sx={{alignItems: 'center'}}>
                    <CircularProgress color="inherit" />
                    <Typography variant="h4">Logging in with {provider}...</Typography>
                </Stack>
            </Backdrop>
        </div>
}