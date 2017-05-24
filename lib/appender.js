function htmlRunner(){
	
	var defaults = {
		source:[],
		timeout:0,
		abort:0,
		width:'90%',
		height:'80vh',
		auto:false
	};
	
	var data = {};
	
	var globalMethods = {
		open: function(){
			autoOpen.call(this,true);	
		},
		close: function(){
			var tags = this.tagList;
			for(var i in tags){
				this[tags[i].tag].close();
			}
		},
		reload: function(){
			var tags = this.tagList;
			for(var i in tags){
				this[tags[i].tag].reload(true);
			}			
		}
	};

	var tagMethods = {
		open: function(){
			if(this.hasIframe){
				console.warn("karmaHTML WARN: There was an attempt of opening the html file of '" + this.tag + "' tag that is already opened. This attempt was ignored.");
				return;
				} else {
					this.hasIframe = true;
					}
			var container,iframe,prompt,state,tag,header,ajax,abortTimer,that = this;

			if(!this.container||!this.iframe){
				createElements.call(this);
				prepareElements.call(this);
				appendElements.call(this);
				} else {
					header = this.container.children[0];
					prompt = header;
					state = header.children[0];
					tag = header.children[1];
					}

			document.body.appendChild(this.container);

			ajax = new XMLHttpRequest();
			ajax.timeout = this._root.config.timeout;
			ajax.open('GET', this.src, true);
			ajax.send();
			msg("Send request...");
			ajax.ontimeout = msg.bind(this,"Request timeout!");
			ajax.onreadystatechange = function() {
				if (this.readyState === 4){
					if(this.status === 200){
						msg("Loading sources...");
						that.iframe.src = this.responseURL;
						runAbortTimer(true);
						that.iframe.onload = response.bind(this,'ok');
						that.iframe.onerror = response.bind(this,'warn');
					} else {
						response.call(this,'warn');
					}
				}
			};

			function createElements(){
				this.container = document.createElement('DIV');
				prompt = document.createElement('H1');
				state = document.createElement('SPAN');
				tag = document.createElement('SPAN');
				this.iframe = document.createElement('IFRAME');
			}

			function prepareElements(){
				this.container.className = "iframe-container";
				this.container.setAttribute('data-document',"document_" + this.itemNum);
				prompt.className = "prompt-info";
				this.iframe.className = "karma-html";
				tag.textContent = this.tag;
				this.width = data.width;
				this.height = data.height;
			}

			function appendElements(){
				prompt.appendChild(state);
				prompt.appendChild(tag);
				this.container.appendChild(prompt);
				this.container.appendChild(this.iframe);
			}

			function msg(msg){
				state.textContent = msg;
			}

			function response(s){
				switch(s){
					case 'ok':
						msg("Done!");
						prompt.className = "prompt-ok";
						that.document = that.iframe.contentDocument;
						that.ready = true;
						callOnLoad.call(that,true,this.status,this.statusText);
						runAbortTimer(false);
						break;
					case 'warn':
						msg("("+this.status+") Something went wrong!");
						prompt.className = "prompt-warn";
						that.document = null;
						that.ready = false;
						callOnLoad.call(that,false,this.status,this.statusText);
						runAbortTimer(false);
						break;
					case 'abort':
						that.iframe.onload = null;
						that.iframe.src = "";
						msg("Loading aborted!");
						prompt.className = "prompt-info";
						that.document = null;
						that.ready = false;
						callOnLoad.call(that,false,0,'Loading Aborted');						
						break;
				}
			}

			function runAbortTimer(state){
				var time = that._root.config.abort;
				if(state&&time>0){
					abortTimer = setTimeout(function(){
						response('abort');
					},time);
				} else {
					clearTimeout(abortTimer);
				}
			}
		},
		close: function(){
			if(this.hasIframe){
				this.container.parentNode.removeChild(this.container);
				this.container.children[0].className = "prompt-info";
				this.hasIframe = false;
				this.document = null;
				this.ready = false;
				callOnLoad.call(this,false,0,"Page closed");
			} else {
				console.warn("karmaHTML WARN: There was an attempt of closing the html file of '" + this.tag + "' tag that is already closed. This attempt was ignored.");
			}
		},
		reload: function(global){
			if(this.hasIframe){
				var cont = utils.findContainer(this.itemNum);
				cont.children[1].contentWindow.location.reload();
			} else if(!global){
				console.warn("karmaHTML WARN: There was an attempt of reloading the html file of '" + this.tag + "' tag that is not opened. This file was opened instead.");
				this.open();
			}
		}
	};	

	var utils = {
		type: function(value,type){
			type = type.toLowerCase();
				if(typeof value==='undefined'&&type==='undefined') return true;
				if(value===null&&type==='null') return true;
				if(value===null||value===undefined) return false;
				return value.constructor.toString().toLowerCase().search(type)>=0;
		},
		findPath: function(path){
			var files = Object.getOwnPropertyNames(window.__karma__.files);
			var regexp = new RegExp(path+'$');
			for(var i=0;i<files.length;i++){
				if(regexp.test(files[i])) return files[i];
			}
		},
		findContainer: function(htmlNum){
			return document.querySelector("[data-document=document_" + htmlNum + "]");
		}
	};	

	function preventDuplicate(){
		
	}

	function hasWindow(){
		if(!window) new Error('Cannot find the window object.');
	}
	
	function hasKarmaObj(){
		if(!window.__karma__) new Error('Cannot find the window.__karma__ object.');
	}

	function appendGlobalMethods(){
		globalMethods._root = this; //possibly unneccessary because this already refers to the karmaHTML object
		globalMethods.config = data;
		var methods = Object.getOwnPropertyNames(globalMethods);
		for(var i=0;i<methods.length;i++){
			this.constructor.prototype[methods[i]] = globalMethods[methods[i]];
		}			
	}
		
	function addDefaultIframeStyles(){
		var link = document.createElement('LINK');
		link.rel = "stylesheet";
		link.href = utils.findPath('/lib/styles.css');
		document.head.appendChild(link);
	}
	
	function setData(){
		var getConfig = window.__karma__.config.karmaHTML;
		var prop = Object.getOwnPropertyNames(defaults);
		for(var i=0;i<prop.length;i++){
			data[prop[i]] = (validData(prop[i],getConfig[prop[i]])) ? getConfig[prop[i]]:defaults[prop[i]];
		}
		
			function validData(name,value){
				var type = utils.type;
				if(type(value,'undefined')) return false;
				switch(name) {
					case "source":
						return ((type(value,'string')&&value!=='') || (type(value,'array')));
						break;
					case "timeout":
						return (type(value,'number')&&value>=0);
						break;
					case "abort":
						return (type(value,'number')&&value>=0);
						break;
					case "width":
						return (type(value,'string'));
						break;
					case "height":
						return (type(value,'string'));
						break;
					case "auto":
						return (type(value,'boolean'));
						break;
					default:
						return false;
				}
			}
	}

	function parseScrPaths(){
		for(var i=0;i<data.source.length;i++){
			data.source[i].src = utils.findPath(data.source[i].src);
		}
	};
	
	function appendTagMethods(){
		tagMethods._root = this;
		var methods = Object.getOwnPropertyNames(tagMethods);
		for(var i=0;i<methods.length;i++){
			Tag.prototype[methods[i]] = tagMethods[methods[i]];
		}
	};
	
	function Tag(o){
		this.src = o.src;
		this.tag = o.tag;
		this.itemNum = o.itemNum;
		this.hasIframe = false;
		this.document = null;
		this.container = null;
		this.iframe = null;
		this.onstatechange = null;
		this.ready = false;
	}	
	
	function createTagObject(){
		var s = data.source;
		var tagList = [];
		for(var i=0;i<s.length;i++){
			var newTag = new Tag({
				src:s[i].src,
				tag:s[i].tag,
				width:data.width,
				height:data.height,
				itemNum:i+1
			});
			this[s[i].tag] = newTag;		
			tagList.push(newTag);
		}
		this.constructor.prototype.tagList = tagList;
	};	

	function autoOpen(force){
		if(data.auto||force) {
			var tags = this.tagList;
			for(var i in tags){
				this[tags[i].tag].open();
			}
		}
	};

	function callOnLoad(response,status,textStatus){
		if(utils.type(this.onstatechange,'function')){
			this.onstatechange.call(this,response,this.tag,status,textStatus);
		}
		if(utils.type(this._root.onstatechange,'function')){
			this._root.onstatechange.call(this._root,response,this.tag,status,textStatus);
		}
	}

	function addDimensionDescriptor(){
		Object.defineProperty(Tag.prototype, 'width',{
			get: function(){
				return this.container.style.width;
			},
			set: function(width){
				this.container.style.width = width;
			}
		});
		
		Object.defineProperty(Tag.prototype, 'height',{
			get: function(){
				return this.iframe.style.height;
			},
			set: function(height){
				this.iframe.style.height = height;
			}
		});
	}

	preventDuplicate();
	hasWindow();
	hasKarmaObj();
	addDimensionDescriptor();
	appendTagMethods.call(this);
	addDefaultIframeStyles();
	setData();
	parseScrPaths();
	appendGlobalMethods.call(this);
	createTagObject.call(this);
	autoOpen.call(this,false);	

};



var karmaHTML = new htmlRunner();
