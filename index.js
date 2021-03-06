/* global __dirname */

var path = require('path');
var glob = require('glob');
var type = require('./lib/oftype.js');

function jsPattern (path) {
  return {pattern: path, included: true, served: true, watched: false};
}
function htmlPattern (path) {
  return {pattern: path, included: false, served: true, watched: true};
}
function cssPattern (path) {
  return {pattern: path, included: false, served: true, watched: false};
}

var loadHTML = function(files,client,basePath){
	var c = client.karmaHTML, s = c.source;
	var conditions = [
		!type(c,Object),
		!type(s,Array),
		!s.length,
		s.some(i => !type(i,Object)),
		s.some(i => type(i.src,undefined)),
		s.some(i => type(i.tag,undefined)),
		s.some(i => (!type(i.src,String) || !/.\.(html|htm)$/.test(i.src))),
		s.some(i => !type(i.tag,String)),
		s.some(i => !i.tag.length),
		s.some(i => !/[A-Za-z_$][A-Za-z0-9_$]*/.test(i.tag)),
		hasDoubles(s.map(i => i.src)),
		hasDoubles(s.map(i => i.tag)),
		s.some(i => glob.hasMagic(i.src))
	];
	
	var errorMsg = [
		'The client.karmaHTML object was not found in the karma config file.',
		'The client.karmaHTML.source property should be of type Array.',
		'The client.karmaHTML.source Array should contain at least one item.',
		'Each client.karmaHTML.source item should be of type Object',
		'Each client.karmaHTML.source object-type item should contain the src property',
		'Each client.karmaHTML.source object-type item should contain the tag property',
		'Each client.karmaHTML.source item\'s src property should be of type String and indicate the html file path.',
		'Each client.karmaHTML.source item\'s tag property should be of type String.',
		'Each client.karmaHTML.source item\'s tag name should contain at least one character.',
		'Each client.karmaHTML.source item\'s tag name should respect JavaScript identifiers constructing rules ([A-Za-z0-9_$] began with letter, _ or $).',
		'Two of the client.karmaHTML.source items\' src properties are doubled, while each of them should be unique.',
		'Two of the client.karmaHTML.source items\' tag properties are doubled, while each of them should be unique.',
		'The client.karmaHTML.source src paths should indicate unique html files, rather than use wildcards.'
	];
    
	for(var i=0;i<conditions.length;i++){
		if(pushError(conditions[i],errorMsg[i])) return;
	}
	
    for(var i=0;i<s.length;i++){
      files.unshift(htmlPattern(path.join(basePath,s[i].src)));
    }
    
	files.unshift(jsPattern(path.join(__dirname, '/lib/appender.js')));
	files.unshift(jsPattern(path.join(__dirname, '/lib/oftype.js')));
	files.unshift(cssPattern(path.join(__dirname, '/lib/styles.css')));
};

function pushError(condition,message){
	if(condition){
		var err = new Error('Karma config Error: ' + message);
		console.log("\x1b[31m", err.message ,'\x1b[0m');
		return true;
	}
}

function hasDoubles(a){
	for(var x=0;x<a.length;x++){
		var m = 0;
		for(var y=0;y<a.length;y++){
			if(a[y]===a[x]) m++;
			if (m===2) return true;
		}
	}
	return false;
}

loadHTML.$inject = ['config.files','config.client','config.basePath'];

module.exports = {
  'reporter:karmaHTML': ['factory',loadHTML]
};