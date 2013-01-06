var request = require('request')
  , nu = require('nodeutil')
  , _ = require('underscore')
  , log = nu.logger.getInstance()
  , cfg 
  , API_SERVER 
  , API_HEADER 
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
  API_SERVER = cfg.API_CFG.BASE_URL
  //Default use base64 authorization
  if(cfg.API_CFG.PASSWORD)
    API_HEADER = {"Authorization": "Basic " + new Buffer(cfg.API_CFG.USERNAME+':'+cfg.API_CFG.PASSWORD).toString('base64')}

  var keys = Object.keys(api);
  keys.forEach(function(v,i){
    this[v] = function(){
      var callback //callback will always three params: error, response, data
        , opts = {
        url: API_SERVER + api[v].url,
        method: (api[v].method ? api[v].method : "GET")
      }

      //if form exist
      //TODO: form need validator?
      if(api[v].form) 
      if(arguments && typeof(arguments[arguments.length-2]) == "object") {
        opts.form = arguments[arguments.length-2];
      } else {
        log.error('Argument type error, you specify a form input, please use a json type as form input in the %s argument ', 
          (arguments.length -2));
      }

      //if header exist
      if(api[v].headers)  {
        log.debug('Set header using single api config...%s', JSON.stringify(api[v].headers));
        opts.headers = api[v].headers;
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
      log.info('notvalidate for the api is %s', api[v].notvalidate);
      var vrtn = api[v].validator ? api[v].validator(arguments) : 
        (api[v].notvalidate ? true : validator(arguments, args));
      if(!vrtn.valid && callback) {
        log.error('Validate exception: %s', JSON.stringify(vrtn));
        callback(vrtn);
      }
      if(vrtn.valid && callback) {
        //do the request of api
        opts.url = convertUrl(opts.url, arguments);
        
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
    log.debug('rtn_url:%s',rtn_url);
    return rtn_url;
  }
  
  /**
   * The default validator, to validate the function input using input definition 
   * {Array} inargs : The input arguments from function
   * {Array} args : The input definition array
   */
  function validator(inargs, args){
    log.info('Receive artuments:');
    log.info(inargs);
    //TODO input validate
    if(args && args.length > 0)
    for(var i = 0 ; i < args.length ; i++) {
      if(args[i].skipcheck) { //skip parameter check 
        return {"valid":true};
      }
      log.info('Type of argument %s is [%s], defined type is [%s]',inargs[i], typeof(inargs[i]), args[i].type);
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

