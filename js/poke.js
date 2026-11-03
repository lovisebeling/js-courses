
const API_URL = 'https://pokeapi.co/api/v2/pokemon';

const SPECIES_URL = 'https://pokeapi.co/api/v2/pokemon-species';
const EVOLUTION_CHAIN_URL = 'https://pokeapi.co/api/v2/evolution-chain';

let orderedPokemonIds = null;
let speciesListCache = null;

const POKEMON_PER_PAGE = 9;

// The first type determines the card's accent color.
const TYPE_COLORS = {
    normal: '#A8A77A',
    fire: '#FF7043',
    water: '#4DABF7',
    electric: '#F7D94C',
    grass: '#65D86E',
    ice: '#75DDEB',
    fighting: '#E05252',
    poison: '#BD70D5',
    ground: '#D6B36A',
    flying: '#91A7FF',
    psychic: '#FF75A8',
    bug: '#A8C83D',
    rock: '#B7A35A',
    ghost: '#8A7ACB',
    dragon: '#7C75FF',
    dark: '#8A7A73',
    steel: '#9CA9BC',
    fairy: '#F3A5D2'
};

const STAT_LABELS = {
    hp: 'HP',
    attack: 'ATTACK',
    defense: 'DEFENSE',
    'special-attack': 'SP. ATK',
    'special-defense': 'SP. DEF',
    speed: 'SPEED'
};

let offset = 0;
let totalPokemon = 0;
let isLoading = false;
let isSearchMode = false;

const pokemonList = document.querySelector('#pokemon-list');
const previousButton = document.querySelector('#previous');
const nextButton = document.querySelector('#next');
const pageNumber = document.querySelector('#page-number');
const pageIndicator = document.querySelector('#page-indicator');
const resultCount = document.querySelector('#result-count');
const errorMessage = document.querySelector('#error-message');

const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const clearSearchButton = document.querySelector('#clear-search');
const firstPageButton = document.querySelector('#first-page');
const lastPageButton = document.querySelector('#last-page');

const groupFamiliesCheckbox = document.querySelector('#group-families');

let groupByFamilies = false;

function getRegion(id) {
    if (id <= 151) return 'Kanto';
    if (id <= 251) return 'Johto';
    if (id <= 386) return 'Hoenn';
    if (id <= 493) return 'Sinnoh';
    if (id <= 649) return 'Unova';
    if (id <= 721) return 'Kalos';
    if (id <= 809) return 'Alola';
    if (id <= 905) return 'Galar';
    if (id <= 1025) return 'Paldea';

    return 'Other';
}

