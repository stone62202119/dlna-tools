

const http = require('http'),
      fs = require('fs'),
      {getIP}=require('./util');

let server;
let mp3Url;
exports.start = (cb)=>{
    cb = cb || function(){};
    server = http.createServer((req, res) => {
        let mp3 = './static/guoge.mp3';
        let stat = fs.statSync(mp3);
        res.writeHead(200,{'Content-Type':'audio/mpeg',    'Content-Length':stat.size
        });
        fs.createReadStream(mp3).pipe(res);
        //res.end();
    });
    server.listen('1234',()=>{
        var info = server.address();
        mp3Url = getIP() + ':' + info.port;
        console.log('MP3服务器启动:'+ mp3Url);
        cb(mp3Url);
    });
}
exports.stop = ()=>{
    if(server)server.stop();
}
exports.getUrl = () =>{
    return mp3Url;
}