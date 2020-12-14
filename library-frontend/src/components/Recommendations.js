import { useQuery } from '@apollo/client'
import React from 'react'
import { GET_RECOMMENDATIONS } from '../queries'

const Recommendations = ({ show }) => {
    const result = useQuery(GET_RECOMMENDATIONS)

    if (!show) {
        return null
    }

    return (
        <div>
            <h3>Recommendations</h3>
            <p>books in your favorite genre <b>patterns</b></p>
            <table>
                <tbody>
                    <tr>
                        <td></td>
                        <td><b>author</b></td>
                        <td><b>published</b></td>
                    </tr>
                    {result.data.getRecommendations.map(book => 
                        <tr key={book.title}>
                            <td> {book.title} </td>
                            <td> {book.author.name} </td>
                            <td> {book.published} </td>
                        </tr>    
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Recommendations
