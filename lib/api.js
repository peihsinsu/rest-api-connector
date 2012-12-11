var request = require('request')
  , nu = require('nodeutil')
  , log = nu.logger.getInstance()
  , _ = require('underscore')
  , cfg 
  , API_SERVER 
  , API_HEADER 
  , api = {};

exports.getCfg = function(){
  return cfg;
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
exports.build = apiInstance;
function apiInstance(cfgPath, api){
  cfg = nu.cfgutil.readJsonCfg(cfgPath);
  log.debug('Loading config start ====================================');
  log.debug('Config:%s', JSON.stringify(cfg));
  log.debug('Loading config end   ====================================');
  API_SERVER = cfg.API_CFG.BASE_URL
  //Default use base64 authorization
  API_HEADER = {"Authorization": "Basic " + new Buffer(cfg.API_CFG.USERNAME+':'+cfg.API_CFG.PASSWORD).toString('base64')}

  var keys = Object.keys(api);
  keys.forEach(function(v,i){
    this[v] = function(){
      var callback //callback will always three params: error, response, data
        , opts = {
        url: API_SERVER + api[v].url,
        method: api[v].method 
      }

      //if form exist
      if(api[v].form)  opts.form = api[v].form;
      
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
      var vrtn = api[v].validator ? api[v].validator(arguments) : validator(arguments, args);
      if(!vrtn.valid && callback) {
        log.error('Validate exception: %s', JSON.stringify(vrtn));
        callback(vrtn);
      }
      
      //TODO: do the request of api
      //TODO: replace the uuid of url
      opts.url = convertUrl(opts.url, arguments);
      
      request(opts, function(e, r,body){
        callback(e, r, body);
      });
    }
    exports[v] = this[v];
  });

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

  function validator(inargs, args){
    log.info('Receive artuments:');
    log.info(inargs);
    //TODO input validate
    for(var i = 0 ; i < args.length ; i++) {
      log.info('Type of argument %s is [%s], defined type is [%s]',inargs[i], typeof(inargs[i]), args[i].type);
      if(!args[i].nullable && !inargs[i]) { //validate of nullable
        log.error('Catch nullable exception...' + args[i].name + ' is null!');
        return {"valid":false,"msg":"args null exception"};
      }
      if(inargs[i] && (typeof(inargs[i]) != args[i].type)) { //validate the input type
        log.error('Catch type error of ' + args[i].name + '...');
        return {"valid":false,"msg":"args type error exception"};
      }
    }
    return {"valid":true};
  }

  return api;
}

