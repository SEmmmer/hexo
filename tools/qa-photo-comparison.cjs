// Run after npm run build, then open the printed loopback URL in a real browser.
// Exercises generated Hexo pages; it does not automate or launch a browser.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { createHash } = require('node:crypto');
const cheerio = require('cheerio');

const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'public');
const articles = JSON.parse(fs.readFileSync(path.join(root, 'source/_data/photo_comparisons.json'), 'utf8'));
const samples = {};
for (const [slug, article] of Object.entries(articles)) {
  samples[slug] = fs.readFileSync(path.join(publicRoot, article.route, 'index.html'), 'utf8');
}
const $ = cheerio.load(Object.values(samples).at(-1));
const template = $('.photo-comparison[data-comparison-src]').first().clone();
$('.article-entry').empty();
$('header,aside,footer,.article-nav,.article-meta,.mobile-nav').remove();
const svg = (width, height, label) => 'data:image/svg+xml;base64,' + Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#dceadc"/><rect x="8" y="8" width="${width - 16}" height="${height - 16}" fill="none" stroke="#456" stroke-width="8"/><text x="30" y="60" font-size="32">${label}</text></svg>`
).toString('base64');
for (const [id, edited, raw] of [['portrait', [600, 900], [1200, 800]], ['landscape', [1200, 800], [600, 900]], ['page-end', [600, 900], [1200, 800]]]) {
  const figure = template.clone().attr('id', id);
  const editedSrc = svg(...edited, `EDITED ${id}`), originalSrc = svg(...raw, `RAW ${id}`);
  figure.attr({ 'data-comparison-src': originalSrc, 'data-comparison-srcset': '', 'data-comparison-width': raw[0], 'data-comparison-height': raw[1], 'data-comparison-original': originalSrc, 'data-comparison-label': '原片 · NEF 内嵌 JPEG · 完整画幅与机内呈色' });
  figure.find('.photo-frame').attr('style', `--photo-ratio: ${edited[0]} / ${edited[1]}`);
  figure.find('img').removeAttr('srcset sizes').attr({ id: `${id}-image`, src: editedSrc, width: edited[0], height: edited[1], 'data-original-src': editedSrc });
  figure.find('.photo-frame a').attr('href', editedSrc);
  figure.find('button').attr({ 'aria-controls': `${id}-image`, 'aria-describedby': `${id}-state` });
  figure.find('.photo-state').attr('id', `${id}-state`);
  figure.find('.photo-caption').text('合成图，仅用于横竖幅与页尾布局检查。');
  $('.article-entry').append(figure);
}
samples.synthetic = $.html();
const fingerprints = Object.fromEntries(['js/photo-comparison.js', 'css/photo-comparison.css'].map(file => [file,
  createHash('sha256').update(fs.readFileSync(path.join(publicRoot, file))).digest('hex')]));

