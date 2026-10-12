import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('dist/dims.js','utf8')+fs.readFileSync('dist/data.js','utf8')+';globalThis.items=projects;globalThis.forma=forma;',context);
const dims=context.window.IMAGE_DIMS,ids=new Set(),used=new Map();
const use=(name,where)=>{if(used.has(name))throw Error(`Duplicate image ${name}: ${used.get(name)} and ${where}`);used.set(name,where);for(const s of ['','-m','-s'])if(!fs.existsSync(`dist/assets/${name}${s}.webp`))throw Error('Missing dist/assets/'+name+s+'.webp');if(!dims[name])throw Error('Missing dimensions for '+name)};
const both=(x,what)=>{for(const l of ['it','en'])if(!x?.[l])throw Error('Missing translation: '+what)};
for(const p of context.items){
  if(ids.has(p.id))throw Error('Duplicate project '+p.id);ids.add(p.id);
  for(const k of ['type','subtitle','intro','text','question','lens'])both(p[k],p.id+' '+k);
  p.meta.forEach(([a,b])=>{both(a,p.id+' meta');both(b,p.id+' meta')});
  use(p.cover.name,p.id+' cover');both(p.cover.cap,p.cover.name);
  p.chapters.forEach((c,i)=>{both(c.title,p.id+' chapter');both(c.body,p.id+' chapter');use(c.image.name,p.id+' chapter '+(i+1));both(c.image.cap,c.image.name)});
  if(p.compare)for(const k of ['before','after']){use(p.compare[k].name,p.id+' compare');both(p.compare[k].cap,p.compare[k].name)}
  p.gallery.forEach(g=>{use(g.name,p.id+' gallery');both(g.cap,g.name)});
  p.technical.forEach(s=>{use(s.name,p.id+' atlas');both(s.cap,s.name)});
}
use('about-ritratto','about');
for(const f of [context.forma.ai.video,context.forma.ai.poster])if(!fs.existsSync('dist/'+f))throw Error('Missing dist/'+f);both(context.forma.ai.label,'ai label');
vm.runInContext('globalThis.profile=profile;',context);for(const d of context.profile.docs){if(!fs.existsSync('dist/'+d.href))throw Error('Missing dist/'+d.href);both(d.label,d.href);both(d.meta,d.href)}
context.forma.shots.forEach(s=>{use(s.name,'code');both(s.cap,s.name)});
const files=fs.readdirSync('dist/assets').filter(f=>!/-(m|s)\.webp$/.test(f)).map(f=>f.replace('.webp',''));
const unused=files.filter(f=>!used.has(f));if(unused.length)throw Error('Unused assets: '+unused.join(', '));
console.log(`Validated ${ids.size} projects, bilingual content and ${used.size} unique images (no duplicates, no orphans).`);

// Security rules
const html=fs.readFileSync('dist/index.html','utf8');
const csp=/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html);
if(!csp)throw Error('Missing Content-Security-Policy meta tag in dist/index.html');
for(const rule of ["default-src 'none'","script-src 'self'","object-src 'none'","base-uri 'none'","form-action 'none'"])if(!csp[1].includes(rule))throw Error('CSP must contain '+rule);
if(/<script(?![^>]*\ssrc=)[^>]*>/i.test(html))throw Error('Inline <script> blocks are not allowed (CSP script-src self)');
const loads=[...html.matchAll(/<script\b[^>]*>|<link\b[^>]*rel="(?:stylesheet|preload|modulepreload|prefetch|icon)"[^>]*>/gi)].map(m=>m[0]);
const external=loads.filter(tag=>/(?:src|href)="(?:https?:)?\/\//i.test(tag));
if(external.length)throw Error('Third-party scripts or stylesheets are not allowed: '+external.join(' '));
for(const f of ['app.js','data.js','dims.js']){const s=fs.readFileSync('dist/'+f,'utf8');if(/\beval\s*\(|new\s+Function\s*\(|document\.write\s*\(/.test(s))throw Error('Unsafe dynamic code in dist/'+f)}
const app=fs.readFileSync('dist/app.js','utf8');
for(const m of app.matchAll(/target="_blank"[^>]*/g))if(!/rel="noopener noreferrer"/.test(m[0]))throw Error('target=_blank link without rel="noopener noreferrer"');
console.log('Security rules passed: CSP present, no inline or third-party scripts, no eval, safe external links.');
