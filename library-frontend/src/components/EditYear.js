import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { EDIT_YEAR } from '../mutations'
import Select from 'react-select'

const EditYear = ({ authors }) => {
    const [selected, setSelected] = useState(null)
    const [bornYear, setBornYear] = useState('')
    const [ editYear ] = useMutation(EDIT_YEAR)

    const edit = (event) => {
        event.preventDefault()

        if (selected === null) return

        editYear({ variables: { name: selected.value, setBornTo: parseInt(bornYear) }})

        setBornYear('')
    }

    const setOptions = () => {
        const options = []

        authors.forEach(author => {
            options.push({
                label: author.name,
                value: author.name
            })
        })

        return options
    }
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2>Set birthyear</h2>
            <form onSubmit={edit} style={{ display: 'flex', flexDirection: 'column', width: 200 }}>
                <Select 
                    options={setOptions()}
                    defaultValue={selected}
                    onChange={setSelected}
                />
                <input placeholder='Born' onChange={ ({ target }) => setBornYear(target.value) } />
                <input type='submit' value='Update author' />
            </form>
        </div>
    )
}

export default EditYear