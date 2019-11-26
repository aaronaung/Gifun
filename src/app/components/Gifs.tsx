import React from 'react'

const Gifs = () => {
    React.useEffect(() => {
        console.log('GIFS COMPONENT LOADED')

        return () => {
            'GIFS COMPONENT TORN DOWN'
        }
    }, [])

    return <h1>GIFS COMPONENT</h1>
}

export default Gifs
