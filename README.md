<h1>REST API Connector</h1>

This is a utility for easy configure the rest api to a module. People who want to write a REST API node module, can use this for building one!
Only some steps, that you can build your node.js module to connect your rest service.
<ul>
<li>Create a config file, that include the rest server ip, port, authentication, and url information.</li>
<li>Create a module file, to require rest-api-connector. And config a object that include the rest connect information.</li>
<li>Use the module that you create in the pre step, and the config object first level key will be your function name.</li>
</ul>

<h2>Sample Config File:</h2>
<pre>
{
  "API_CFG": {
    "SERVER":"123.123.123.123",
    "PORT":80,
    "PROTOCAL":"http",
    "USERNAME":"user", //Will use for Authentication
    "PASSWORD":"passwd", //Will use for Authentication 
    "BASE_URL":"http://123.123.123.123"
  }
}
</pre>

<h2>Sample Module</h2>
<pre>
var api = require('rest-api-connector').api
  , apiDef = {};

apiDef.getZoneById = {
  url:'/zones/:uuid' 
  , method: 'GET'
  , headers: {"Authorization": "Basic " + new Buffer('user:password').toString('base64')} //optional, if null, will use the cfg file setting
  , input: [
    { name:"uuid", value:'', type:"string", max:40, nullable:false, notvalidate: true}
  ]
  , output: {
    status: ['ERROR','SUCCESS'], msg: ""
  }
  , validator: function(iargs){ //optional, if null, will use default validator
    return {"valid":true};
  }
  , descript: "Get zone information by uuid, the uuid is the unique id of smartmachine." //optional, just for descript
};

apiDef.getVmById = {
  url:'/vms/:uuid' 
  , method: 'GET'
  , input: [
    { name:"uuid", value:'', type:"string", max:40, nullable:false }
  ]
  , output: {
    status: ['ERROR','SUCCESS'], msg: ""
  }
};

api.build(__dirname+'/lib/api.cfg',apiDef);
exports.invoke = api;
</pre>

<h2>Sample Use:</h2>
<pre>
var api = require('./sampleModule')//require('api-client').api
api.invoke.getZoneById('3a32da60-2782xx-xoooo-1234',function(e,r,body){
  console.log(body);
});
</pre>