async function buildEvolutionOrder() {
    if (orderedPokemonIds) return orderedPokemonIds;

    const response = await fetch(`${SPECIES_URL}?limit=2000`);

    if (!response.ok) {
        throw new Error(`Species list error: ${response.status}`);
    }

    const data = await response.json();
    totalPokemon = data.count;

    const speciesDetails = [];

    // Fetch species details in small batches.
    for (let i = 0; i < data.results.length; i += 40) {
        const batch = data.results.slice(i, i + 40);

        const details = await Promise.all(
            batch.map(async species => {
                const result = await fetch(species.url);

                if (!result.ok) {
                    throw new Error(
                        `Species error (${species.name}): ${result.status}`
                    );
                }

                return result.json();
            })
        );

        speciesDetails.push(...details);
    }

    const speciesIdByName = new Map();
    const chainUrls = new Set();

    speciesDetails.forEach(species => {
        speciesIdByName.set(species.name, species.id);

        if (species.evolution_chain?.url) {
            chainUrls.add(species.evolution_chain.url);
        }
    });

    const families = [];

    function flattenEvolutionChain(chain, family) {
        const id = speciesIdByName.get(chain.species.name);

        if (id !== undefined) {
            family.push(id);
        }

        chain.evolves_to.forEach(evolution => {
            flattenEvolutionChain(evolution, family);
        });
    }

    for (const url of chainUrls) {
        const result = await fetch(url);

        if (!result.ok) {
            throw new Error(`Evolution chain error: ${result.status}`);
        }

        const data = await result.json();
        const family = [];

        flattenEvolutionChain(data.chain, family);

        if (family.length > 0) {
            families.push(family);
        }
    }

    families.sort((a, b) => Math.min(...a) - Math.min(...b));

    const ids = families.flat();
    const includedIds = new Set(ids);

    for (let id = 1; id <= totalPokemon; id++) {
        if (!includedIds.has(id)) {
            ids.push(id);
        }
    }

    orderedPokemonIds = ids;

    return orderedPokemonIds;
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

function createStatBar(stat) {
    const item = document.createElement('div');
    item.className = 'stat-item';

    const heading = document.createElement('div');
    heading.className = 'stat-heading';

    const label = document.createElement('span');
    label.className = 'stat-label';
    label.textContent = STAT_LABELS[stat.stat.name] ?? stat.stat.name;

    const value = document.createElement('span');
    value.className = 'stat-value';
    value.textContent = stat.base_stat;

    heading.append(label, value);

    const bar = document.createElement('div');
    bar.className = 'stat-bar';

    const fill = document.createElement('div');
    fill.className = 'stat-fill';

    // 255 is a display scale, not the maximum possible stat.
    const percentage = Math.min(stat.base_stat / 255 * 100, 100);
    fill.style.width = `${percentage}%`;

    bar.appendChild(fill);
    item.append(heading, bar);

    return item;
}

function createPokemonCard(pokemon) {
    const card = document.createElement('article');
    card.className = 'pokemon-card';

    const firstType = pokemon.types[0]?.type.name ?? 'normal';
    const typeColor = TYPE_COLORS[firstType] ?? '#65d8ff';

    card.style.setProperty('--type-color', typeColor);

    const info = document.createElement('div');
    info.className = 'pokemon-info';

    const number = document.createElement('span');
    number.className = 'pokemon-number';
    number.textContent = `NO. ${String(pokemon.id).padStart(3, '0')}`;

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

    const typeName = typeInfo.type.name;

    // Give each type tag its own color.
    const badgeColor = TYPE_COLORS[typeName] ?? '#65d8ff';
    badge.style.setProperty('--badge-color', badgeColor);

    badge.textContent =
        typeName.charAt(0).toUpperCase() + typeName.slice(1);

    types.appendChild(badge);
});


    const details = document.createElement('div');
    details.className = 'pokemon-details';

    details.append(
        createDetail('HEIGHT', `${(pokemon.height / 10).toFixed(1)} m`),
        createDetail('WEIGHT', `${(pokemon.weight / 10).toFixed(1)} kg`)
    );

    // Display every base stat with a visual bar.
    const stats = document.createElement('div');
    stats.className = 'pokemon-stats';

    pokemon.stats.forEach(stat => {
        stats.appendChild(createStatBar(stat));
    });

    info.append(number, name, region, types, details, stats);

    const image = document.createElement('img');
    image.className = 'pokemon-image';
    image.alt = `Artwork of ${pokemon.name}`;
    image.loading = 'lazy';

    image.src =
        pokemon.sprites.other['official-artwork']?.front_default
        || pokemon.sprites.front_default
        || '';

    if (!image.src) {
        image.alt = `Image unavailable for ${pokemon.name}`;
    }

    card.append(info, image);

    return card;
}

function updatePagination() {
    const currentPage = Math.floor(offset / POKEMON_PER_PAGE) + 1;
    const totalPages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);

    pageNumber.textContent = `PAGE ${currentPage} / ${totalPages}`;
    pageIndicator.value = currentPage;
    pageIndicator.max = totalPages;
    pageIndicator.disabled = isSearchMode;

    previousButton.disabled = isSearchMode || offset === 0;
    nextButton.disabled =
        isSearchMode || offset + POKEMON_PER_PAGE >= totalPokemon;

    firstPageButton.disabled = isSearchMode || currentPage === 1;
    lastPageButton.disabled = isSearchMode || currentPage === totalPages;
}

async function fetchPokemonDetails(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to retrieve Pokémon details.');
    }

    return response.json();
}

async function loadPokemon() {
    if (isLoading) return;

    isLoading = true;
    previousButton.disabled = true;
    nextButton.disabled = true;

    pokemonList.replaceChildren();
    errorMessage.textContent = '';

    const loading = document.createElement('p');
    loading.className = 'loading';
    loading.textContent = groupByFamilies
        ? 'Organizing evolution families...'
        : 'Loading Pokémon...';

    pokemonList.appendChild(loading);

    try {
        let pokemonUrls = [];
        let pokemonIds = [];

        if (groupByFamilies) {
            const orderedIds = await buildEvolutionOrder();

            pokemonIds = orderedIds.slice(
                offset,
                offset + POKEMON_PER_PAGE
            );

            pokemonUrls = pokemonIds.map(
                id => `${API_URL}/${id}`
            );
        } else {
            const response = await fetch(
                `${API_URL}?limit=${POKEMON_PER_PAGE}&offset=${offset}`
            );

            if (!response.ok) {
                throw new Error('Failed to retrieve the Pokémon list.');
            }

            const data = await response.json();

            totalPokemon = data.count;
            pokemonUrls = data.results.map(pokemon => pokemon.url);
        }

        const pokemonDetails = await Promise.all(
            pokemonUrls.map(url => fetchPokemonDetails(url))
        );

        pokemonList.replaceChildren();

        pokemonDetails.forEach(pokemon => {
            pokemonList.appendChild(createPokemonCard(pokemon));
        });

        isSearchMode = false;

        const currentPage = Math.floor(offset / POKEMON_PER_PAGE) + 1;
        const totalPages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);

        pageNumber.textContent = `PAGE ${currentPage} / ${totalPages}`;

        const firstId = pokemonDetails[0]?.id ?? 0;
        const lastId = pokemonDetails[pokemonDetails.length - 1]?.id ?? 0;

        resultCount.textContent = groupByFamilies
            ? `Pokémon: ${offset + 1}–${offset + pokemonDetails.length} / ${totalPokemon}`
            : `Pokémon: ${firstId}–${lastId} / ${totalPokemon}`;

        updatePagination();

    } catch (error) {
        console.error(error);

        pokemonList.replaceChildren();

        errorMessage.textContent =
            'Unable to load Pokémon. Check your connection and try again.';

    } finally {
        isLoading = false;
        updatePagination();
    }
}

