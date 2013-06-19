REST API Connector
====

This is a utility for easy configure the rest api to a module. People who want to write a REST API node module, can use this for building one! Only config the rest url, invoke method (GET/POST/PUT/DELETE), and the field that the module will looks like, then the module help you to auto validate your input. 

# Easy way to use: Single file api server
If you don't metter that the json string will disturb your code format. You can merge all code in single file like:

```
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

//This is where you use the api module 
api.apiCall(uuid, function(e,r,d){
  console.log(d);
});
```


If you want your user call a function that named: <b> getUser(userid, callback) </b> to use the api to get user. You only need to config a json like:

```
{
  getUser: {
    url:"/user/:userid",
    method: "GET",
    input: [{name:"userid", value:'', type:"string", max:40, nullable:false, skipcheck: true}],
    output: { status: ['ERROR','SUCCESS'], msg: ""}
  }
}
```

Then the rest-api-connector will auto generate a module called: <b>getUser(userid, callback)</b> for you. And it will export for other js to use.

# Other

If you want to see more configurations, see: [Advance Configures](AdvanceConf.md)


# Future work!

* CLI for generate the api definitions.
* Find the way to generate configure from ExpressJS or http.createServer.
