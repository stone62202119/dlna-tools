const {start,stop,getDevices} = require('./search'),
      mp3server = require('./mp3Server'),
      readline = require('readline'),
      fs = require('fs'),
      rl = readline.createInterface({
        // 调用std接口
        input:process.stdin,
        output:process.stdout
      }),
      http = require('http'),
      {getXML,getPlayXML}=require('./util');


mp3server.start();
start();
showMenu();
rl.on('line',(line)=>{
    var cmd,
        cmdTofn = {
            'play':playTest,
            'list':deviceList,
            'menu':showMenu,
            'save':saveDevice
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
function playTest(line){
    var number = + line.split(' ')[1],
        deviceList = getDevices(),
        keys = Object.keys(deviceList),
        ext,
        controlURL,
        node;

    if(number != null && number < keys.length){
        node = deviceList[keys[number]];
        ext = node.baseUrl[node.baseUrl.length] == '/' ? '' : '/',
        controlURL = getCtrolUrl(node);
        if(controlURL){
            console.log('发送播放请求：');
            play([node.baseUrl,controlURL].join(ext));
        }else{
            console.log('该节点不支持播放');
        }
    }
    
    function getCtrolUrl(node){
       var servicelist = node.device.serviceList.service,
           i = 0,
           l = servicelist.length,
           service;

        for(;i<l;i++){
            service = servicelist[i];
            if(service.serviceType.indexOf('AVTransport') != -1){
                return service.controlURL;
            }
        }  
    }
}
function showMenu(){
    var cmdList = [
        'play 1 //给第一个设备播放mp3',
        'list 列出设备信息'
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
        console.log('number:' + i +' ' + node.device.friendlyName +'\nloaction'+ node.location);
        servicelist = node.device.serviceList.service;
        servicelist.map((service)=>{
            console.log(service.serviceType);
        })
    }
    if(l == 0){
        console.log('没有获取设备信息');
    }
}
function saveDevice(){
    var devices = getDevices();
    fs.writeFile('device.text',JSON.stringify(devices),(err)=>{
        if(err){
            console.log(err.message);
        }else{
            console.log('写入成功！');
        }
    });
}
function play(contrlUrl){
    var action = "SetAVTransportURI",
        mp3Url = mp3server.getUrl(),
        //xml = getStop('http://'+mp3Url,action),
        pic = 'http://pic2.nipic.com/20090506/2256386_141149004_2.jpg',
        xml = getXML('http://'+mp3Url,action);
        
        
    sendXML(contrlUrl,action,xml);//SetAVTransportURI
    action = 'Play';
    xml = getPlayXML(action);
    sendXML(contrlUrl,action,xml);
}
function sendXML(contrlUrl,action,xml){
    var req;
        
    req = http.request(contrlUrl,{
        method:'POST',
        timeout:30000,
        headers: {
        // 'SOAPACTION': "urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI",
         'SOAPACTION': '"urn:schemas-upnp-org:service:AVTransport:1#' + action + '"',
         'Content-Type': 'text/xml;charset="utf-8"',
         'Content-Length': Buffer.byteLength(xml)
        }
    },(res)=>{
     const { statusCode } = res;
     const contentType = res.headers['content-type'];
 
     let error;
     if (statusCode == 200){
         console.log('start play!');
     }else if (statusCode !== 200) {
         error = new Error('Request Failed.\n' +
                         `Status Code: ${statusCode}`);
     }else if (!/^text\/xml/.test(contentType)) {
         error = new Error('Invalid content-type.\n' +
                         `Expected application/json but received ${contentType}`);
     }
     if (error) {
         console.error(error.message);
     }
         res.setEncoding('utf8');
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
    req.on('error',function(e){
     console.error(`problem with request: ${e.message}`);
    })
    req.write(xml);
    req.end();
}
