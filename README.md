<h1>REST API Connector</h1>

This is a utility for easy configure the rest api to a module. People who want to write a REST API node module, can use this for building one!
Only some steps, that you can build your node.js module to connect your rest service.
<ul>
<li>Install it: npm install rest-api-connector</li>
<li>Create a config file, that include the rest server ip, port, authentication, and url information.</li>
<li>Create a module file, to require rest-api-connector. And config a object that include the rest connect information.</li>
<li>Use the module that you create in the pre step, and the config object first level key will be your function name.</li>
</ul>

<h2>Step1. Sample Config File:</h2>
To config your api server information, currently only support for base64 authorization.
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

<h2>Step2. Sample Module</h2>
In this step, you can create a sample module to operate your api service. You need to copy the api document about url, method, headers, and the input column information that include: type, size and some validator factor.
<pre>
var api = require('rest-api-connector').api
  , apiDef = {};

apiDef.firstApiCall = {
  url:'/service1/:uuid' 
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

apiDef.sencondApiCall = {
  url:'/service2/:uuid' 
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

<h2>Step3. Sample Use:</h2>
You can require the module you write in the step2 (ex: the instance is "api"), and you can use api.invoke.[your config]() to use your api.
<pre>
var api = require('./sampleModule')//require('api-client').api
api.invoke.firstApiCall('3a32da60-2782xx-xoooo-1234',function(e,r,body){
  console.log(body);
});
</pre>
