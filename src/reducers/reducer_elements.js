export default function(){
    return ({
        neutral: {
            name: 'neutral',
            breaks: ['rockWall'],
            deceleration: 0.2,
            texture : '#c2aa9e'
        },
        fire: {
            name: 'fire',
            breaks: ['iceWall', 'fireWall', 'rockWall'],
            deceleration: 0.2,
            texture: '#f25131'
        },
        ice: {
            name: 'ice',
            breaks: ['iceWall', 'fireWall', 'rockWall', 'steelWall'],
            deceleration: 0.16,
            texture: 'blue'
        },
        steel: {
            name: 'steel',
            breaks: ['iceWall', 'fireWall', 'rockWall', 'steelWall', 'diamondWall'],
            deceleration: 0.4,
            texture: 'grey'
        },
        diamond: {
            name: 'diamond',
            breaks: ['everything'],
            deceleration: 0.23,
            texture: 'white'
        }
    })
}