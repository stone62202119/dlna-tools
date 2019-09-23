const {start,stop,getDevices} = require('./search'),
      mp3server = require('./mp3Server'),
      readline = require('readline'),
      rl = readline.createInterface({
        // 调用std接口
        input:process.stdin,
        output:process.stdout
      }),
      http = require('http'),
      {getXML}=require('./util');


mp3server.start();
start();
showMenu();
rl.on('line',(line)=>{
    var cmd,
        cmdTofn = {
            'play':playTest,
            'deviceList':deviceList,
            'menu':showMenu
        },
        cmdList = Object.keys(cmdTofn),
        i =0,
        l = cmdList.length;
    
    for(;i<l;i++){
        cmd = cmdList[i];
        if(line.indexOf(cmd) == 0){
            cmdTofn[cmd](line);
            return 
        }
    }
    console.log('错误的命令！');
})
function playTest(){
    console.log('开始播放：');
}
function showMenu(){
    var cmdList = [
        'play  播放mp3',
        'deviceList 列出设备信息'
    ].join('\r\n');
    console.log(cmdList);
}
function deviceList(){
    var deviceList = getDevices(),
        node,
        keys = Object.keys(deviceList),
        l = keys.length,
        i = 0,
        servicelist,
        node;
    
    for(;i<l;i++){
        node = deviceList[keys[i]];
        console.log(node.device.friendlyName);
        servicelist = device.servicelist.service;
        servicelist.map((service)=>{
            console.log(service.serviceType);
        })
    }
    
}
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
