const serverMap = {},
      http = require('http'),
      path =require('path'),
      xmlParser = require('fast-xml-parser'),
      ALIVE = 'ssdp:alive';
exports.parseServer = function(str,cb){
   var msg = strToMsg(str),
       key,
       serverUrl = msg.location;
   //console.log(msg);
   key = msg.uuid = msg.usn.split('::')[0].split(':')[1];
   if(serverUrl == null){
       console.log(msg);
       return;
   }
   if(msg.nts == ALIVE && serverMap[key] == null){
       serverMap[key] = msg;
       //console.log('发现服务地址：'+ serverUrl);
       http.get(serverUrl,{timeout:1000},(rs)=>{
           parseXML(rs,(xml)=>{
               var device = xml.root.device;
               console.log('服务设备：',device.friendlyName);
               console.log('提供服务：'+ device.deviceType);
               //播放国歌
               msg.friendlyName = device.friendlyName;
               msg.contrlUrl = path.parse(serverUrl).dir;
               msg.manufacturer = device.manufacturer;
               cb(msg);
              // if(device.manufacturer == 'Xiaomi')(cb(msg))
           });
       }).on('error', (e) => {
        console.error(`请求${serverUrl}失败: ${e.message}`);
       });
      // console.log(msg);
   }else if (msg.nts != ALIVE && serverMap[key] != null){
       delete serverMap[key];
   }
}
exports.parseContrl = (str,cb)=>{
    var msg = strToMsg(str);
    cb(msg);
}
exports.parseReponse = parseXML;
function strToMsg(str){
    var line = str.split('\r\n'),
        row,
        map = {},
        i = 1,
        key,value,index,
        l = line.length - 2;
    
    for (;i<l;i++){
       row = line[i];
       index = row.indexOf(':');
       key = row.substr(0,index).toLowerCase();
       value = row.substr(index + 2);
       map[key] = value;
    }
    return map;
}
function parseXML(res,cb){
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    }else if (!/^text\/xml/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
        console.error(error.message);
      //  debugger;
        // Consume response data to free up memory
     //   res.resume();
      //  return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
           const parsedData = xmlParser.parse(rawData);
           cb(parsedData,rawData);
          // console.log(rawData);
        } catch (e) {
           console.error(e.message);
        }
    });
}