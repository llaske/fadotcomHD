// Cached JsonpRequest

enyo.kind({
	name: "Cached.JsonpRequest",
	kind: "enyo.JsonpRequest",
	published: { nocache: false },	

	// Constructor
	constructor: function() {	
		this.inherited(arguments);
		this.storage = new FADotCom.LocalStorage();
		this.response_callback = null;
		this.cachedresponse_callback = null;
		this.cache = null;		// Cache content
		this.cached = false;	// Data taken from cache or no
	},
	
	// Set handlers
	setResponse: function(callback) {
		this.response_callback = callback;
		this.response(enyo.bind(this, "callback"));
	},
	
	setCachedResponse: function(callback) {
		this.cachedresponse_callback = callback;
	},
	
	setError: function(callback) {
		this.error(callback);
	},
	
	// Go, get in cache first then launch request
	go: function() {
		// Look in cache
		this.cache = null;
		if (!this.nocache) {
			this.cache = this.storage.getValue(this.url);
			if (this.cache != null) {
				// Found in the cache
				console.log("get in cache "+this.url);
				this.cached = true;
				this.cachedresponse_callback(this, this.cache);
			}
		}
		
		// Launch request
		this.inherited(arguments);
	},
	
	// Callback
	callback: function(inSender, inResponse) {
		// Compare object with the cache
		var same = (this.cache != null) && compare_objects(this.cache, inResponse);
		
		// Not the same, set in cache launch callback
		if (!same) {
			if (this.cache == null) {
				if (this.nocache)
					console.log("no cache asked for "+this.url);
				else
					console.log("result not in the cache "+this.url);
			} else
				console.log("result dont match the cache "+this.url);
			this.storage.setValue(this.url, inResponse);
			this.cached = false;
		}
		
		// Same that the cache, do nothing
		else {
			console.log("same result already in the cache "+this.url);
			this.cached = true;
		}
		
		// Call response
		this.response_callback(this, inResponse);
	}
});


// Utility function, object comparaison
var compare_objects = function (obj1, obj2){
     var parameter_name;
     var compare = function(objA, objB, param){
         var param_objA = objA[param],
            param_objB = (typeof objB[param] === "undefined") ? false : objB[param];
 
        switch(typeof objA[param]){
            case "object": return (compare_objects(param_objA, param_objB));
            case "function": return (param_objA.toString() === param_objB.toString());
            default: return (param_objA === param_objB);
        }
 
    };
 
    for(parameter_name in obj1){
        if(typeof obj2[parameter_name] === "undefined" || !compare(obj1, obj2, parameter_name)){
            return false;
        }
    }
 
    for(parameter_name in obj2){
        if(typeof obj1[parameter_name] === "undefined" || !compare(obj1, obj2, parameter_name)){
            return false;
        }        
    }
 
    return true;
};