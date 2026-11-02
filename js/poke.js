
const API_URL = 'https://pokeapi.co/api/v2/pokemon';

const POKEMON_PER_PAGE = 9;

let offset = 0;
let totalPokemon = 0;
let isLoading = false;

const pokemonList = document.querySelector('#pokemon-list');
const previousButton = document.querySelector('#previous');
const nextButton = document.querySelector('#next');
const pageNumber = document.querySelector('#page-number');
const pageIndicator = document.querySelector('#page-indicator');
const resultCount = document.querySelector('#result-count');
const errorMessage = document.querySelector('#error-message');

const typeTranslations = {
    normal: 'Normal',
    fire: 'Feu',
    water: 'Eau',
    electric: 'Électrik',
    grass: 'Plante',
    ice: 'Glace',
    fighting: 'Combat',
    poison: 'Poison',
    ground: 'Sol',
    flying: 'Vol',
    psychic: 'Psy',
    bug: 'Insecte',
    rock: 'Roche',
    ghost: 'Spectre',
    dragon: 'Dragon',
    dark: 'Ténèbres',
    steel: 'Acier',
    fairy: 'Fée'
};

function getRegion(id) {
    if (id <= 151) return 'Kanto';
    if (id <= 251) return 'Johto';
    if (id <= 386) return 'Hoenn';
    if (id <= 493) return 'Sinnoh';
    if (id <= 649) return 'Unys';
    if (id <= 721) return 'Kalos';
    if (id <= 809) return 'Alola';
    if (id <= 905) return 'Galar';
    if (id <= 1025) return 'Paldea';

    return 'Autre';
}

function createDetail(label, value) {
    const wrapper = document.createElement('div');

    const labelElement = document.createElement('span');
    labelElement.className = 'stat-label';
    labelElement.textContent = label;

    const valueElement = document.createElement('span');
    valueElement.className = 'stat-value';
    valueElement.textContent = value;

    wrapper.append(labelElement, valueElement);

    return wrapper;
}

function createPokemonCard(pokemon) {
    const card = document.createElement('article');
    card.className = 'pokemon-card';

    // Partie gauche : les informations
    const info = document.createElement('div');
    info.className = 'pokemon-info';

    const number = document.createElement('span');
    number.className = 'pokemon-number';
    number.textContent =
        `N° ${String(pokemon.id).padStart(3, '0')}`;

    const name = document.createElement('h3');
    name.className = 'pokemon-name';
    name.textContent =
        pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

    const region = document.createElement('p');
    region.className = 'region';
    region.textContent = getRegion(pokemon.id);

    const types = document.createElement('div');
    types.className = 'type-list';

    pokemon.types.forEach(typeInfo => {
        const badge = document.createElement('span');
        badge.className = 'type-badge';
        badge.textContent =
            typeTranslations[typeInfo.type.name] ?? typeInfo.type.name;

        types.appendChild(badge);
    });

    const details = document.createElement('div');
    details.className = 'pokemon-details';

    // L'API donne la taille en décimètres et le poids en hectogrammes.
    details.append(
        createDetail('TAILLE', `${(pokemon.height / 10).toFixed(1)} m`),
        createDetail('POIDS', `${(pokemon.weight / 10).toFixed(1)} kg`)
    );

    const statsToDisplay = [
        ['hp', 'PV'],
        ['attack', 'ATTAQUE'],
        ['defense', 'DÉFENSE'],
        ['speed', 'VITESSE']
    ];

    statsToDisplay.forEach(([statName, label]) => {
        const stat = pokemon.stats.find(
            item => item.stat.name === statName
        );

        if (stat) {
            details.appendChild(
                createDetail(label, stat.base_stat)
            );
        }
    });

    info.append(number, name, region, types, details);

    // Partie droite : l'image
    const image = document.createElement('img');
    image.className = 'pokemon-image';
    image.alt = `Illustration de ${pokemon.name}`;
    image.loading = 'lazy';

    image.src =
        pokemon.sprites.other['official-artwork'].front_default
        || pokemon.sprites.front_default
        || '';

    if (!image.src) {
        image.alt = `Image indisponible pour ${pokemon.name}`;
    }

    card.append(info, image);

    return card;
}

async function loadPokemon() {
    if (isLoading) return;

    isLoading = true;
    previousButton.disabled = true;
    nextButton.disabled = true;

    pokemonList.replaceChildren();

    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'loading';
    loadingMessage.textContent = 'Chargement des Pokémon...';
    pokemonList.appendChild(loadingMessage);

    errorMessage.textContent = '';

    try {
        // 1. Récupérer la page de neuf Pokémon.
        const response = await fetch(
            `${API_URL}?limit=${POKEMON_PER_PAGE}&offset=${offset}`
        );

        if (!response.ok) {
            throw new Error('Impossible de récupérer la liste.');
        }

        const data = await response.json();

        totalPokemon = data.count;

        // 2. Récupérer les informations détaillées de chaque Pokémon.
        const pokemonDetails = await Promise.all(
            data.results.map(async pokemon => {
                const detailResponse = await fetch(pokemon.url);

                if (!detailResponse.ok) {
                    throw new Error(
                        `Impossible de récupérer ${pokemon.name}.`
                    );
                }

                return detailResponse.json();
            })
        );

        // 3. Créer et afficher les cartes.
        pokemonList.replaceChildren();

        pokemonDetails.forEach(pokemon => {
            pokemonList.appendChild(createPokemonCard(pokemon));
        });

        // 4. Actualiser la pagination.
        const currentPage = Math.floor(offset / POKEMON_PER_PAGE) + 1;
        const totalPages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);

        pageNumber.textContent = `PAGE ${currentPage} / ${totalPages}`;
        pageIndicator.textContent =
            String(currentPage).padStart(2, '0');

        resultCount.textContent =
            `${offset + 1}–${offset + pokemonDetails.length} / ${totalPokemon}`;

    } catch (error) {
        console.error(error);

        pokemonList.replaceChildren();
        errorMessage.textContent =
            'Impossible de charger les Pokémon. Vérifie ta connexion et réessaie.';

    } finally {
        isLoading = false;

        previousButton.disabled = offset === 0;
        nextButton.disabled =
            offset + POKEMON_PER_PAGE >= totalPokemon;
    }
}

nextButton.addEventListener('click', () => {
    if (isLoading || offset + POKEMON_PER_PAGE >= totalPokemon) {
        return;
    }

    offset += POKEMON_PER_PAGE;
    loadPokemon();
});

previousButton.addEventListener('click', () => {
    if (isLoading || offset === 0) {
        return;
    }

    offset -= POKEMON_PER_PAGE;
    loadPokemon();
});

// Chargement initial
loadPokemon();
