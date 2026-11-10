const readline = require('node:readline');

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

terminal.question('Écris un message : ', (reponse) => {
  console.log('Tu as écrit :', reponse);
  terminal.close();
});