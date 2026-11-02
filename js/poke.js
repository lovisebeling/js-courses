const pokemon_url = 'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0';

fetch(pokemon_url)
    .then(response => response.json())
    .then(data => {
        console.log(data);

        data.results.forEach(pokemon => {
            console.log(pokemon.name);
        });
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des Pokémon :', error);
    });