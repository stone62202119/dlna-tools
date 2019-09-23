const dgram = require('dgram'),
      serverMap = {},
      ssdpPort = 1900,
      eventPort = 7900,
      {parseServer,getServers} = require('./dlanParse'),
      http = require('http'),
      ip = '239.255.255.250',
      searchData = [
          'M-SEARCH * HTTP/1.1',  
          'Host: 239.255.255.250:1900',  
          'Man: "ssdp:discover"',  
          'Mx: 600',  
          'ST: upnp:rootdevice',
          '\r\n'
      ];

let socket;
exports.start = ()=>{
    socket = dgram.createSocket('udp4');
    socket.bind(ssdpPort,()=>{
        console.log('解析服务已经启动！');
        socket.addMembership(ip);
    });
    socket.on('message',(buff,rinfo)=>{
        var msg = buff.toString();
        if(msg.indexOf('M-SEARCH') == 0) return;
        parseServer(msg,(info)=>{
            serverMap[info.uuid] = info;
            console.log('服务节点名：',info.device.friendlyName);
        })
        console.log('ip:' + rinfo.address);
        /*else if(strmsg.indexOf('M-SEARCH') == 0){
            parseContrl(strmsg,(node)=>{
               console.log(['来自',rinfo.address,'的',node['user-agent'],'搜索',node.st].join(''));
            })
        }else {
            console.log('----------------------------');
            console.log(strmsg);
            console.log(['port:',rinfo.port,',ip:',rinfo.address].join(''));   
        }*/
    })
    socket.on('error',(err)=>{
        console.log('err:',err.message)
        socket.close();
    })
    socket.send(searchData.join('\r\n'),ssdpPort,ip);
}
exports.stop = ()=>{
    if(socket)socket.stop();
}
exports.getDevices=()=>{
    return serverMap;
}
function eventTest(){
    var eventSock = dgram.createSocket('udp4');
    eventSock.bind(eventPort,()=>{
        eventSock.addMembership(ip);
    });
    eventSock.on('message',(buff,rinfo)=>{
        var msg = buff.toString();
        if(msg.indexOf('M-SEARCH') == 0) return;
        console.log(msg);
        console.log('ip:' + rinfo.address);
    })
}
if(__filename == process.argv[1])exports.start();
/*var rq = http.request({
    hostname: '192.168.1.10',
    port: 2869,
    timeout:1000,
    method: 'SUBSCRIBE',
    headers:{
        'NT':'upnp:event',
        'CALLBACK':'/test'
    },
    path:'/upnphost/udhisapi.dll?event=uuid:3a7d726f-27fe-41d4-9c21-798a2e78d379+urn:upnp-org:serviceId:ConnectionManager'
},(res)=>{
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
          console.log(rawData);
        } catch (e) {
           console.error(e.message);
        }
    });
});
rq.end();*/