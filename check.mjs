import fs from 'node:fs';
import vm from 'node:vm';
const code=fs.readFileSync('dist/data.js','utf8');
const context={};vm.createContext(context);vm.runInContext(code+';globalThis.items=projects;',context);
const ids=new Set();let images=0;
for(const p of context.items){if(ids.has(p.id))throw Error('Duplicate project '+p.id);ids.add(p.id);for(const key of ['type','subtitle','intro','meta','text'])for(const lang of ['it','en'])if(!p[key][lang])throw Error('Missing translation '+p.id+' '+key);for(const name of [p.cover,...p.gallery]){if(!fs.existsSync('dist/assets/'+name+'.webp'))throw Error('Missing '+name);images++;}if(!fs.existsSync('dist/assets/'+p.cover+'-sm.webp'))throw Error('Missing thumbnail '+p.cover);}
console.log(`Validated ${ids.size} projects, bilingual content and ${images} image references.`);
