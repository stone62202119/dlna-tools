const dgram = require('dgram'),
      serverMap = {},
      ssdpPort = 1900,
      eventPort = 7900,
      http = require('http'),
      util = require('./util'),
      fs = require('fs'),
      ip = '239.255.255.250',
      searchData = [
          'M-SEARCH * HTTP/1.1',  
          'Host: 239.255.255.250:1900',  
          'Man: "ssdp:discover"',  
          'Mx: 600',  
          'ST: urn:schemas-upnp-org:service:AVTransport:1',
          '\r\n'
      ];

let socket;
exports.start = ()=>{
    load('./device.text');
    socket = dgram.createSocket('udp4');
    
    socket.on('message',(buff,rinfo)=>{
        var msg = buff.toString();
        //console.log(msg);
        if(msg.indexOf('M-SEARCH') == 0) return; //不回应search信息
        parseServer(msg,(info)=>{
            serverMap[info.uuid] = info;
            console.log('服务节点名：',info.device.friendlyName);
        })
        console.log('ip:' + rinfo.address + ',port:'+rinfo.port);
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
        if(err.code != 'EADDRINUSE')socket.close();
    });
    socket.on('listening', () => {
        const address = socket.address();
        console.log(`服务器监听 ${address.address}:${address.port}`);
    });
    
    /*socket.bind(ssdpPort,()=>{
        console.log('绑定1900成功！');
        socket.addMembership(ip);
    })*/
    socket.send(searchData.join('\r\n'),ssdpPort,ip,(err)=>{
        if(err){
            console.log('send error');
            return;
        }
    });
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
function load(path){
    if(fs.existsSync(path))fs.readFile(path,'utf-8',(err,data)=>{
        if (err) throw err;
        var deviceLists = JSON.parse(data),
            uuid;
        for(uuid in deviceLists){
            serverMap[uuid] = deviceLists[uuid];
        }
    })
}
exports.parseServer = parseServer;
function parseServer(str,cb){
    var msg = util.strToMsg(str),
        serverflag = 'urn:schemas-upnp-org:service:AVTransport:1',
        ALIVE = 'ssdp:alive',
        key,
        serverUrl = msg.location;
    //console.log(msg);
    key = msg.uuid = msg.usn.split('::')[0].split(':')[1];
    
    if((msg.st == serverflag || msg.nt == serverflag) && serverMap[key] == null){
        if(serverUrl == null){
          console.log(msg);
          return;
        }
        serverMap[key] = msg;
        //console.log('发现服务地址：'+ serverUrl);
        http.get(serverUrl,{timeout:1000},(rs)=>{
            util.parseXML(rs,(xml)=>{
                var device = xml.root.device,
                    serviceList = device.sericeList && serviceList.service;
                console.log('服务设备：',device.friendlyName);
                if(serviceList){
                    console.log('提供服务：');
                    sericeList.map(function(service){
                       console.log(service.serviceType);
                    })
                }
                //播放国歌
                msg.device = device;
                msg.baseUrl = util.baseUrl(serverUrl);
                cb(msg);
            });
        }).on('error', (e) => {
         console.error(`请求${serverUrl}失败: ${e.message}`);
        });
       // console.log(msg);
    }else if (msg.type == 'nt' && msg.nts != ALIVE && serverMap[key] != null){
        delete serverMap[key];
    }
 }
 exports.parseContrl = (str,cb)=>{
     var msg = strToMsg(str);
     cb(msg);
 }
 exports.getServers=()=>{
     return serverMap;
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