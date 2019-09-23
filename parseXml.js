const xmlParser = require('fast-xml-parser'),
      filePath = './test.xml',
      fs = require('fs');

fs.readFile(filePath,'utf-8',(err,str)=>{
    var json = xmlParser.parse(str),
        serverList = json.root && json.root.device.serviceList;
    
    if(serverList){
        console.log(json.root.device);
        console.log(serverList);
    }
})
