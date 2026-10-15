const passengers = [
    {
        'id': 1,
        'name': 'John',
        'isForbidden': false,
        'height': 160
    },
    {
        'id': 2,
        'name': 'Jane',
        'isForbidden': true,
        'height': 173
    },
    {
        'id': 3,
        'name': 'Guillaume',
        'isForbidden': false,
        'height': 130
    },
    {
        'id': 4,
        'name': 'Marie',
        'isForbidden': false,
        'height': 155
    },
    {
        'id': 5,
        'name': 'Celine',
        'isForbidden': false,
        'height': 182
    },    
    {
        'id': 6,
        'name': 'David',
        'isForbidden': false,
        'height': 168
    },
        {
        'id': 7,
        'name': 'Eric',
        'isForbidden': false,
        'height': 120
    },

        {
        'id': 8,
        'name': 'Adolf',
        'isForbidden': false,
        'height': 150
    },

        {
        'id': 9,
        'name': 'Hiro',
        'isForbidden': false,
        'height': 160
    },

        {
        'id': 10,
        'name': 'Benito',
        'isForbidden': false,
        'height': 145
    }
]


wagon = []

for (let i = 0; i < passengers.length; i++) {
    if (passengers[i].height >= 140 && passengers[i].isForbidden === false && wagon.length < 5) {
        console.log(`${passengers[i].name} embarque sur la place ${wagon.length + 1}`)

        wagon.push(passengers[i])
    }
    else if (wagon.length === 5) {
        console.log("Le wagon est plein")
        break
    }
    else if(passengers[i].height < 140 ){
        console.log(`${passengers[i].name}: taille insuffisante`)
    }
    else if(passengers[i].isForbidden === true){
        console.log(`${passengers[i].name}: interdit de manége`)
    }
}
