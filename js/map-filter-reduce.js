const letters = ['a', 'b', 'c'];

letters.map((letter) => {`${letter}1`});

const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 }]

console.log(users.map(user => user.name)) // ['Alice', 'Bob']


const prices = ['10.68€', '52.3€', '11.2€'];

console.log(prices.map(price => Math.round(parseFloat(price) * 0.85 )))