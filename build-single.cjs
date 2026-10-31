// Builds a standalone index.html with a prerendered catalog and embedded assets.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=__dirname,template=path.join(root,'index.template.html');
if(!fs.existsSync(template))fs.copyFileSync(path.join(root,'index.html'),template);
const nodes=new Map();
function node(s){if(!nodes.has(s))nodes.set(s,{innerHTML:'',textContent:'',value:'',open:false,classList:{add(){},remove(){},toggle(){}},addEventListener(){},showModal(){},close(){}});return nodes.get(s);}
const js=fs.readFileSync(path.join(root,'app.js'),'utf8');
const ctx=vm.createContext({console,Date,Math,JSON,Number,String,Object,Array,Set,setTimeout(){},clearTimeout(){},location:{hash:''},localStorage:{getItem(){return null},setItem(){}},document:{querySelector:node,querySelectorAll(){return[]},addEventListener(){}},window:{addEventListener(){},scrollTo(){}}});
vm.runInContext(js,ctx);
let main=node('#main').innerHTML.replace('<div class="grid" id="product-grid"></div>',()=>'<div class="grid" id="product-grid">'+node('#product-grid').innerHTML+'</div>').replace('<span id="result-count"></span>','<span id="result-count">9 เครื่องมือ</span>');
const css=fs.readFileSync(path.join(root,'styles.css'),'utf8').replace(/^@import[^;]+;\s*/, '');
const warning='<div id="startup-warning" style="display:none;padding:16px;background:#fff3cd;color:#222" role="alert">โหลดฟังก์ชันไม่สำเร็จ กรุณาดาวน์โหลดไฟล์แล้วเปิด index.html ด้วย Chrome หรือ Edge โดยตรง</div>';
const guard=`<script>window.addEventListener('error',function(){document.getElementById('startup-warning').style.display='block'});<\/script>`;
let html=fs.readFileSync(template,'utf8').replace('<link rel="stylesheet" href="./styles.css"><script defer src="./app.js"></script>',()=>'<style>'+css+'</style>').replace('<main id="main" tabindex="-1"></main>',()=>warning+'<main id="main" tabindex="-1">'+main+'</main><noscript><p style="padding:20px">กรุณาเปิด JavaScript และเปิดไฟล์นี้ใน Chrome หรือ Edge เพื่อทดลองฟังก์ชัน</p></noscript>').replace('</body>',()=>guard+'<script>\n'+js.replace(/<\/script/gi,'<\\/script')+'\n</script></body>');
fs.writeFileSync(path.join(root,'index.html'),html,'utf8');
console.log('Standalone index.html built: '+Buffer.byteLength(html)+' bytes; prerendered cards: '+(main.match(/class="product"/g)||[]).length);
if(/<script[^>]+src=/.test(html)||/<link[^>]+stylesheet/.test(html)||/@import/.test(html))throw Error('External asset dependency remains');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];for(const s of scripts)new vm.Script(s[1]);
console.log('PASS: embedded script syntax; no external scripts/styles/fonts required.');
