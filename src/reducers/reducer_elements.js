export default function(){
    return ({
        neutral: {
            name: 'neutral',
            breaks: ['rockWall'],
            deceleration: 0.2,
            texture : '../textures/neutralElement.png'
        },
        fire: {
            name: 'fire',
            breaks: ['iceWall', 'fireWall', 'rockWall'],
            deceleration: 0.2,
            texture: '../textures/fireElement.png'
        },
        ice: {
            name: 'ice',
            breaks: ['iceWall', 'fireWall', 'rockWall', 'steelWall'],
            deceleration: 0.16,
            texture: '../textures/iceElement.png'
        },
        steel: {
            name: 'steel',
            breaks: ['iceWall', 'fireWall', 'rockWall', 'steelWall', 'diamondWall'],
            deceleration: 0.4,
            texture: '../textures/steelElement.png'
        },
        diamond: {
            name: 'diamond',
            breaks: ['everything'],
            deceleration: 0.23,
            texture: '../textures/diamondElement.png'
        }
    })
}