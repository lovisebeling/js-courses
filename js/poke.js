
const pokemon_url = 'https://pokeapi.co/api/v2/pokemon';

const pokemon_per_page = 10;
let offset = 0;
let total_pokemon = 0;

const pokemon_list = document.querySelector('#pokemon-list');
const previous_button = document.querySelector('#previous');
const next_button = document.querySelector('#next');
const page_number = document.querySelector('#page-number');

function load_pokemon() {
    fetch(`${pokemon_url}?limit=${pokemon_per_page}&offset=${offset}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la requête API');
            }

            return response.json();
        })
        .then(data => {
            total_pokemon = data.count;

            // On vide la page actuelle
            pokemon_list.innerHTML = '';

            // On affiche les Pokémon reçus
            data.results.forEach((pokemon, index) => {
                const pokemon_element = document.createElement('div');

                const pokemon_number = offset + index + 1;

                pokemon_element.textContent =
                    `#${String(pokemon_number).padStart(3, '0')} - ${pokemon.name}`;

                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(pokemon_data => {
                        const image = document.createElement('img');

                        image.src = pokemon_data.sprites.front_default;
                        image.alt = pokemon.name;

                        pokemon_element.appendChild(image);
                    });

                pokemon_list.appendChild(pokemon_element);
            });

            // Mise à jour des boutons et du numéro de page
            const current_page = Math.floor(offset / pokemon_per_page) + 1;
            const total_pages = Math.ceil(total_pokemon / pokemon_per_page);

            page_number.textContent =
                `Page ${current_page} / ${total_pages}`;

            previous_button.disabled = offset === 0;
            next_button.disabled =
                offset + pokemon_per_page >= total_pokemon;
        })
        .catch(error => {
            console.error(error);
            pokemon_list.textContent =
                'Impossible de charger les Pokémon.';
        });
}

next_button.addEventListener('click', () => {
    offset += pokemon_per_page;
    load_pokemon();
});

previous_button.addEventListener('click', () => {
    offset -= pokemon_per_page;
    load_pokemon();
});

load_pokemon();
