const fs = require('fs');
const path = 'components/myComponents/subs/featuredCategories.tsx';
const full = fs.readFileSync(path,'utf8').split('\n');
for(let i=0;i<full.length;i++){
  if(i>=140 && i<170) console.log(`${i+1}: ${full[i]}`);
}
