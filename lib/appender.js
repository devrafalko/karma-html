function htmlRunner(){
	console.log('inner run');
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
		open: function(o){
			autoOpen.call(this,true,o);	
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
		open: function(o){
			if(utils.type(o,'object')){
				this.width = o.width;
				this.height = o.height;
			}

			if(this.hasIframe){
				return;
				} else {
					this.hasIframe = true;
					}
			var ajax,abortTimer,that = this;
			var e = this._root.elementList[this.itemNum];

			document.body.appendChild(e.container);

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
						e.iframe.src = this.responseURL;
						runAbortTimer(true);
						e.iframe.onload = response.bind(that,'ok',this);
						e.iframe.onerror = response.bind(that,'warn',this);
					} else {
						response.call(this,'warn');
					}
				}
			};

			function msg(msg){
				e.state.textContent = msg;
			}

			function response(s,ajax){
				switch(s){
					case 'ok':
						msg("Done!");
						e.prompt.className = "prompt-ok";
						this.ready = true;
						this.document = e.iframe.contentDocument;
						window['document_'+this.itemNum] = this.document;					
						callOnLoad.call(this,true,ajax.status,ajax.statusText);
						runAbortTimer(false);
						
						break;
					case 'warn':
						msg("("+ajax.status+") Something went wrong!");
						e.prompt.className = "prompt-warn";
						this.ready = false;
						callOnLoad.call(this,false,ajax.status,ajax.statusText);
						runAbortTimer(false);
						break;
					case 'abort':
						e.iframe.onload = null;
						e.iframe.src = "";
						msg("Loading aborted!");
						e.prompt.className = "prompt-info";
						this.ready = false;
						callOnLoad.call(this,false,0,'Loading Aborted');						
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
			if(!this.hasIframe){
				return;
			} else {
				var e = this._root.elementList[this.itemNum];
				e.container.parentNode.removeChild(e.container);
				e.prompt.className = "prompt-info";
				this.hasIframe = false;
				this.document = null;
				window['document_'+this.itemNum] = null;
				this.ready = false;
				callOnLoad.call(this,false,0,"Page closed");
			}
		},
		reload: function(global){
			if(this.hasIframe){
				var e = this._root.elementList[this.itemNum];
				e.iframe.contentWindow.location.reload();
			} else if(!global){
				console.warn("karmaHTML WARN: There was an attempt of reloading the html file of '" 
						     + this.tag + "' tag that is not opened, so this file was opened instead.");
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
		}
	};	

	function hasWindow(){
		if(!window) new Error('Cannot find the window object.');
	}

	function hasKarmaObj(){
		if(!window.__karma__) new Error('Cannot find the window.__karma__ object.');
	}

	function appendGlobalMethods(){
		globalMethods.config = data;
		globalMethods.elementList = [];
		globalMethods.tagList = [];

		var methods = Object.getOwnPropertyNames(globalMethods);
		for(var i=0;i<methods.length;i++){
			this.constructor.prototype[methods[i]] = globalMethods[methods[i]];
		}			
	}

	function appendTagMethods(){
		tagMethods._root = this;
		var methods = Object.getOwnPropertyNames(tagMethods);
		for(var i=0;i<methods.length;i++){
			Tag.prototype[methods[i]] = tagMethods[methods[i]];
		}
	}

	function Tag(o){
		this.src = o.src;
		this.tag = o.tag;
		this.itemNum = o.itemNum;
		this.hasIframe = false;
		this.document = null;
		this.iframe = null;
		this.onstatechange = null;
		this.ready = false;
	}

	function createTagObject(){
		var s = data.source;
		for(var i=0;i<s.length;i++){
			var newTag = new Tag({
				src:s[i].src,
				tag:s[i].tag,
				width:data.width,
				height:data.height,
				itemNum:i
			});
			this[s[i].tag] = newTag;
			this[i] = newTag;
			this.constructor.prototype.tagList.push(newTag);
		}
		this['length'] = i;
	};

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

	function autoOpen(force,o){
		if(data.auto||force) {
			var tags = this.tagList;
			for(var i in tags){
				this[tags[i].tag].open(o);
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

	function addGlobalDimensionDescriptor(){
		setDimensions.call(this,'width');
		setDimensions.call(this,'height');

		function setDimensions(dimension){
			Object.defineProperty(this.constructor.prototype, dimension,{
				get: function(){
					var tagDim = {};
					for(var i=0;i<this.tagList.length;i++){
						tagDim[this.tagList[i].tag] = this.tagList[i][dimension];
					}
					return tagDim;
				},
				set: function(value){
					for(var i=0;i<this.tagList.length;i++){
						this.tagList[i][dimension] = value;
					}				
				}
			});
		}
	}

	function addTagDimensionDescriptor(){
		Object.defineProperty(Tag.prototype, 'width',{
			get: function(){
				return this._root.elementList[this.itemNum].container.style.width;
			},  
			set: function(width){
				width = utils.type(width,'null') ? this._root.config.width:width;
				if(!utils.type(width,'string')) return;
				this._root.elementList[this.itemNum].container.style.width = width;
			}
		});

		Object.defineProperty(Tag.prototype, 'height',{
			get: function(){
				return this.iframe.style.height;
			},
			set: function(height){
				height = utils.type(height,'null') ? this._root.config.height:height;
				if(!utils.type(height,'string')) return;
				this.iframe.style.height = height;
			}
		});
	}

	function createIframes(){
		var elements = this.elementList;

		for(var i=0;i<this.tagList.length;i++){
			var t = this.tagList[i];
			createElements.call(t);
		}

		function createElements(){
			var e = {
				container: document.createElement('DIV'),
				prompt: document.createElement('H1'),
				state: document.createElement('SPAN'),
				tag: document.createElement('SPAN'),
				iframe: document.createElement('IFRAME')
			};

			e.container.className = "iframe-container";
			e.container.setAttribute('data-document',"document_" + this.itemNum);
			window['document_'+this.itemNum] = null;
			e.prompt.className = "prompt-info";
			e.iframe.className = "karma-html";
			e.tag.textContent = this.tag;
			e.prompt.appendChild(e.state);
			e.prompt.appendChild(e.tag);
			e.container.appendChild(e.prompt);
			e.container.appendChild(e.iframe);

			elements.push(e);
			this.iframe = e.iframe;
			this.width = data.width;
			this.height = data.height;
		}
	}

	preventDuplicate();
	hasWindow();
	hasKarmaObj();
	appendTagMethods.call(this);
	addTagDimensionDescriptor();
	addGlobalDimensionDescriptor.call(this);
	addDefaultIframeStyles();
	setData();
	parseScrPaths();
	appendGlobalMethods.call(this);
	createTagObject.call(this);
	createIframes.call(this);
	autoOpen.call(this,false);	
};

var karmaHTML = new htmlRunner();