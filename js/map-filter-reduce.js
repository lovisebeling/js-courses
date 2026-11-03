const letters = ['a', 'b', 'c', 'd', 'e'];
const vovels = ['a', 'e', 'i', 'o', 'u'];

console.log(letters.filter(letter => vovels.includes(letter)));

console.log(letters.map((letter) => `${letter}1`));

const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 }]

console.log(users.map(user => user.name)) // ['Alice', 'Bob']


const prices = ['10.68€', '52.3€', '11.2€'];

console.log(prices.map(price =>`${(price.replace('€', '') * 0.85 ).toFixed(2)}€`));