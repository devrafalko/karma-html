# Description
Use `karma-html` to test your `html` files in the browser with `karma`
* `karma-html` loads the chosen `.html` files into the **iframe** elements in the `context.html` **karma browser runner**.
* `karma-html` allows you to open, refresh, close and set the dimensions of the **iframes** through your test suits whenever you want.
* `karma-html` gives you the access to the `Document` object of each loaded `.html` file through your test suits. Testing `.html` files via its `Document` objects seems much more genuine and reliable than when HTML content is appended into the `div` containers.

> See also `karma-jasmine-dom` [*\[npm\]*](https://www.npmjs.com/package/karma-jasmine-dom) *(Set of 19 jasmine custom matchers configured for karma to test html DOM)*

> **Got confused?** See the step-by-step [example below](#step-by-step-configuration) to get acquainted with what the `karma-html` can be used for.

#### The list of contents:
1. [Description](#description)
2. [Q&A](#qa)
3. [Config](#config)
    * [source](#clientkarmahtml-source)
    * [auto](#clientkarmahtml-auto)
    * [timeout](#clientkarmahtml-timeout)
    * [abort](#clientkarmahtml-abort)
    * [width](#clientkarmahtml-width)
    * [height](#clientkarmahtml-height)
4. [karmaHTML and Tag objects](#karmahtml-and-tag-objects)
5. [iframe Document Object access](#iframe-document-object-access)
6. [Methods](#methods)
    * [open()](#open)
    * [close()](#close)
    * [reload()](#reload)
7. [Properties](#properties)
    1. [karmaHTML properties](#karmahtml-properties)
        * [width](#width)
        * [height](#height)
        * [elementList](#elementlist)
        * [tagList](#taglist)
        * [config](#config-1)
        * [length](#length)
        * [onstatechange](#onstatechange)
    2. [Tag properties](#tag-properties)
        * [\_root](#_root)
        * [width](#width-1)
        * [height](#height-1)
        * [tag](#tag)
        * [itemNum](#itemnum)
        * [document](#document)
        * [iframe](#iframe)
        * [src](#src)
        * [ready](#ready)
        * [onstatechange](#onstatechange-1)
8. [Common problems](#common-problems)
9. [Examples](#examples)
10. [Step-by-step configuration](#step-by-step-configuration)

# Q&A

1. How should I **configure** the **karma** `config file`, to run karmaHTML in my browser? [*\[see below\]*](#config)
2. How can I indicate `.html` files, that I want to test? [*\[see below\]*](#clientkarmahtml-source)
3. How can I **open** my `.html` files in my **karma browser runner**? [*\[see below\]*](#clientkarmahtml-auto)
4. How can I get the access to the **Document** Object of each `.html` file loaded in my tests? [*\[see below\]*](#iframe-document-object-access)
5. Ok, I've already tested my `.html` files, I don't need it anymore, I want to **close** them. [*\[see below\]*](#close)
6. I've got million `.html` files to test! I'd prefer to **open**, test and **close** each `.html` file **separately**, rather than open them all at once! [*\[see below\]*](#1-test-your-html-files-of-tag-index-and-tmpl-separately)
7. How do I know, if the `.html` file has been **loaded successfully** and whether it is **ready to be tested**? [*\[see below\]*](#onstatechange)
8. The `.html` files are loading for ages! Perhaps something's not right... I want to set **timeout**! [*\[see below\]*](#clientkarmahtml-abort)
9. I want to test the **responsiveness** of the layout. [*\[see below\]*](#width)

# Config
1. use `npm install karma-html --save-dev`
2. Add `"karmaHTML"` as a **`reporter`** in the **karma** `config file`
3. Add `karmaHTML` object in the `client` object in the **karma** `config file`

```javascript 
module.exports = function(config) {
  config.set({ 
    //other karma settings
    reporters: ["karmaHTML"],
    client: {
      karmaHTML: {
        //all karma-html settings
      }
    }
  });
};
```

## client.karmaHTML properties
All config properties *(excluding `client.karmaHTML.source`)* are optional. For the **omitted** properties, the properties of the **incorrect** type or value, the **default** values will be used instead.

###  **client.karmaHTML.`source`**
**Type:** Array  
**Default:** If the `source` property is of the **incorrect** syntax or does not indicate any *(or existing)* `.html` file, the suitable hint errors will occure with the clear explanation what to fix. The `karma` will run **without** `karma-html` module if the `client.karmaHTML.source` property is incorrect anyway.  
**Description:** Indicates the `.html` file(s) that should be loaded into the **iframes**. The array should include object-type items with `src` property, that indicates the `.html` file path and the `tag` property, that can further be used in the unit tests to get the control of the particular `.html` file. The **tag names** should respect JavaScript identifiers constructing rules: `[A-Za-z0-9_$], began with letter, _ or $`

> You do not have to load `.html` files in the **karma** `config file` `files` array, if you've already loaded them in the `client.karmaHTML.source` array.  
> Remember, to load all resources files of you `.html` files in the **karma** `config file` `files` array.

###### Syntax example
```javascript
module.exports = function(config) {
  config.set({
    files: [
      //no need to load your index.html and template.html here
      //all resources of your .html files should be loaded here
	  {pattern: './public/*.js', watched:true, served:true, included:true},
	  {pattern: './public/*.png', watched:false, served:true, included:false},
	  {pattern: './public/fonts/*', watched:false, served:true, included:false}
    ],
    client: {
      karmaHTML:{
        source: [
          {src:'./public/index.html', tag:'index'},
          {src:'./public/template.html', tag:'tmpl'}
        ]
      }
    }
  });
};  
```

### **client.karmaHTML.`auto`**
**Type:** Boolean  
**Default:** `false`  
**Description:** If `true`, the `.html` files are loaded into the iframes **automatically** *(immediately after the `context.html` **karma browser runner** is loaded)*. If `false`, the `.html` files can be loaded **manually** by invoke `open()` method *[\[see below\]](#open)*.

### **client.karmaHTML.`timeout`**
**Type:** Number  
**Default:** `0` *(no timeout)*  
**Description:** The number of milliseconds the **iframe** server **request** can take before automatically being terminated. When a timeout happens, the `onstatechange` method *[\[see below\]](#onstatechange)* fires and returns **false**.

### **client.karmaHTML.`abort`**
**Type:** Number  
**Default:** `0` *(no abort)*  
**Description:** The number of milliseconds the **loading resources** can take before automatically being terminated. When an abort happens, the `onstatechange` method [*\[see below\]*](#onstatechange) fires and returns **false**.  
You may also check out:
> Also check out **karma** `browserNoActivityTimeout` [*\[link\]*](https://karma-runner.github.io/1.0/config/configuration-file.html)  
> Also check out **jasmine** `DEFAULT_TIMEOUT_INTERVAL` [*\[link\]*](https://jasmine.github.io/api/edge/jasmine.html)

### **client.karmaHTML.`width`**
**Type:** String  
**Default:** `"90%"`  
**Description:** The **CSS width** of the **iframe**, that the `.html` file is about to be loaded into. The value *(eg. 600px)* is appended to the **iframe** element as the attribute `style="width:600px"`. Each valid CSS values and units are allowed. Incorrect values will be ignored and the **default** value will be used instead.

### **client.karmaHTML.`height`**
**Type:** String  
**Default:** `"80vh"`  
**Description:** The **CSS height** of the **iframe**, that the `.html` file is about to be loaded into. The value *(eg. 600px)* is appended to the **iframe** element as the attribute `style="height:600px"`. Each valid CSS values and units are allowed. Incorrect values will be ignored and the **default** value will be used instead.

###### Syntax of `client.karmaHTML` configuration example
```javascript
module.exports = function(config) {
  config.set({
    //all the karma config here
    client: {
      //all the client config here
      karmaHTML:{
        source: [
          {src:'./public/index.html', tag:'index'},
          {src:'./public/template.html', tag:'tmpl'}
        ],
        auto: true,
        timeout: 10000,
        abort: 60000,
        width: "730px",
        height: "30vw"        
      }
    }
  });
};  
```

# `karmaHTML` and `Tag` objects
### `window.karmaHTML` | `karmaHTML`
* When you configured your **karma** `config file`, you have got the access to the `karmaHTML` object with all features *([methods](#methods) and [properties](#karmahtml-properties))* to control your `.html` files. The `karmaHTML` object is created and appended to the `window` object when the `context.html` **karma browser runner** is opened via **cmd** `karma start` command.

###### object structure
```
KarmaHTML {
  0: Tag
  1: Tag
  index: Tag
  tmpl: Tag
  length: 2
  onstatechange: function() | undefined
  __proto__: {
    open: function()
    close: function()
    reload: function()
    height: (get|set) function()
    width: (get|set) function()
    elementList: {}
    tagList: []
    config: {}
  }
}
```

### `karmaHTML.tagName` | `karmaHTML[Number]`

* `karmaHTML` object lets you controll all `.html` files, while `Tag` objects let you control each `.html` file separately.
* `Tag` objects are generated automatically.
* The number of accessible `Tag` objects is equal to the number of `.html` files defined in the **karma** `config file`.
* The `Tag` objects are accessible via `karmaHTML` object.
* Assuming, that you want to test `index.html` file of the `index` **tag** and the `template.html` file of the `tmpl` **tag** [*\[as above\]*](#syntax-of-clientkarmahtml-configuration-example), you would get the two `Tag` objects with: `karmaHTML.index` or `karmaHTML[0]` and `karmaHTML.tmpl` or `karmaHTML[1]`

###### object structure
```
Tag {
  tag: String
  itemNum: Number
  document: HTMLDocument | null
  iframe: HTMLIFrameElement | null
  src: String
  hasIframe: Boolean
  ready: Boolean
  onstatechange: function() | undefined
  __proto__: {
    _root: karmaHTML
    open: function()
    close: function()
    reload: function()
    height: (get|set) function()
    width: (get|set) function()
  }
}
```


# iframe `Document` object access
How to get the **browser** access to the **`Document` Object** of each `.html` file loaded into the **iframes**?
Assuming, that you want to test `index.html` file of the `index` **tag** and the `template.html` file of the `tmpl` **tag** [*\[as above\]*](#syntax-of-clientkarmahtml-configuration-example):

### You can get the access via the `karmaHTML` object
To get the access to any iframe **Document** object of loaded `.html` file, use `karmaHTML['tag_name'].document`
* To get the access to the **Document** object of `index.html` file, use `karmaHTML.index.document`
* To get the access to the **Document** object of `template.html` file, use `karmaHTML.tmpl.document`

> It gives you the access to the **Document** object if its iframe is appended to the DOM. Use the `open()` [method](#open) or [configure](#clientkarmahtml-auto) the **karma** `config file` setting appropriately: `client.karmaHTML.auto:true` [*\[as above\]*]

### You can get the access via the window Object
Each iframe **Document** object's reference is added to the **`window`** object as `document_0`, `document_1`, `document_2`, etc. property.
The `document_X`s are numbered according to the order of `client.karmaHTML.source` items *(started from **`0`**)*
* To get the access to the **Document** object of `index.html` file, use `window.document_0` *(or just `document_0`)*
* To get the access to the **Document** object of `template.html` file, use `window.document_1` *(or just `document_1`)*
* etc.

> It gives you the access to the **Document** object if its iframe is appended to the DOM. Use the `open()` [method](#open) or [configure](#clientkarmahtml-auto) the **karma** `config file` setting appropriately: `client.karmaHTML.auto:true`

# Methods
The methods can be used:
1. As **global methods**; *eg. `karmaHTML.open()`*  
Then it affects **all iframes** of all `.html` files *(all files are opened at once)*
2. As **tag methods**; *eg. `karmaHTML.index.open()`*  
Then it affects **only** the iframe of the `.html` file of `index` **tag** *(the `index.html` is opened only)*

### `open()`
**Syntax:** `karmaHTML.open()` | `karmaHTML.tagName.open()`  
**Description:** Appends the **iframe** element into the DOM and loads the `.html` file.
* The `karmaHTML.open()` opens all `.html` files defined in the **karma** `config file`. If some of the `.html` files are **already opened**, the `open()` method opens only those of the `.html` files, that are not yet appended to the DOM.
* The `karmaHTML.index.open()` does the same **only** with the `.html` file of the `index` **tag**. If the particular `.html` file is **already opened**, the `open()` method is ignored.

**Parameters:** `karmaHTML.open(dimensions)`

| parameter|Syntax|Description|
|:-------------:|:-------------:|:-------------|
| *`dimensions`*|`{width:String,height:String}`| It sets the CSS width and height properties of the iframe(s). The width and height property are the equivalents of the [`karmaHTML.width`](#width) and [`karmaHTML.height`](#height) properties. If the iframe is **already opened**, only its dimensions will be changed. |

###### example
```javascript
karmaHTML.open({width:'700px',height:'10%'});   //appends the iframes for all html files with specified dimensions
karmaHTML.index.open({height:'auto'});   //appends only html file of the tag index with specified height dimension
karmaHTML.tmpl.open({width:null,height:null}); //appends html file of tmpl tag with default width and height
```

### `close()`
**Syntax:** `karmaHTML.close()` | `karmaHTML.tagName.close()`  
**Description:** Removes **iframe** from the document.
* The `karmaHTML.close()` closes *(if opened)* **all iframes** of all `.html` files defined in the **karma** `config file`.
* The `karmaHTML.tmpl.close()` does the same **only** with the `.html` file of the `tmpl` **tag**. If the particular `.html` file is **already closed**, the `close()` method is ignored.

### `reload()`
**Syntax:** `karmaHTML.reload()` | `karmaHTML.tagName.reload()`  
**Description:** Refreshes the `Document` of `.html` file(s) in the **iframes**.
* The `karmaHTML.reload()` refreshes **all opened** iframe `Document`s.
* The `karmaHTML.index.reload()` refreshes the `Document` of the `.html` file of the `index` **tag**. If the iframe is **not opened**, it opens it and loads the `.html` file instead.

# Properties
## karmaHTML properties:

### `width`
*(getter)* **Syntax:** `karmaHTML.width`  
**Return value type:** `Object`  
*(setter)* **Syntax:** `karmaHTML.width = String`  
**Description:** Sets or returns the `width` dimension of the **iframes** of all `.html` files defined in the **karma** `config file`. 

##### `karmaHTML.width`
* Returns the object of `tag:value` pairs of **all iframes** *(regardless they are appended to the DOM)*, *eg. `{index:'80%',tmpl:'600px'}`*

##### `karmaHTML.width = String`
* Sets the CSS `width` of **all iframes**, *eg. `karmaHTML.width = '50%'`*
* You can set the `width` regardless **all iframes** are appended to the DOM
* When used **before** `karmaHTML.open()`, the **iframes** will be opened with the new `width` value
* The value *(eg. `'600px'`)* is appended to the **iframe** elements as the attribute `style="width:600px"`
* All valid CSS values and units are allowed
* Incorrect values will be ignored and the `width` will not be changed
* Use `karmaHTML.width = null` to reset **all iframes** `width` CSS style to its **default values** *(to the value defined in the **karma** `config file` as `client.karmaHTML.width` [\[see above\]](#clientkarmahtml-width), or - if not defined - to the module default value `90%`)*
> Also check out `karmaHTML.index.width` [property](#width-1)  
> Also check out `karmaHTML.open()` [dimensions parameter](#open)

### `height`
*(getter)* **Syntax:** `karmaHTML.height`  
**Return value type:** `Object`  
*(setter)* **Syntax:** `karmaHTML.height = String`  
**Description:** Sets or returns the `height` dimension of the **iframes** of all `.html` files defined in the **karma** `config file`.  
It works accordingly to the `karmaHTML.width` property [\[see above\]](#width).
> Also check out `karmaHTML.index.height` [property](#height-1)

### `elementList`
**Syntax:** `karmaHTML.elementList` *(readonly)*  
**Return value type:** `Array`  
**Description:** Returns the list of HTML elements that are used to display iframes in the browser. Getting the access to any of HTML elements gives you the access to all of its DOM properties and methods. It returns the **array** of **object-type** items. The number of items returned *(and the item index)* is equal to the number *(and item index)* of `.html` files specified in the **karma** `config file`. Each item of returned array contains the properties:
* `container` - reference to the \<div\> element that contains all below elements
* `iframe` - reference to the \<iframe\> element that the `.html` files are loaded into
* `prompt` - reference to the iframe header that contains all below elements
* `state` - reference to the \<span\> element that displays the current state of `request` | `response` status of loading `.html` file
* `tag` - reference to the \<span\> element that displays the **tag** name of the current `.html` file loaded to the iframe

### `tagList`
**Syntax:** `karmaHTML.tagList` *(readonly)*  
**Return value type:** `Array`  
**Description:** Returns the list of **`Tag`** objects, generated for all `.html` files specified in the **karma** `config file`. The number of items returned *(and the item index)* is equal to the number *(and item index)* of `.html` files in **karma** `config file`. Getting the access to any of the **`Tag`** objects gives you the access to all of its [methods](#methods) and [properties](#tag-properties).

> Also check out [`karmaHTML` and `Tag` objects](#karmahtmltagname--karmahtmlnumber)

### `config`
**Syntax:** `karmaHTML.config` *(readonly)*  
**Return value type:** `Object`  
**Description:** Returns the list of **config** properties specified in the **karma** `config file`. If some of config properties where not specified in the **karma** `config file` it returns the module **default value** instead. It returns:
* `source` - returns the `client.karmaHTML.source` array [*\[see above\]*](#clientkarmahtml-source)
* `auto` - returns the `client.karmaHTML.auto` [*\[see above\]*](#clientkarmahtml-auto) *(if not specified - returns **default** `false`)*
* `width` - returns the `client.karmaHTML.width` [*\[see above\]*](#clientkarmahtml-width) *(if not specified - returns **default** `90%`)*
* `height` - returns the `client.karmaHTML.height` [*\[see above\]*](#clientkarmahtml-height) *(if not specified - returns **default** `80vh`)*
* `abort` - returns the `client.karmaHTML.abort` [*\[see above\]*](#clientkarmahtml-abort) *(if not specified - returns **default** `0`)*
* `timeout` - returns the `client.karmaHTML.timeout` [*\[see above\]*](#clientkarmahtml-timeout) *(if not specified - returns **default** `0`)*

### `length`
**Syntax:** `karmaHTML.length` *(readonly)*  
**Return value type:** `Number`  
**Description:** Returns the number of **Tag** Objects. The `length` value is equal to the number of `.html` files defined in the **karma** `config file`.
###### loop example
```javascript
var w = ['50%','700px'];
var h = ['400px','50vh'];
//loop through all Tag objects
for(var i=0; i<karmaHTML.length; i++){
  karmaHTML[i].open({width:w[i],height:h[i]});
}
```

### `onstatechange`
**Syntax:** `karmaHTML.onstatechange = function(ready,tag,status,statusText){...}`  
**Return value type:** `Function` | `undefined`  
**Description:** Take the action when the **state** of any `.html` file defined in the **karma** `config file` **changes**.

> If you want to observe **the particular** `.html` file of chosen **tag** name, rather than all `.html` files defined in the **karma** `config file`, check out `karmaHTML.index.onstatechange` [property](#onstatechange-1)

#### 1. Defining `onstatechange`:
Define `onstatechange` as a `function()`. This `function()` will be **automatically fired** in the following situations:
* the html resources are [loaded](#open) *(the `response` parameter is passed as **true**)*
* the iframe html page is [reloaded](#reload)  *(the `response` parameter is passed as **true**)*
* the iframe html page is [closed](#close) *(the `response` parameter is passed as **false**)*
* the `abort` is [terminated](#clientkarmahtml-abort) *(the `response` parameter is passed as **false**)*
* the `timeout` is [terminated](#clientkarmahtml-timeout) *(the `response` parameter is passed as **false**)*
* any error occurs during html resources loading *(the `response` parameter is passed as **false**)*

```javascript
karmaHTML.onstatechange = function(ready,tag,status,statusText){
    //some fireworks and magic here
}
```

#### 2. Parameters:
* `ready` *(Boolean)* parameter passes **`true`** if `.html` file has been loaded correctly, otherwise it passes **`false`**
* `tag` *(String)* parameter indicates which `.html` file's state has been changed
* `response` *(Number)* parameter passes HTTP numerical response message, *eg. `200`, `404`*
* `responseText` *(String)* parameter passes HTTP textual response message, *eg. `OK`, `Not Found`*

#### 3. Un-defining `onstatechange`:
To **stop** firing `onstatechange` defined `function()`, re-define `onstatechange` property with any other - than function - value type.
```javascript
karmaHTML.onstatechange = null;
karmaHTML.onstatechange = false;
karmaHTML.onstatechange = "";
```

###### **syntax example**
```javascript

karmaHTML.onstatechange = function(ready,tag,status,statusText){
    if(ready) {
       if(tag==='index') run_index_tests();
       if(tag==='tmpl') run_tmpl_tests();
    }
}
karmaHTML.open();
```

###### **jasmine syntax example**
```javascript
describe("The index.html iframe document",function(){
  beforeAll(function(done){
    karmaHTML.index.onstatechange = function(ready){
      if(ready) done(); //if the #Document is ready, fire tests!
    };
    karmaHTML.index.open();
  });
  it("should be a real Document object",function(){
    var iframeDocument = karmaHTML.index.document;
    expect(iframeDocument.constructor.name).toEqual('HTMLDocument');
  });	
});
```

## Tag properties:
> In all below contents **assume**, that your **karma** `config file` has got the `index.html` file of `index` **tag** specified.  
> Also check out [how to define tag names](#clientkarmahtml-source)

### `_root`
**Syntax:** `karmaHTML.index._root` *(readonly)*  
**Return value type:** `Object`  
**Description:** Returns the `karmaHTML` Object. It lets you get the access to the [methods](#methods) and [properties](#karmahtml-properties) of `karmaHTML` Object through `Tag` Object.

### `width`
*(getter)* **Syntax:** `karmaHTML.index.width`  
**Return value type:** `String`  
*(setter)* **Syntax:** `karmaHTML.index.width = String`  
**Description:** Sets or returns the `width` dimension of the **iframe** of the `.html` file of `index` **tag** defined in the **karma** `config file`.

##### `karmaHTML.index.width`
* Returns the `String` value of CSS width property of the **iframe** of the `.html` file of `index` **tag** *(regardless it is appended to the DOM)*, *eg. `'600px'`*

##### `karmaHTML.index.width = String`
* Sets the CSS `width` of the **iframe** of the `.html` file of `index` **tag**, *eg. `karmaHTML.index.width = '50%'`*
* You can set the `width` regardless **this iframe** is appended to the DOM
* When used **before** `karmaHTML.open()`, this **iframe** will be opened with the new `width` value
* The value *(eg. `'600px'`)* is appended to the **iframe** element as the attribute `style="width:600px"`
* All valid CSS values and units are allowed
* Incorrect values will be ignored and the `width` will not be changed
* Use `karmaHTML.index.width = null` to reset **this iframe** `width` CSS style to its **default value** *(to the value defined in the **karma** `config file` as `client.karmaHTML.width` [\[see above\]](#clientkarmahtml-width), or - if not defined - to the module default value `90%`)*
> Also check out `karmaHTML.width` [parameter](#width)  
> Also check out `karmaHTML.index.open()` [dimensions parameter](#open)

### `height`
*(getter)* **Syntax:** `karmaHTML.index.height`  
**Return value type:** `String`  
*(setter)* **Syntax:** `karmaHTML.index.height = String`  
**Description:** Sets or returns the `height` dimension of the **iframe** of the `.html` file of `index` **tag** defined in the **karma** `config file`. It works accordingly to the `karmaHTML.index.width` property [\[see above\]](#width-1).
> Also check out `karmaHTML.height` [parameter](#height)  
> Also check out `karmaHTML.index.open()` [dimensions parameter](#open)

### `tag`
**Syntax:** `karmaHTML.index.tag` *(readonly)*  
**Return value type:** `String`  
**Description:** Returns the `String` value of the **tag name** of the current **Tag** object *(regardless its iframe is appended to the DOM)*; *eg. `karmaHTML.index.tag` returns `'index'`*

### `itemNum`
**Syntax:** `karmaHTML.index.itemNum` *(readonly)*  
**Return value type:** `Number`  
**Description:** Returns the `Number` value of the array **index position** of the `.html` file of `index` **tag** defined in the **karma** `config file` `client.karmaHTML.sources` array *(regardless this iframe is appended to the DOM)*.  
Assuming, that the **karma** `config.file` `client.karmaHTML.source` array contains `index.html` file of `index` tag as the first item, and `template.html` file of `tmpl` tag as the second item, the `karmaHTML.index.itemNum` will return `0` and `karmaHTML.tmpl.itemNum` will return `1`.

### `document`
**Syntax:** `karmaHTML.index.document` *(readonly)*  
**Return value type:** `HTMLDocument` | `null`  
**Description:** Returns the HTML `Document` object of the `.html` file of `index` **tag** defined in the **karma** `config file`. If the **iframe** of this `.html` file is **not appended** to the DOM, there's an error occurance, or when the timeout or abort has terminated, it returns `null`.
> Also check out [iframe **Document** object access](#iframe-document-object-access)

### `iframe`
**Syntax:** `karmaHTML.index.iframe` *(readonly)*  
**Return value type:** `HTMLIFrameElement`  
**Description:** Returns the `HTMLIFrameElement` object of the `.html` file of `index` **tag** defined in the **karma** `config file` *(regardless this iframe is appended to the DOM)*.
> Also check out `karmaHTML.elementList` [property](#elementlist)

### `src`
**Syntax:** `karmaHTML.index.src` *(readonly)*  
**Return value type:** `String`  
**Description:** Returns the `String` **url path** of the `.html` file of `index` **tag** defined in the **karma** `config file` *(regardless this iframe is appended to the DOM)*.
> Also check out `client.karmaHTML.source` [property](#clientkarmahtml-source)

### `hasIframe`
**Syntax:** `karmaHTML.index.hasIframe` *(readonly)*  
**Return value type:** `Boolean`  
**Description:** Returns **`true`**, if the **iframe**  of the `.html` file of `index` **tag** defined in the **karma** `config file` is **appended** to the DOM, otherwise it returns **`false`**.

> Also check out `karmaHTML.open()` [method](#open)  
> Also check out `karmaHTML.close()` [method](#close)

### `ready`
**Syntax:** `karmaHTML.index.ready` *(readonly)*  
**Return value type:** `Boolean`  
**Description:** Returns **`true`**, if the **iframe** of the `.html` file of `index` **tag** defined in the **karma** `config file` is both **appended** to the **DOM** and **loaded correctly** *(with no errors, timeout or abort terminated)*, otherwise it returns **`false`**.

If you set your **karma** `config file` `client.karmaHTML.auto` property to `true`, your `.html` files may be loaded before you define `onstatechange` property to catch the moment of loading finish. Then you can use the following code, to check out, whether your `.html` file is already loaded:
```javascript
if(karmaHTML.index.ready) run_index_tests();
```

### `onstatechange`
**Syntax:** `karmaHTML.index.onstatechange = function(ready,tag,status,statusText){...}`  
**Return value type:** `Function` | `undefined`  
**Description:** Take the action when the **state** of the `.html` file of `index` **tag** defined in the **karma** `config file` **changes**.

> If you want to observe **all** `.html` files defined in the **karma** `config file`, rather than the `.html` file of chosen **tag** name, see `karmaHTML.onstatechange` [property](#onstatechange)

#### 1. Defining `onstatechange`:
Define `onstatechange` as a `function()`. This `function()` will be **automatically fired** in the following situations:
* the html resources are [loaded](#open) *(the `response` parameter is passed as **true**)*
* the iframe html page is [reloaded](#reload)  *(the `response` parameter is passed as **true**)*
* the iframe html page is [closed](#close) *(the `response` parameter is passed as **false**)*
* the `abort` is [terminated](#clientkarmahtml-abort) *(the `response` parameter is passed as **false**)*
* the `timeout` is [terminated](#clientkarmahtml-timeout) *(the `response` parameter is passed as **false**)*
* any error occurs during html resources loading *(the `response` parameter is passed as **false**)*

```javascript
karmaHTML.index.onstatechange = function(ready,tag,status,statusText){
    //some fireworks and magic here
}
```

#### 2. Parameters:
* `ready` *(Boolean)* parameter passes **`true`** if `.html` file has been loaded correctly, otherwise it passes **`false`**
* `tag` *(String)* parameter indicates which `.html` file's state has been changed; *(with `karmaHTML.index.onstatechange` it always will be `index`)*
* `response` *(Number)* parameter passes HTTP numerical response message, *eg. `200`, `404`*
* `responseText` *(String)* parameter passes HTTP textual response message, *eg. `OK`, `Not Found`*

#### 3. Un-defining `onstatechange`:
To **stop** firing `onstatechange` defined `function()`, re-define `onstatechange` property with any other - than function - value type.
```javascript
karmaHTML.index.onstatechange = null;
karmaHTML.index.onstatechange = false;
karmaHTML.index.onstatechange = "";
```

###### **syntax example**
```javascript
karmaHTML.index.onstatechange = function(ready){
    if(ready) run_index_tests();
}
karmaHTML.tmpl.onstatechange = function(ready){
    if(ready) run_tmpl_tests();
}

karmaHTML.index.open();
karmaHTML.tmpl.open();
```

> Also check out [jasmine example](#jasmine-syntax-example)

# Common problems
#### 1. `fs` `glob` Errors in your CMD 
If you use **Webpack**, it is recommended to add `node: {fs: "empty"}` to your **webpack** `config file`, in order to avoid `fs` module problems when loading `karma-html`

# Examples
#### 1. Test your `.html` files of tag `'index'` and `'tmpl'` separately
```javascript
karmaHTML.index.onstatechange = function(state){
  if(state){
    run_index_tests();
    this.close(); //or karmaHTML.index.close();
    this._root.tmpl.open(); //or karmaHTML.tmpl.open();
  }
};
karmaHTML.tmpl.onstatechange = function(state){
  if(state){
    run_tmpl_tests();
    this.close(); //or karmaHTML.tmpl.close();
  }
};

karmaHTML.index.open();
```

# Step-by-step configuration
We will use `Jasmine` framework for testing, `Mocha` reporter to report our tests results in the terminal, **`karmaHTML`** package to test our html files, `karma-jasmine-dom` package to test DOM objects with DOM custom matchers and `Chrome` browser to run our html templates for testing.
1. Create new folder `New project` anywhere and create the following folders and files *(empty)* structure inside of it:
```
New project
 ├ tests
 │  └ tests.js
 ├ karma.conf.js
 └ index.html
```
2. Open the `New project` folder and open your terminal there *(with the location set to `New project` folder)*
3. Install neccessary packages with npm by executing the following command:
    * `npm install karma karma-jasmine jasmine-core karma-chrome-launcher karma-mocha-reporter karma-html karma-jasmine-dom`
4. In the `karma.conf.js` file add the following content:
```javascript
module.exports = function(config) {
  config.set({
    files: [
      {pattern: 'tests/*.js',watched:true,served:true,included:true}
    ],
    //load karma-mocha-reporter and karma-html
    reporters: ['mocha','karmaHTML'],
    //load karma-jasmine-dom and karma-jasmine
    frameworks: ['jasmine-dom','jasmine'],
    //load karma-chrome-launcher
    browsers: ['Chrome'],
    client: {
      //If false, Karma will not remove iframes upon the completion of running the tests
      clearContext:false,
      //karma-html configuration
      karmaHTML: {
        source: [
          //indicate 'index.html' file that will be loaded in the browser
          //the 'index' tag will be used to get the access to the Document object of 'index.html'
          {src:'./index.html', tag:'index'}
        ],
        auto: true
      }
    }
  });
};
```
5. It should work just fine right now, run `karma start` in the terminal and it should:
    * prompt the positive tests results in the terminal
    * open the Chrome browser and display the **iframe** with our *(empty)* `index.html` template
6. Add the following HTML content example to our `index.html` file:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>New project</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <h3 id="header">Hello world!</h3>
    <p id="paragraph">This is our html template.</p>
  </body>
</html>
```
7. Add the following jasmine test suits into our `tests/tests.js` file:
```javascript
//describe, beforeAll, it, expext - are the Jasmine default methods
//karmaHTML is the karma-html package object with the access to all its features

describe("The index.html iframe document",function(){
  
  beforeAll(function(done){
    //load DOM custom matchers from karma-jasmine-dom package
    jasmine.addMatchers(DOMCustomMatchers);
    
    //lets open our 'index.html' file in the browser by 'index' tag as you specified in 'karma.conf.js'
    karmaHTML.index.open();
    
    //karmaHTML.index.onstatechange fires when the Document is loaded
    //now the tests can be executed on the DOM
    karmaHTML.index.onstatechange = function(ready){
      //if the #Document is ready, fire tests
      //the done() callback is the jasmine native async-support function
      if(ready) done();
    };
  });
  
  it("should be a real Document object",function(){
    var _document = karmaHTML.index.document;
    expect(_document.constructor.name).toEqual('HTMLDocument');
  });
  
  it("should contain paragraph and header that are the siblings",function(){
    //karmaHTML.index.document gives the access to the Document object of 'index.html' file
    var _document = karmaHTML.index.document;
    //use all document javascript native methods on it
    var header = _document.getElementById('header');
    var paragraph = _document.getElementById('paragraph');
    
    //these are the karma-jasmine-dom custom matchers
    expect(paragraph).toBeNextSiblingOf(header);
    expect(header).toBePreviousSiblingOf(paragraph);
  });
});
```

6. Run `karma start` again in the terminal and it should:
    * prompt the positive two tests results in the terminal
    * open the Chrome browser and display the **iframe** with our `index.html` template loaded to run the tests on its DOM
7. Read the documentation above to use all the features of `karma-html`!