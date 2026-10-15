const hobbies = ['reading', 'gaming', 'hiking', 'cooking'];

for (let i = 0; i < hobbies.length; i++) {
    console.log(hobbies[i]);
}

for (const hobby of hobbies) {
    console.log(hobby);
}

hobbies.forEach((hobby) => {
    console.log(hobby);
});


const car = {
    brand: 'Ferrari',
    model: 'Purosangue',
    color: 'red',
    year: 2023}