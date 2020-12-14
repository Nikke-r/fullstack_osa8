import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { LOGIN } from '../mutations'

const LoginForm = ({ setError, setToken, show }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            setError(error.graphQLErrors[0].message)
        }
    })

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            setToken(token)
            localStorage.setItem('token', token)
        }
    }, [result.data, setToken])

    const handleLogin = (event) => {
        event.preventDefault()

        login({ variables: { username, password }})

        setUsername('')
        setPassword('')
    }

    if (!show) {
        return null
    }

    return(
        <div>
            <form onSubmit={handleLogin}>
                <input placeholder="Username" onChange={({ target }) => setUsername(target.value)} />
                <input placeholder="Password" onChange={({ target }) => setPassword(target.value)} type="password" />
                <input type="submit" value="Log in" />
            </form>
        </div>
    )
}

export default LoginForm