const dashboard = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>Hexo 原片切换验收</title>
<style>body{font:14px/1.6 system-ui;margin:16px}button{padding:9px 14px;margin-right:8px}pre{white-space:pre-wrap}iframe{border:1px solid #aaa}#viewport{overflow:auto}</style>
<h1>Hexo 原片切换验收</h1><p>使用生成的三个月真实文章，以及横竖幅合成图。浏览器测量按钮、滚动、页高与焦点。</p>
<button id="run">运行全部检查</button><button id="manual">窄屏键盘检查</button><pre id="summary">待检查</pre><details><summary>完整结果</summary><pre id="results"></pre></details>
<div id="viewport"><iframe title="切换测试窗口" id="sample" width="390" height="844"></iframe></div>
<script>
const samples=${JSON.stringify(samples).replace(/</g, '\\u003c')};
const frame=document.getElementById('sample'),summary=document.getElementById('summary'),output=document.getElementById('results');
const paint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
async function until(condition){const start=Date.now();while(!condition()){if(Date.now()-start>20000)throw Error('Timed out');await paint()}}
async function load(name,width,height){
 frame.width=width;frame.height=height;
 const html=samples[name].replace('<head>','<head><base href="'+location.origin+'/hexo/">');
 const loaded=new Promise(resolve=>frame.onload=resolve);frame.srcdoc=html;await loaded;
 const win=frame.contentWindow;
 await until(()=>win.document.querySelector('.photo-comparison[data-comparison-src] button:not([hidden])'));
 await win.document.fonts.ready;
 await Promise.all([...win.document.querySelectorAll('.article-entry img')].map(async img=>{img.loading='eager';await img.decode()}));
 await paint();return win;
}
function snapshot(win,button){const r=button.getBoundingClientRect(),f=button.closest('figure').querySelector('.photo-frame').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,scroll:win.scrollY,pageHeight:win.document.documentElement.scrollHeight,frameWidth:f.width,frameHeight:f.height,focused:win.document.activeElement===button}}
const keys=['x','y','width','height','scroll','pageHeight','frameWidth','frameHeight'];
function stable(a,b){return keys.every(key=>Math.abs(a[key]-b[key])<=0.5)&&b.focused}
function editedState(figure){const img=figure.querySelector('img'),link=img.parentElement,exp=figure.querySelector('.photo-exposure');return JSON.stringify({attributes:['src','srcset','sizes','width','height','alt','data-original-src'].map(k=>[k,img.getAttribute(k)]),href:link.getAttribute('href'),caption:link.getAttribute('data-caption'),parameters:exp.innerText.trim(),title:exp.getAttribute('title')})}
async function check(){
 document.getElementById('run').disabled=true;document.getElementById('manual').disabled=true;
 const results=[];
 try{
  for(const [width,height] of [[1040,900],[390,844],[320,568]]){
   for(const name of Object.keys(samples)){
    summary.textContent='正在检查 '+name+' · '+width+' × '+height;
    const win=await load(name,width,height),figures=[...win.document.querySelectorAll('.photo-comparison[data-comparison-src]')];
    for(const [index,figure] of figures.entries()){
     const button=figure.querySelector('button'),img=figure.querySelector('img'),link=img.parentElement;
     button.scrollIntoView({block:'center'});if(index===figures.length-1)win.scrollTo(0,win.document.documentElement.scrollHeight);
     button.focus({preventScroll:true});await paint();
     const before=snapshot(win,button),edited=editedState(figure),states=[];let passed=true;
     for(let cycle=0;cycle<3;cycle++){
      button.click();const pending=snapshot(win,button);if(button.getAttribute('aria-busy')==='true')button.click();
      await until(()=>button.getAttribute('aria-pressed')==='true');await img.decode();await paint();const raw=snapshot(win,button);
      passed=passed&&stable(before,pending)&&stable(before,raw)&&!button.disabled&&win.getComputedStyle(img).objectFit==='contain'&&img.getAttribute('width')===figure.dataset.comparisonWidth&&img.getAttribute('height')===figure.dataset.comparisonHeight&&link.getAttribute('href')===figure.dataset.comparisonOriginal&&!figure.querySelector('.photo-exposure').innerText.includes('cropped to');
      button.click();await until(()=>button.getAttribute('aria-pressed')==='false');await paint();const restored=snapshot(win,button);
      passed=passed&&stable(before,restored)&&editedState(figure)===edited;states.push({pending,raw,restored});
     }
     results.push({sample:name,viewport:[width,height],id:figure.id,passed,before,states});
    }
   }
   const win=await load('synthetic',width,height),figure=win.document.querySelector('.photo-comparison'),button=figure.querySelector('button');
   const source=figure.dataset.comparisonSrc,edited=editedState(figure);
   figure.dataset.comparisonSrc='data:image/jpeg;base64,broken';figure.dataset.comparisonSrcset='';
   button.scrollIntoView({block:'center'});button.focus({preventScroll:true});await paint();const before=snapshot(win,button);
   button.click();await until(()=>button.textContent==='重试加载');await paint();const failed=snapshot(win,button),preserved=editedState(figure)===edited;
   figure.dataset.comparisonSrc=source;button.click();await until(()=>button.getAttribute('aria-pressed')==='true');await paint();const retry=snapshot(win,button);
   results.push({sample:'synthetic',viewport:[width,height],id:'failure-and-retry',passed:stable(before,failed)&&stable(before,retry)&&preserved,before,states:[{failed,retry}]});
  }
  const deltas=results.flatMap(r=>r.states.flatMap(s=>Object.values(s).map(state=>Object.fromEntries(keys.map(key=>[key,Math.abs(state[key]-r.before[key])])))));
  const report={at:new Date().toISOString(),browser:navigator.userAgent,passed:results.filter(r=>r.passed).length,total:results.length,maxDelta:Object.fromEntries(keys.map(key=>[key,Math.max(...deltas.map(d=>d[key]))])),results};
  output.textContent=JSON.stringify(report,null,2);summary.textContent=report.passed+'/'+report.total+' 通过';
  await fetch('/results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)});
 }catch(error){summary.textContent='检查失败：'+error.message;output.textContent=JSON.stringify(results,null,2)}
 finally{document.getElementById('run').disabled=false;document.getElementById('manual').disabled=false}
}
document.getElementById('run').onclick=check;
document.getElementById('manual').onclick=async()=>{const name=Object.keys(samples).find(s=>s.includes('august'));const win=await load(name,390,844),button=win.document.querySelectorAll('.photo-toggle')[1];button.scrollIntoView({block:'center'});button.focus({preventScroll:true});await paint();summary.textContent='窄屏键盘检查已就绪';output.textContent=JSON.stringify(snapshot(win,button),null,2)};
</script></html>`;

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (request.method === 'POST' && pathname === '/results') {
      let body = '';
      for await (const chunk of request) { body += chunk; if (body.length > 2000000) throw Error('Oversized result'); }
      const report = { ...JSON.parse(body), sourceSha256: fingerprints };
      fs.mkdirSync(path.join(root, '.cache'), { recursive: true });
      fs.writeFileSync(path.join(root, '.cache/photo-comparison-validation.json'), JSON.stringify(report, null, 2));
      response.writeHead(200); response.end('Saved'); return;
    }
    if (request.method !== 'GET') { response.writeHead(405); response.end(); return; }
    if (pathname === '/') { response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); response.end(dashboard); return; }
    if (!pathname.startsWith('/hexo/')) throw Error('Unknown route');
    let file = path.resolve(publicRoot, pathname.slice('/hexo/'.length));
    const relative = path.relative(publicRoot, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw Error('Invalid path');
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    response.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(response);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.listen(0, '127.0.0.1', () => console.log(`http://127.0.0.1:${server.address().port}/`));
