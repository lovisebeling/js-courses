
const ditto_url = 'https://pokeapi.co/api/v2/pokemon/ditto';

fetch(ditto_url)
    .then(response => response.json())
    .then(json_response => console.log(json_response))
    .then(ditto => {
        document.querySelector('#height').textContent = ditto.height;})

        console.log(json_response.height)