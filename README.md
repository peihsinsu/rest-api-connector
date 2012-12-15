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

//Setup and compile the api node module
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
var api = require('rest-api-connector').api;

//Setup and compile the api node module
api.buildFromJson(
  api.readJsonCfg(__dirname + '/api.cfg'),
  api.readJsonCfg(__dirname + '/apiDefinition.json')
);

//Use the api module
api.apiCall(uuid, function(e,r,d){
  console.log(d);
});
</pre>

<h2>Other way to use 2: Single file api server</h2>
If you don't metter that the json string will disturb your code format. You can merge all code in single file like:
<pre>
var api = require('rest-api-connector').api;

//Setup and compile the api node module
api.buildFromJson(
  { //define the api connection info
    API_CFG: {
      USERNAME: "your api username", //api password
      PASSWORD: "your api password", //api username
      BASE_URL: "http://123.123.123.123:123" //api url
    }
  },
  { //define the api definition
    apiCall: {
      url:"/service/:uuid",
      method: "GET",
      input: [
        { "name":"id", "value":"", "type":"string", "max":40, "nullable":false }
      ]
    }
  }
);

//Use the api module 
api.apiCall(uuid, function(e,r,d){
  console.log(d);
});
</pre>

<br/>
<h2>Form Post</h2>
If you want to post form data in the api module. You can just define the api like:
<pre>
  {
    apiCall: {
      url:"/service/:uuid",
      method: "GET",
      form: true, 
      input: [
        { "name":"id", "value":"", "type":"string", "max":40, "nullable":false }
      ]
    }
  }
</pre>
And then, you must put the form object (a json format object) to the n-2 arguments. The example:
<pre>
api.apiCall(uuid, {field1:123, field2:"test field 2"},  function(e,r,d){
  if(e) console.log(e);
  console.log(d);
});
</pre>

<h2>The column of a api definition</h2>
API definition will be the operation information of a api, that looks like:
<pre>
  {
    apiCall: {
      url:"/service/:uuid",
      method: "GET",
      form: true, 
      input: [
        { "name":"id", "value":"", "type":"string", "max":40, "nullable":false }
      ]
    }
  }
</pre>
The all avaliable column of a apiCall (that will be generate to a api module function, that can present to other object to call) includes:
<ul>
  <li>url (string, cannot null): The rest request url for the apiCall. Like ExpressJS, you can use ":key" for parameter input. It will merge with input for final rest request. </li>
  <li>method (string, optional, default is GET): The rest request method. If empty, will use default method: GET.</li>
  <li>headers (json object, optional): The rest request header. If empty, will check the connection definition's username and password for base64 authorization</li>
  <li>form (true|false, optional): If true, will check the n-2 arguments must be a json object to be the form input.</li>
  <li>input (json array, optional): The input configure for default validator use. If empty, will skip all check.</li>
  <li>output (json object, optional): Define a sample output value. A dummy column for juest define.</li>
  <li>validator (function, optional) If empty, will use default validator to parse the input definition</li>
  <li>descript (string, optional): A definition column to record the api description.</li>
</ul>

<h2>All avaliable api default input parameter validator factors</h2>
Default validator will use the input config for validating the api module function that generated by api config. And the avaliable config for validate list bellow:
<ul>
  <li>name: String value, the name of the api input .</li>
  <li>type: The input value's type.</li>
  <li>max: The max size of a input parametet.</li>
  <li>nullable: If true, the input cannot be a null value.</li>
  <li>skipcheck: If true, will skip check process.</li>
</ul>

<h2>Future work!</h2>
<ul>
<li>CLI for generate the api definitions.</li>
<li>Find the way to generate configure from ExpressJS or http.createServer.</li>
</ul>
