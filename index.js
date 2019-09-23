const dgram = require('dgram'),
      port = 1900,
      {parseServer,parseReponse,parseContrl} = require('./dlanParse'),
      ip = '239.255.255.250',
      http = require('http'),
      fs = require('fs'),
      server = http.createServer((req, res) => {
        let mp3 = './static/guoge.mp3';
        let stat = fs.statSync(mp3);
        res.writeHead(200,{'Content-Type':'audio/mpeg',    'Content-Length':stat.size
        });
        fs.createReadStream(mp3).pipe(res);
        //res.end();
      }),
      {getIP,getXML,getStop}=require('./util'),
      socket = dgram.createSocket('udp4');

let mp3Url = null;
  
server.listen('1234',()=>{
    var info = server.address();
    mp3Url = getIP() + ':' + info.port;
    console.log('MP3服务器启动:'+ mp3Url);
});
socket.bind(port,()=>{
    console.log('解析服务已经启动！');
    socket.addMembership(ip);
})
socket.on('error',(err)=>{
    console.log('err:',err.message)
    socket.close();
})
socket.on('message',(msg,rinfo)=>{
    var strmsg = msg.toString();
    if(strmsg.indexOf('NOTIFY') == 0){
        parseServer(strmsg,(node)=>{
            if(node.manufacturer == 'Xiaomi'){
                console.log('开始放国歌：');
                play(node.contrlUrl);
            }
        });
    } else if(strmsg.indexOf('M-SEARCH') == 0){
        parseContrl(strmsg,(node)=>{
           console.log(['来自',rinfo.address,'的',node['user-agent'],'搜索',node.st].join(''));
        })
    }else {
        console.log('----------------------------');
        console.log(strmsg);
        console.log(['port:',rinfo.port,',ip:',rinfo.address].join(''));   
    }
    
})
function play(contrlUrl){
    var action = "SetAVTransportURI",
        //xml = getStop('http://'+mp3Url,action),
        pic = 'http://pic2.nipic.com/20090506/2256386_141149004_2.jpg',
        xml = getXML('http://'+mp3Url,action),
        req;   

   contrlUrl = contrlUrl += '/_urn:schemas-upnp-org:service:AVTransport_control';
   req = http.request(contrlUrl,{
       method:'POST',
       timeout:30000,
       headers: {
       // 'SOAPACTION': "urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI",
        'SOAPACTION': '"urn:schemas-upnp-org:service:AVTransport:1#' + action + '"',
        'Content-Type': 'text/xml;charset="utf-8"',
        'Content-Length': Buffer.byteLength(xml)
       }
   },(rs)=>{
       parseReponse(rs,(json)=>{
         // console.log(xml);
       })
   });
   req.on('error',function(e){
    console.error(`problem with request: ${e.message}`);
   })
   req.write(xml);
   req.end();
}
