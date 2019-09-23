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
        </u:${action}>
      </s:Body>
    </s:Envelope>`;
    return xml;
 }