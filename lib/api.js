var request = require('request')
  , nu = require('nodeutil')
  , _ = require('underscore')
  , log = nu.logger.getInstance('rest-api-connector')
  , cfg 
  //, API_HEADER 
  , api = {};

exports.getCfg = function(){
  return cfg;
}

exports.build = apiInstanceFromPath;
exports.buildFromPath = apiInstanceFromPath;
function apiInstanceFromPath(cfgPath, api){
  cfg = nu.cfgutil.readJsonCfg(cfgPath);
  log.debug('Loading config start ====================================');
  log.debug('Config:%s', JSON.stringify(cfg));
  log.debug('Loading config end   ====================================');
  return apiInstanceFromJson(cfg, api);
}

/**
 * Sample Config:
 * api.getZoneById = {
 *   url:'/zones/:uuid' 
 *   , method: 'GET'
 *   , headers: API_HEADER
 *   , input: [
 *     { name:"uuid", value:'', type:"string", max:40, nullable:false }
 *   ]
 *   , output: {
 *     status: ['ERROR','SUCCESS']
 *     , msg: ""
 *   }
 *   , validator: function(iargs){
 *     return {"valid":true};
 *   }
 * }
 */
exports.buildFromJson = apiInstanceFromJson;
function apiInstanceFromJson(cfg, api){
  //Default use base64 authorization
  var API_HEADER = {};
  if(cfg.API_CFG.HEADERS) { //Using the configure file directly
    API_HEADER = _.clone(cfg.API_CFG.HEADERS);
  } else if(cfg.API_CFG.PASSWORD)
    API_HEADER = {"Authorization": "Basic " + new Buffer(cfg.API_CFG.USERNAME+':'+cfg.API_CFG.PASSWORD).toString('base64')}

  var keys = Object.keys(api);
  keys.forEach(function(v,i){
    this[v] = function(){
      var callback //callback will always three params: error, response, data
        , opts = {
        url: cfg.API_CFG.BASE_URL + api[v].url,
        method: (api[v].method ? api[v].method : "GET")
      }
     
      if(api[v].body) {
        if(arguments && typeof(arguments[arguments.length-2]) == "object") {
          opts.body = arguments[arguments.length-2].body;
        } else {
          log.error('Argument type error, you specify a body in a json object as body request in the %s argument ', 
            (arguments.length -2));
        }
      }

      //setup the query string 
      if(api[v].qs) {
        if(arguments && typeof(arguments[arguments.length-2]) == "object") {
          opts.qs = arguments[arguments.length-2].qs;
        } else {
          log.error('Argument type error, you specify a qs in a json object as query string input in the %s argument ', 
            (arguments.length -2));
        }
      }

      //if form exist
      //TODO: form need validator?
      if(api[v].form) 
      if(arguments && typeof(arguments[arguments.length-2]) == "object") {
        opts.form = arguments[arguments.length-2].form;
      } else {
        log.error('Argument type error, you specify a form parameter in a json object as form input in the %s argument ', 
          (arguments.length -2));
      }

      //if header exist
      if(api[v].headers)  {
        log.debug('Set header using single api config...%s', JSON.stringify(api[v].headers));
        if(!API_HEADER) {
          opts.headers = api[v].headers;
        } else {
          opts.headers = api[v].headers;
          _.extend(opts.headers, API_HEADER);
        }
      } else if (API_HEADER) {
        log.debug('Set header using global config...%s', JSON.stringify(api[v].headers));
        opts.headers = API_HEADER;
      }
     
      //check callback
      if(arguments && typeof(arguments[arguments.length-1]) == "function") 
        callback = arguments[arguments.length-1];
      else 
        log.error('Argument type error, last arguments must a callback function!');
      
      //Validate arguments
      var args = api[v].input;
      log.debug('notvalidate for the api is %s', api[v].notvalidate);
      var vrtn = api[v].validator ? api[v].validator(arguments) : 
        (api[v].notvalidate ? true : validator(arguments, args));
      if(!vrtn.valid && callback) {
        log.error('Validate exception: %s', JSON.stringify(vrtn));
        callback(vrtn);
      }
      if(vrtn.valid && callback) {
        //do the request of api
        opts.url = convertUrl(opts.url, arguments);
        log.debug('Request detail:');
        log.debug(opts);
        request(opts, function(e, r,body){
          callback(e, r, body);
        });
      } else {
        log.error('Validate false, will not call api');
        callback(vrtn);
      }
    }
    exports[v] = this[v];
  });
  
  /**
   * To convert the url pattern to merge the method input arguments
   */
  function convertUrl(base_url, args){
    log.debug(args);
    var urltoken = base_url.split('/');
    var values = _.values(args);
    log.debug(values);
    for( var i = 1 ; i < urltoken.length ; i++ ){
      var key = urltoken[i];
      if( key.indexOf(':') == 0 ){
        log.debug('values:%s, type:%s', values[0], typeof(values[0]));
        if(values[0] && typeof(values[0]) != "function")
          urltoken[i] = values.shift();
      }
    }
    var rtn_url = urltoken.join('/');
    return rtn_url;
  }
  
  /**
   * The default validator, to validate the function input using input definition 
   * {Array} inargs : The input arguments from function
   * {Array} args : The input definition array
   */
  function validator(inargs, args){
    log.debug('Receive artuments:');
    log.debug(inargs);
    //TODO input validate
    if(args && args.length > 0)
    for(var i = 0 ; i < args.length ; i++) {
      if(args[i].skipcheck) { //skip parameter check 
        return {"valid":true};
      }
      log.debug('Type of argument %s is [%s], defined type is [%s]',inargs[i], typeof(inargs[i]), args[i].type);
      if(!args[i].nullable && !inargs[i]) { //validate of nullable
        log.error('Catch nullable exception...' + args[i].name + ' is null!');
        return {"valid":false,"msg":"args null exception"};
      }
      if(args[i].type && inargs[i] && (typeof(inargs[i]) != args[i].type)) { //validate the input type
        log.error('Catch type error of ' + args[i].name + '...');
        return {"valid":false,"msg":"args type error exception"};
      }
    }
    return {"valid":true};
  }

  return api;
}

exports.readJsonCfg = nu.cfgutil.readJsonCfg;

