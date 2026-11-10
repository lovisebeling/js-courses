const books = [
{ title: 'Dune', pages: 704, price: 12 },
{ title: 'Fondation', pages: 256, price: 9 },
{ title: 'Ubik', pages: 288, price: 8 },
{ title: 'Hyperion', pages: 512, price: 14 },
{ title: 'Solaris', pages: 224, price: 7 },
]

let text = '';
for (let i = 0; i < books.length; i++) {
    text +=books[i].title.toUpperCase() + ', ';
}
console.log(text.slice(0, -2));

 text = '';
for (let i = 0; i < books.length; i++) {
    if (books[i].pages < 300){
        text += `${books[i].title} - ${books[i].pages} pages \n`;
    }
}
console.log(text);

let price = 0;
for (let i = 0; i < books.length; i++) {
    if (books[i].price < 300){
        price += books[i].price;
    }
}
console.log(`Total: ${price}euros`);
