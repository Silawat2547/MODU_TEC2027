const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
http.createServer((req,res)=>{
  let decoded;
  try {decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400);res.end();return;}
  const target=path.resolve(root,'.'+(decoded==='/'?'/index.html':decoded));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(target,(error,data)=>{if(error){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8'})[path.extname(target)]||'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(data);
  });
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
