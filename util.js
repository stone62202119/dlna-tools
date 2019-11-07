
var xmlParser = require('fast-xml-parser');

exports.getIP = function(){
   const newInfo = require('os').networkInterfaces();
   let node;
   while(node = newInfo.WLAN.pop()){
      if(node.family == 'IPv4')return node.address;
   }
}
exports.getXML = function(CurrentURI,action){
    var xml = `<?xml version="1.0" encoding="utf-8"?>
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <s:Body>
        <u:${action} xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
          <InstanceID>0</InstanceID>
          <CurrentURI>${CurrentURI}</CurrentURI>
          <CurrentURIMetaData></CurrentURIMetaData>
        </u:${action}>
      </s:Body>
    </s:Envelope>`;
    return xml;
 }
 exports.parseXML = parseXML;
 function parseXML(res,cb){
  const { statusCode } = res;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                      `Status Code: ${statusCode}`);
  }else if (!/^text\/xml/.test(contentType) && contentType != '*/*') {
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
         const parsedData = xmlParser.parse(rawData);
         cb(parsedData,rawData);
      } catch (e) {
         console.error(e.message);
      }
  });
}
exports.baseUrl = baseUrl;
function baseUrl(url){
 var arr = url.split('//'),
     protocol = arr[0],
     arr2 = arr[1].split('/'),
     host = arr2[0];

  return [protocol,host].join('//');
}
exports.strToMsg = strToMsg;
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