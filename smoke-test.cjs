// Logic-level checks with a minimal DOM stub; this is NOT a browser layout test.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const nodes=new Map(),events={};
function node(selector){if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',value:'',open:false,dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(type,fn){this[type]=fn;},showModal(){this.open=true;},close(){this.open=false;},scrollIntoView(){},setAttribute(){},appendChild(){},click(){},remove(){}});return nodes.get(selector);}
let storage={};
const ctx=vm.createContext({console,Date,Math,JSON,Number,String,Object,Array,Set,Blob,URL,setTimeout:()=>0,clearTimeout(){},location:{hash:''},localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},document:{querySelector:node,querySelectorAll:()=>[],addEventListener:(e,f)=>events[e]=f,createElement:()=>node('anchor'),body:node('body')},window:{scrollTo(){},addEventListener(){}},FormData:class{constructor(f){this.data=f.data||{};}[Symbol.iterator](){return Object.entries(this.data)[Symbol.iterator]();}}});
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
function click(action,id){events.click({target:{closest:()=>({dataset:{action,id},classList:{toggle(){}},setAttribute(){}})}});}
function submit(id,productId,data){events.submit({preventDefault(){},target:{id,dataset:{id:productId},data,reportValidity:()=>true}});}
assert(node('#product-grid').innerHTML.includes('Small Shop Finance Kit'));assert.equal(run('allProducts().length'),9);
run("filters.query='ต้นทุน';renderGrid()");assert(node('#product-grid').innerHTML.includes('Small Shop'));assert(!node('#product-grid').innerHTML.includes('Study With'));
click('clear');click('save','cost');assert.equal(run('state.wishlist[0]'),'cost');
click('custom','cost');assert(node('#modal-body').innerHTML.includes('ทดลองซื้อสินค้านี้'));
submit('checkout-form','cost',{});assert.equal(run('state.owned.length'),1);
submit('checkout-form','cost',{});assert.equal(run('state.owned.length'),1);
submit('custom-form','cost',{title:'Dashboard for two stores',brief:'Compare daily revenue and costs for two separate stores',budget:'2000',deadline:'2099-12-31',format:'Excel'});
assert.equal(run('state.requests.length'),1);assert.equal(run('state.requests[0].sellerId'),'studio');
const req=run('state.requests[0].id');
submit('quote-form',req,{price:'1800',days:'7',scope:'Create two-store dashboard with daily revenue and cost charts',revisions:'2'});assert.equal(run('state.requests[0].status'),'quoted');
click('accept',req);assert(node('#modal-body').innerHTML.includes('1,800'));click('confirm-accept',req);assert.equal(run('state.requests[0].status'),'working');
submit('delivery-form',req,{delivery:'Dashboard demonstration completed with two stores and daily summaries'});assert.equal(run('state.requests[0].status'),'delivered');click('complete',req);assert.equal(run('state.requests[0].status'),'completed');
click('confirm-accept',req);assert.equal(run('state.requests[0].status'),'completed');
run("studioSeller='paper';studioTab='requests'");assert(!run('studio()').includes('Dashboard for two stores'));
submit('product-form','',{title:'<img src=x onerror=alert(1)>',desc:'A sample new product description',price:'320',category:'ธุรกิจ',format:'Excel',includes:'One sample file\nOne guide'});assert.equal(run('state.listings.length'),1);assert(run('card(state.listings[0])').includes('&lt;img'));assert(!run('card(state.listings[0])').includes('<img src=x'));
submit('review-form','cost',{rating:'5',text:'Useful demo product'});assert.equal(run('state.reviews.cost.rating'),5);
assert.equal(JSON.parse(storage['modu-marketplace-v1']).requests[0].status,'completed');
run("filters={category:'ทั้งหมด',query:'',sort:'low',format:'Excel',price:'500',saved:false};renderGrid()");assert(!node('#product-grid').innerHTML.includes('Freelance Command Center'));
console.log('PASS: 19 assertions — catalog/search, purchase gate, duplicate purchase, request routing, quote, accept, delivery, completion, invalid transition, seller isolation, escaping, reviews, persistence, filters.');
