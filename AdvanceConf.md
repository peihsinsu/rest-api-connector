Advance Configuations
====

## Standard way to configure

Only some steps, that you can build your node.js module to connect your rest service.

* Prepare: Install it...<br/>npm install rest-api-connector
* Step1: Create a config file, that include the rest server ip, port, authentication, and url information.
* Step2: Create a module file, to require rest-api-connector. And config a object that include the rest connect information.
* Step3: Use the module that you create in the pre step, and the config object first level key will be your function name.


### Step1. Connection Config File:
To config your api server information, currently only support for base64 authorization.

```
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
```

### Step2. Module Configure
In this step, you can create a sample module to operate your api service. You need to copy the api document about url, method, headers, and the input column information that include: type, size and some validator factor.


```
var api = require('rest-api-connector').api
  , apiDef = {};

apiDef.firstApiCall = {
  url:'/service1/:uuid',
  method: 'GET',
  //optional, if null, will use the
  headers: {"Authorization": "Basic " + new Buffer('user:password').toString('base64')},  
  cfg file setting
  input: [
    { name:"uuid", value:'', type:"string", max:40, nullable:false, skipcheck: true }
  ],
  notvalidate: false,
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
```

### Step3. Use it
You can require the module you write in the step2 (ex: the instance is "api"), and you can use api.invoke.[your config]() to use your api.

```
var api = require('./sampleModule')
api.invoke.firstApiCall('3a32da60-2782xx-xoooo-1234',function(e,r,body){
  console.log(body);
});
```

## Other way to use: Extract the API definition to file

### Setup connection information into json format
File: api.cfg

```
{
  API_CFG: {
    "USERNAME": "your api username", //api password
    "PASSWORD": "your api password", //api username
    "BASE_URL": "http://123.123.123.123:123" //api url
  }
}
```

### Setup api definition into json format
File: apiDefinition.json

```
{
  "apiCall": {
    "url":"/service/:uuid",
    "method": "GET",
    "input": [
      { "name":"id", "value":"", "type":"string", "max":40, "nullable":false }
    ]
  }
}
```

### Call the service

```
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
```


## Form Post
If you want to post form data in the api module. You can just define the api like:

```
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
```

And then, you must put the form object (a json format object) to the n-2 arguments. The example:

```
api.apiCall(uuid, {field1:123, field2:"test field 2"},  function(e,r,d){
  if(e) console.log(e);
  console.log(d);
});
```

## The column of a api definition
API definition will be the operation information of a api, that looks like:

```
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
```

The all avaliable column of a apiCall (that will be generate to a api module function, that can present to other object to call) includes:

  * url (string, cannot null): The rest request url for the apiCall. Like ExpressJS, you can use ":key" for parameter input. It will merge with input for final rest request. 
  * method (string, optional, default is GET): The rest request method. If empty, will use default method: GET.
  * headers (json object, optional): The rest request header. If empty, will check the connection definition's username and password for base64 authorization
  * form (true|false, optional): If true, will check the n-2 arguments must be a json object to be the form input.
  * input (json array, optional): The input configure for default validator use. If empty, will skip all check.
  * output (json object, optional): Define a sample output value. A dummy column for juest define.
  * validator (function, optional) If empty, will use default validator to parse the input definition
  * descript (string, optional): A definition column to record the api description.


## All avaliable api default input parameter validator factors
Default validator will use the input config for validating the api module function that generated by api config. And the avaliable config for validate list bellow:

  * name: String value, the name of the api input .
  * type: The input value's type.
  * max: The max size of a input parametet.
  * nullable: If true, the input cannot be a null value.
  * skipcheck: If true, will skip check process.
