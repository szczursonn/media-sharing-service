import { Backdrop, Button, CircularProgress, Grid, Paper, Stack, Typography } from "@mui/material"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { getCurrentUser, loginOrRegisterWithOAuth2Provider } from "../api"
import { UserContext } from "../contexts/UserContext"
import { InvalidOAuth2CodeError, UnavailableOAuth2ProviderError } from "../errors"
import { OAuth2Provider } from "../types"

export const CallbackPage = () => {

    const navigate = useNavigate()
    const { provider } = useParams()
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<null|string>(null)

    const context = useContext(UserContext)

    const code = searchParams.get('code')
    const isProviderValid = (provider !== undefined && (provider === 'google' || provider === 'discord' || provider === 'github'))

    const exchange = async (code: string, provider: OAuth2Provider) => {
        setLoading(true)
        try {
            await loginOrRegisterWithOAuth2Provider(code, provider)
            const user = await getCurrentUser()
            context.setUser(user)
            navigate('/')
        } catch (err) {
            if (err instanceof InvalidOAuth2CodeError) {
                setError(`Invalid OAuth2 code`)
            }
            if (err instanceof UnavailableOAuth2ProviderError) {
                setError(`Logging in with ${provider} is currently unavailable`)
            }
        }
        setLoading(false)
    }

    useEffect(()=>{
        if (!isProviderValid) setError(`Invalid OAuth2 Provider: ${provider}`)
        else if (code === null) setError(`Missing code in query params`)
        else if (!loading) setError(`There was an error`)

        if (code !== null && isProviderValid) {
            exchange(code, provider)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, provider])

    if (error !== null) {
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