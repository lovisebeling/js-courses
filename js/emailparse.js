// parser l'adresse mail suivant et separer nom et prenom separement

let mail = "jane.doe@yahoo.com";

let firstname = mail.split(".")[0];
let lastname = mail.split(".")[1].split("@")[0];

console.log(`${firstname} ${lastname}`);