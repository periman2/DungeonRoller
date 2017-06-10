export default function(){
    return ({
        neutral: {
            name: 'neutral',
            breaks: ['rockWall'],
            deceleration: 0.2
        },
        fire: {
            name: 'fire',
            breaks: ['iceWall', 'fireWall', 'rockWall'],
            deceleration: 0.2
        },
        ice: {
            name: 'ice',
            breaks: ['iceWall', 'fireWall', 'rockWall', 'steelWall'],
            deceleration: 0.12
        },
        steel: {
            name: 'steel',
            breaks: ['iceWall', 'fireWall', 'rockWall', 'steelWall', 'diamondWall'],
            deceleration: 0.4
        },
        diamond: {
            name: 'diamond',
            breaks: ['everything'],
            deceleration: 0.22
        }
    })
}