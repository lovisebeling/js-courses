const pokemon_url = 'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0';

fetch(pokemon_url)
    .then(response => response.json())
    .then(data => {
        const pokemon_list = document.querySelector('#pokemon-list');

        data.results.forEach((pokemon, index) => {
            const pokemon_element = document.createElement('p');

            pokemon_element.textContent =
                `#${String(index + 1).padStart(3, '0')} - ${pokemon.name}`;

            pokemon_list.appendChild(pokemon_element);
        });
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des Pokémon :', error);
    });