async function searchPokemon(query) {
    if (isLoading) return;

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        isSearchMode = false;
        offset = 0;
        loadPokemon();
        return;
    }

    isLoading = true;
    previousButton.disabled = true;
    nextButton.disabled = true;
    firstPageButton.disabled = true;
    lastPageButton.disabled = true;

    pokemonList.replaceChildren();
    errorMessage.textContent = '';

    const loading = document.createElement('p');
    loading.className = 'loading';
    loading.textContent = 'Searching Pokémon...';
    pokemonList.appendChild(loading);

    try {
        // The API accepts a Pokémon name or national ID.
        const pokemon = await fetchPokemonDetails(
            `${API_URL}/${encodeURIComponent(normalizedQuery)}`
        );

        pokemonList.replaceChildren();
        pokemonList.appendChild(createPokemonCard(pokemon));

        isSearchMode = true;

        pageNumber.textContent = 'SEARCH RESULT';
        pageIndicator.value = '';
        pageIndicator.disabled = true;

        resultCount.textContent = 'Pokémon found: 1';

    } catch (error) {
        console.error(error);

        pokemonList.replaceChildren();
        errorMessage.textContent =
            'Pokémon not found. Try an English name or Pokédex number.';

        isSearchMode = true;
        pageNumber.textContent = 'NO RESULTS';
        pageIndicator.value = '';
        pageIndicator.disabled = true;
        resultCount.textContent = 'Pokémon found: 0';

    } finally {
        isLoading = false;
        previousButton.disabled = true;
        nextButton.disabled = true;
        firstPageButton.disabled = true;
        lastPageButton.disabled = true;
    }
}

searchForm.addEventListener('submit', event => {
    event.preventDefault();
    searchPokemon(searchInput.value);
});

clearSearchButton.addEventListener('click', () => {
    if (isLoading) return;

    searchInput.value = '';
    isSearchMode = false;
    offset = 0;
    loadPokemon();
});


pageIndicator.addEventListener('change', () => {
    if (isLoading || isSearchMode) return;

    const totalPages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);
    const requestedPage = Number(pageIndicator.value);

    // Ignore invalid page numbers.
    if (!Number.isInteger(requestedPage) || requestedPage < 1) {
        pageIndicator.value = Math.floor(offset / POKEMON_PER_PAGE) + 1;
        return;
    }

    // Keep the requested page within the available range.
    const targetPage = Math.min(requestedPage, totalPages);

    offset = (targetPage - 1) * POKEMON_PER_PAGE;

    loadPokemon();
});

nextButton.addEventListener('click', () => {
    if (isLoading || offset + POKEMON_PER_PAGE >= totalPokemon) {
        return;
    }

    offset += POKEMON_PER_PAGE;
    loadPokemon();
});

previousButton.addEventListener('click', () => {
    if (isLoading || offset === 0) return;

    offset -= POKEMON_PER_PAGE;
    loadPokemon();
});

firstPageButton.addEventListener('click', () => {
    if (isLoading || isSearchMode || offset === 0) return;

    offset = 0;
    loadPokemon();
});

lastPageButton.addEventListener('click', () => {
    if (isLoading || isSearchMode) return;

    const totalPages = Math.ceil(totalPokemon / POKEMON_PER_PAGE);

    offset = (totalPages - 1) * POKEMON_PER_PAGE;
    loadPokemon();
});

groupFamiliesCheckbox.addEventListener('change', async () => {
    if (isLoading) {
        groupFamiliesCheckbox.checked = groupByFamilies;
        return;
    }

    groupByFamilies = groupFamiliesCheckbox.checked;
    offset = 0;
    isSearchMode = false;

    await loadPokemon();
});

loadPokemon();
