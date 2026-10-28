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
// Every page: the lavagna (index.html + one page per project), Code (forma.html) and About (info.html)
const read=f=>fs.readFileSync('dist/'+f,'utf8');
const pages=['index.html','forma.html','info.html',...context.items.map(p=>p.id+'.html')];
for(const page of pages){
  if(!fs.existsSync('dist/'+page))throw Error('Missing dist/'+page);
  const html=read(page);
  const csp=/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html);
  if(!csp)throw Error('Missing Content-Security-Policy meta tag in dist/'+page);
  for(const rule of ["default-src 'none'","script-src 'self'","object-src 'none'","base-uri 'none'","form-action 'none'"])if(!csp[1].includes(rule))throw Error(page+': CSP must contain '+rule);
  if(/<script(?![^>]*\ssrc=)[^>]*>/i.test(html))throw Error(page+': inline <script> blocks are not allowed (CSP script-src self)');
  const loads=[...html.matchAll(/<script\b[^>]*>|<link\b[^>]*rel="(?:stylesheet|preload|modulepreload|prefetch|icon)"[^>]*>/gi)].map(m=>m[0]);
  const external=loads.filter(tag=>/(?:src|href)="(?:https?:)?\/\//i.test(tag));
  if(external.length)throw Error(page+': third-party scripts or stylesheets are not allowed: '+external.join(' '));
  // every local file the page loads or shows must exist
  for(const m of html.matchAll(/(?:src|href|data-large)="([^"#?:]+\.(?:webp|js|css|woff2|svg|pdf|mp4))"/g))if(!fs.existsSync('dist/'+m[1]))throw Error(page+': missing dist/'+m[1]);
  for(const m of html.matchAll(/target="_blank"[^>]*/g))if(!/rel="noopener noreferrer"/.test(m[0]))throw Error(page+': target=_blank link without rel="noopener noreferrer"');
  for(const m of html.matchAll(/srcset="([^"]+)"/g))for(const part of m[1].split(','))if(!fs.existsSync('dist/'+part.trim().split(' ')[0]))throw Error(page+': missing dist/'+part.trim().split(' ')[0]);
}
for(const f of ['data.js','dims.js','routes.js','lang.js','intro.js','views.js','case.js','forma.js','about.js','motion.js']){const s=read(f);if(/\beval\s*\(|new\s+Function\s*\(|document\.write\s*\(/.test(s))throw Error('Unsafe dynamic code in dist/'+f)}
// 404: no scripts at all, CSP present, local files and links exist
{const nf=read('404.html');
 if(!/<meta http-equiv="Content-Security-Policy"/.test(nf))throw Error('Missing Content-Security-Policy meta tag in dist/404.html');
 if(/<script\b/i.test(nf))throw Error('dist/404.html must not load scripts');
 for(const m of nf.matchAll(/(?:src|href)="([^"#?:]+\.(?:css|svg|html))"/g))if(!fs.existsSync('dist/'+m[1]))throw Error('404.html: missing dist/'+m[1]);}
// the board's largest image is the first drawing: preload it
const home=read('index.html');
const pre=/<link rel="preload" as="image" href="img\/([\w-]+)\.webp"/.exec(home);
const firstDrawing=/<li data-d="[^"]+" class="work[^"]*"[^>]*><a[^>]*>\s*<span class="draw">(?:<img class="under[^>]*>)*<img class="line" src="img\/([\w-]+)\.webp"/.exec(home);   // i fogli della pila stanno prima del disegno principale
if(!pre||!firstDrawing||pre[1]!==firstDrawing[1])throw Error('The LCP preload in index.html must match the first drawing on the board');
// lavagna images (black-and-white drawings and atlas details): no orphans
const lav=pages.map(read).join('\n');
const orphans=fs.readdirSync('dist/img').filter(f=>!lav.includes('img/'+f));
if(orphans.length)throw Error('Unused files in dist/img: '+orphans.join(', '));
console.log(`Security rules passed on ${pages.length} pages: CSP present, no inline or third-party scripts, no eval, safe external links, no missing or unused lavagna images.`);
