import { Backdrop, Button, CircularProgress, Grid, Paper, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import userApi from "../../api/userApi"
import { AppError } from "../../errors"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"
import { fetchCurrentUser } from "../../redux/userSlice"
import { OAuth2Provider } from "../../types"

export const CallbackPage = () => {

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const loadingUser = useAppSelector(state=>state.userReducer.loading)

    const { provider } = useParams()
    const isProviderValid = (provider !== undefined && (provider === 'google' || provider === 'discord' || provider === 'github'))

    const [searchParams] = useSearchParams()
    const code = searchParams.get('code')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string|null>(null)

    const exchange = async (code: string, provider: OAuth2Provider) => {
        setLoading(true)
        try {
            if (localStorage.getItem('token')) {
                await userApi.addConnection(code, provider)
            } else {
                await userApi.loginOrRegisterWithOAuth2Provider(code, provider)
                dispatch(fetchCurrentUser())
            }
            navigate(localStorage.getItem('beforeLoginPage') ?? '/')
        } catch (err) {
            if (err instanceof AppError) {
                switch (err.type) {
                    case 'invalid_oauth2_code':
                        setError(`Invalid OAuth2 code`)
                        break
                    case 'unavailable_oauth2_provider':
                        setError(`Logging in with ${provider} is currently unavailable`)
                        break
                    case 'already_connected':
                        setError(`That ${provider} account is already connected to different account!`)
                        break
                    default:
                        setError(`Unknown error: ${err.type}`)
                }
            }
            else setError(`Unknown error: ${err}`)
        }
        setLoading(false)
    }

    useEffect(()=>{
        if (!isProviderValid) setError(`Invalid OAuth2 Provider: ${provider}`)
        else if (code === null) setError(`Missing code in query params`)

        if (code !== null && isProviderValid && !loading) {
            exchange(code, provider)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loadingUser) {
        return <></>
    }

    if (error !== null) {
        return <Grid container alignItems='center' justifyItems='center' direction='column' marginTop='10vh'>
            <Paper elevation={5} sx={{padding: '15px', display: 'flex', justifyItems: 'center', flexDirection: 'column'}}>
                <Typography variant="h5" color='error'>ERROR: {error}</Typography>
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