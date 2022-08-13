import { Button, Dialog, DialogTitle, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from "@mui/material"
import { useState } from "react"
import { closeMockLoginDialog } from "../../redux/dialogSlice"
import { useAppDispatch, useAppSelector } from "../../redux/hooks"

export const MockLoginDialog = () => {

    const dispatch = useAppDispatch()

    const open = useAppSelector(state=>state.dialogReducer.mockLoginOpen)
    const [foreignId, setForeignId] = useState('')
    const [provider, setProvider] = useState('discord')

    const onClose = () => {
        dispatch(closeMockLoginDialog())
    }

    const onMockLogin = () => {
        window.location.href=`callback/${provider}?code=${foreignId}`
    }

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>Mock login</DialogTitle>
        <Stack marginBottom={4}>
            <TextField sx={{marginLeft: 5, marginRight: 5, marginBottom: 1}} label='foreign id' value={foreignId} onChange={e=>setForeignId(e.target.value)}></TextField>
            <RadioGroup row sx={{marginLeft: 5, marginRight: 5, marginBottom: 1}} value={provider} onChange={e=>setProvider(e.target.value)}>
            <FormControlLabel value='discord' control={<Radio />} label='Discord'/>
            <FormControlLabel value='google' control={<Radio />} label='Google'/>
            <FormControlLabel value='github' control={<Radio />} label='Github'/>
            </RadioGroup>
            <Button sx={{marginLeft: 5, marginRight: 5, padding: 0.5, display: 'flex', alignItems: 'center', backgroundColor: 'orange'}} onClick={onMockLogin}>
            <Typography variant="subtitle2" color={'#111'}>
                mock OAuth2 login
            </Typography>
            </Button>
        </Stack>
    </Dialog>
}