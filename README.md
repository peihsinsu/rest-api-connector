<h1>REST API Connector</h1>

This is a utility for easy configure the rest api to a module. People who want to write a REST API node module, can use this for building one! Only config the rest url, invoke method (GET/POST/PUT/DELETE), and the field that the module will looks like, then the module help you to auto validate your input. If you want your user call a function that named: <b> getUser(userid, callback) </b> to use the api to get user. You only need to config a json like:
<pre>
{
  getUser: {
    url:"/user/:userid",
    method: "GET",
    input: [{name:"userid", value:'', type:"string", max:40, nullable:false, notvalidate: true}],
    output: { status: ['ERROR','SUCCESS'], msg: ""}
  }
}
</pre>
Then the rest-api-connector will auto generate a module called: <b>getUser(userid, callback)</b> for you. And it will export for other js to use.

Only some steps, that you can build your node.js module to connect your rest service.
<ul>
<li>Prepare: Install it...<br/>npm install rest-api-connector</li>
<li>Step1: Create a config file, that include the rest server ip, port, authentication, and url information.</li>
<li>Step2: Create a module file, to require rest-api-connector. And config a object that include the rest connect information.</li>
<li>Step3: Use the module that you create in the pre step, and the config object first level key will be your function name.</li>
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
  url:'/service1/:uuid',
  method: 'GET',
  //optional, if null, will use the
  headers: {"Authorization": "Basic " + new Buffer('user:password').toString('base64')},  
  cfg file setting
  input: [
    { name:"uuid", value:'', type:"string", max:40, nullable:false, notvalidate: true }
  ],
  output: {
    status: ['ERROR','SUCCESS'], msg: ""
  },
  //optional, if null, will use default validator
  validator: function(iargs){ 
    return {"valid":true};
  },
  //optional, just for descript
  descript: "Get zone information by uuid, the uuid is the unique id of smartmachine." 
};

//The basic config for use...
apiDef.sencondApiCall = {
  url:'/service2/:uuid',
  method: 'GET',
  input: [
    { name:"uuid", value:'', type:"string", max:40, nullable:false }
  ]
};

api.build(__dirname+'/lib/api.cfg',apiDef);
exports.invoke = api;
</pre>

<h2>Step3. Sample Use:</h2>
You can require the module you write in the step2 (ex: the instance is "api"), and you can use api.invoke.[your config]() to use your api.
<pre>
var api = require('./sampleModule')
api.invoke.firstApiCall('3a32da60-2782xx-xoooo-1234',function(e,r,body){
  console.log(body);
});
</pre>

<h2>Other way to use: Extract the API definition to file</h2>

<h3>Setup connection information into json format</h3>
File: api.cfg
<pre>
{
  API_CFG: {
    "USERNAME": "your api username", //api password
    "PASSWORD": "your api password", //api username
    "BASE_URL": "http://123.123.123.123:123" //api url
  }
}
</pre>

<h3>Setup api definition into json format</h3>
File: apiDefinition.json
<pre>
{
  "apiCall": {
    "url":"/service/:uuid",
    "method": "GET",
    "input": [
      { "name":"id", "value":"", "type":"string", "max":40, "nullable":false }
    ]
  }
}
</pre>

<h3>Call the service</h3>
<pre>
var api = require('rest-api-connector').api
  , cfg = require('nodeutil').cfgutil;

api.buildFromJson(
  cfg.readJsonCfg(__dirname + '/api.cfg'),
  cfg.readJsonCfg(__dirname + '/apiDefinition.json')
);

api.getKvmById(uuid, function(e,r,d){
  console.log(d);
});
</pre>
