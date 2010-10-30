//script get XML using Ajex
function getXML(xmlDirectory)
{
	if (window.XMLHttpRequest) {
    	xhttp=new XMLHttpRequest();
	}
 	else // for older IE 5/6
    {
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
 	xhttp.open("GET",xmlDirectory,false)
 	xhttp.send("");
 	txtDoc=xhttp.responseText;
    if (window.DOMParser) {
    	parser=new DOMParser();
    	xmlDoc=parser.parseFromString(txtDoc,"text/xml");
   	}
 	else {// Internet Explorer
    	xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
    	xmlDoc.async="false";
    	xmlDoc.loadXML(txtDoc); 
    }
    return xmlDoc;
}

//trim function to remove spaces in a word if necessary
String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

/*call of using YUI function, need to include YUI js and css in order to run. Please check the index.html or Yahoo YUI webiste for instruction. 
"event-mouseenter" is responsible for detecting the mouse event, whne moving mouse over some words; 
"overlay" is used for display YUI overlay where show all the images insdie.
"admin" and "plugin" (animation) are for display and hide overlay with fade in/out transitions.
*/

YUI().use("event-synthetic", "event-mouseenter", "overlay", "anim", "plugin", function (Y) {

       /* Animation Plugin Constructor */
    function AnimPlugin(config) {
        AnimPlugin.superclass.constructor.apply(this, arguments);
    }

    /* 
     * The namespace for the plugin. This will be the property on the widget, which will 
     * reference the plugin instance, when it's plugged in
     */
    AnimPlugin.NS = "fx";

    /*
     * The NAME of the AnimPlugin class. Used to prefix events generated
     * by the plugin class.
     */
    AnimPlugin.NAME = "animPlugin";

    /*
     * The default set of attributes for the AnimPlugin class.
     */
    AnimPlugin.ATTRS = {

        /*
         * Default duration. Used by the default animation implementations
         */
        duration : {
            value: 0.3
        },

        /*
         * Default animation instance used for showing the widget (opacity fade-in)
         */
        animVisible : {
            valueFn : function() {

		var host = this.get("host");
                var boundingBox = host.get("boundingBox");

                var anim = new Y.Anim({
                    node: boundingBox,
                    to: { opacity: 1 },
                    duration: this.get("duration")
                });

                // Set initial opacity, to avoid initial flicker
                if (!host.get("visible")) {
                    boundingBox.setStyle("opacity", 0);
                }

                // Clean up, on destroy. Where supported, remove
                // opacity set using style. Else make 100% opaque
                anim.on("destroy", function() {
                    if (Y.UA.ie) {
                        this.get("node").setStyle("opacity", 1);
                    } else {
                        this.get("node").setStyle("opacity", "");
                    }
                });

                return anim;
            }
        },

        /*
         * Default animation instance used for hiding the widget (opacity fade-out)
         */
        animHidden : {
            valueFn : function() {
                return new Y.Anim({
                    node: this.get("host").get("boundingBox"),
                    to: { opacity: 0 },
                    duration: this.get("duration")
                });
            }
        }
    }

    /*
     * Extend the base plugin class
     */
    Y.extend(AnimPlugin, Y.Plugin.Base, {

        /*
         * Initialization code. Called when the 
         * plugin is instantiated (whenever it's 
         * plugged into the host)
         */
        initializer : function(config) {
            this._bindAnimVisible();
            this._bindAnimHidden();

            this.after("animVisibleChange", this._bindAnimVisible);
            this.after("animHiddenChange", this._bindAnimHidden);

            // Override default _uiSetVisible method, with custom animated method
            this.doBefore("_uiSetVisible", this._uiAnimSetVisible);
        },

        /*
         * Destruction code. Invokes destroy in the individual animation instances,
         * and lets them take care of cleaning up any state.
         */
        destructor : function() {
            this.get("animVisible").destroy();
            this.get("animHidden").destroy();
        },

        /*
         * The custom animation method, added by the plugin.
         *
         * This method replaces the default _uiSetVisible handler
         * Widget provides, by injecting itself before _uiSetVisible,
         * (using Plugins before method) and preventing the default
         * behavior.
         */
        _uiAnimSetVisible : function(val) {
            if (this.get("host").get("rendered")) {
                if (val) {
                    this.get("animHidden").stop();
                    this.get("animVisible").run();
                } else {
                    this.get("animVisible").stop();
                    this.get("animHidden").run();
                }
                return new Y.Do.Prevent("AnimPlugin prevented default show/hide");
            }
        },

        /*
         * The original Widget _uiSetVisible implementation
         */
        _uiSetVisible : function(val) {
            var host = this.get("host");
            var hiddenClass = host.getClassName("hidden");
            if (!val) {
                host.get("boundingBox").addClass(hiddenClass);
            } else {
                host.get("boundingBox").removeClass(hiddenClass);
            }
        },

        /* Sets up call to invoke original visibility handling when the animVisible animation is started */
        _bindAnimVisible : function() {
            var animVisible = this.get("animVisible");

            // Setup original visibility handling (for show) before starting to animate
            animVisible.on("start", Y.bind(function() {
                this._uiSetVisible(true);
            }, this));
        },

        /* Sets up call to invoke original visibility handling when the animHidden animation is complete */
        _bindAnimHidden : function() {
            var animHidden = this.get("animHidden");

            // Setup original visibility handling (for hide) after completing animation
            animHidden.after("end", Y.bind(function() {
                this._uiSetVisible(false);
            }, this));
        }
    });

    // Create a new Overlay instance, and add AnimPlugin with a default duration of 2 seconds
    var overlay = new Y.Overlay({
        srcNode: "#overlay",
//        width:"10em",
//        height:"10em",
        visible:false,
        shim:false,
        align: {
            node: "#demo", 
            points: ["tl", "bl"]
        },
        plugins : [{fn:AnimPlugin, cfg:{duration:0.5}}]
    });
    overlay.render();
  
        

    
    Y.Event.define("hover", {
        processArgs: function (args) {
            // Args received here match the Y.on(...) order, so
            // [ 'hover', onHover, "#demo p", endHover, etc ]
            var mouseleave = args[3];
            args.splice(3,1);
 
            // This will be stored in the subscription's '_extra' property
            return mouseleave;
        },
 
        on: function (node, sub, notifier) {
            var mouseleave = sub._extra;
 
            // To make detaching the associated DOM events easy, use a
            // detach category, but keep the category unique per subscription
            // by creating the category with Y.guid()
            sub._evtGuid = Y.guid() + '|';
 
            node.on( sub._evtGuid + "mouseenter", function (e) {
                // Firing the notifier event executes the hover subscribers
                notifier.fire(e);
            });
 
            node.on(sub._evtGuid + "mouseleave", mouseleave);
        }
    } );
    var temp = "string";
    function onHover(e) {
        this.addClass("hover");
        temp = e.currentTarget.toString();
        var nodeName = temp.substring(4,temp.indexOf("yui"));
        nodeName=nodeName.trim();
        temp = nodeName.substring(1,nodeName.length);
        var keyword = document.getElementById(temp).innerHTML;
        document.getElementById("overlaybody").innerHTML = keyword;
        overlay.set("align", {node:nodeName, points: ["tl", "bl"]});
        overlay.show();
    }
    function endHover(e) {
        this.removeClass("hover");
        overlay.hide();
    }
    
    var Dom = YAHOO.util.Dom,
	Event = YAHOO.util.Event;

var onLIClick = function (event, matchedEl, container) {

//	if (Dom.hasClass(matchedEl, "selected")) {
//		Dom.removeClass(matchedEl, "selected");		
//	}
//	else {
//		Dom.addClass(matchedEl, "selected");
//	}
    this.title = parseInt(this.title)+1;
    document.getElementById("overlaybody").innerHTML = "<img src=\""+getPicturePath(this.innerHTML.toString(),this.title)+"\">";
        

};

//	Use the "delegate" method to attach a "click" event listener to the 
//	container (<div id="container">).  The listener will only be called if the 
//	target of the click event matches the element specified via the CSS 
//	selector passed as the fourth argument to the delegate method.

Event.delegate("container", "click", onLIClick, "span");


/*the path we used to retrieve image from Yahoo Image search and Flickr. Can replace with Google, Bings, etc..
The default query is for searching a cat, replace with your own if you like or by appending your search phase
*/
var getPicturePath = function(keyword, count)
{
    var urlAddress;
    if (document.getElementById('picker').value=="flickr")
   		urlAddress ="http://query.yahooapis.com/v1/public/yql?q=select%20%20source%20from%20flickr.photos.sizes%20where%20label%3D%22Small%22%20and%20photo_id%20in%20(select%20id%20from%20flickr.photos.search%20where%20tags%3D%22Cat%22)%20limit%2010&diagnostics=true";
    
    else
		urlAddress="http://query.yahooapis.com/v1/public/yql?q=select%20url%20from%20search.images%20where%20query%3D%22Cat%22%20and%20dimensions%3D%22medium%22&diagnostics=true";
    
    
    urlAddress = urlAddress.replace("Cat",keyword);
    var xmlDoc=getXML(urlAddress);
    
    var aUrl;
    if (document.getElementById('picker').value=="flickr")
   		aUrl=xmlDoc.getElementsByTagName("size")[count].getAttribute("source");
    else
		aUrl=xmlDoc.getElementsByTagName("result")[count].getElementsByTagName("url")[0].childNodes[0].textContent;

    return(aUrl);
}

/*function to be called when mouseover event call back.*/
var onLIMouseOver = function (event, matchedEl, container) {
	//add class of hover: display text in another color
	Dom.addClass(matchedEl, "hover");
        document.getElementById("overlaybody").innerHTML = "<img src=\""+getPicturePath(this.innerHTML.toString(),this.title)+"\">";
        overlay.set("align", {node:'#'+this.id.toString(), points: ["tl", "bl"]});
        overlay.show();
		//add and show overlay with image inside, the image src is retrieved by calling function getPicturePath.
};


/*Mouse out event, remove class and hide the overlay*/
var onLIMouseOut = function (event, matchedEl, container) {

	Dom.removeClass(matchedEl, "hover");
	overlay.hide();
	
};


//	Use the "delegate" method to attach a mouseover and mouseout event listener 
//	to the container (<div id="container">).  The listener will only be called  
//	if the target of the click event matches the element specified via the CSS 
//	selector passed as the fourth argument to the delegate method.

Event.delegate("container", "mouseover", onLIMouseOver, "span");
Event.delegate("container", "mouseout", onLIMouseOut, "span");


//	Add a click event listener to the button that will add new items to the list
//	to illustrate that new items can be added and the existing click, mouseover,
//	and mouseout event listeners will apply to them as well.

Event.on("add-item", "click", function (event) {
//called when click on the text.
	var list = Dom.get("list"),
		items = Dom.getChildren(list),
 		nItemNumber = (items.length + 1),
 		fragment = Dom.get("container").ownerDocument.createElement("div");
	
	//fragment.innerHTML = '<span id ="span-'+ nItemNumber +'" title="0">List Item ' + nItemNumber + '</span>';
    list.appendChild(fragment.firstChild);
	
});
    
} );//end of YUI.use() function


/*function deal with input of text from the textbox. It will go through each words in the entire streing and split them into words stored in an array. hword is a collection of word, that we will not gain access to the image, because they are eigher too general or meaningless. You can add more to filter out unwnated word.

function will also omit any word with length shortter than two. function called when user click on the button. 

When the text is very long, it takes time to run this javascript. More efficient algorithm needed. Since we finished this within 24hr.
*/
function updateTXT() {
	//a collection of words that are filtered out
	var hword = new Array ("the","want","with","took","him","when","said","heard","that","let's","bought","day","one","you");
	//
	if (document.getElementById('txt').value=="") { //return if no text
		alert("Please input your story!");
		return;
	}
	var outStr = document.getElementById('list');
	outStr.innerHTML="";
	var text = document.getElementById('txt').value.split(" "); //split by space
	var no_labeled=0;
	var i;
	for (i=0; i<text.length;i++) {
		var perfix=""; //need to store any special char at beginning of the word, punctuations.
		var surfix="";//for storing at end of word. will output them later
		var no_perfix=0;
		var no_surfix=0;
		for (m=0;m<text[i].length;m++) {
			if ((text[i].charAt(m)>='a' && text[i].charAt(m)<='z') || (text[i].charAt(m)>='A' && text[i].charAt(m)<='Z') || (text[i].charAt(m)>='0' && text[i].charAt(m)<='9')) {
				break;
			}
			else {
				perfix+=text[i].charAt(m);//append punctuations and increase counter;
				no_perfix
			}
		}
		
		for (n=text[i].length-1;n>=0; n--) {
			if ((text[i].charAt(n)>='a' && text[i].charAt(n)<='z') || (text[i].charAt(n)>='A' && text[i].charAt(n)<='Z') || (text[i].charAt(n)>='0' && text[i].charAt(n)<='9')) {
				break;
			}
			else {
				surfix+=text[i].charAt(n);
				no_surfix++;
			}
		}
		//get substr from the result we derived above, get word without punctuation at beginning or at the end.
		var tText = text[i].substring(no_perfix,text[i].length-no_surfix);
		var hideword=false;
		if (tText.length>=3) {//check if string length equals to longer than 3.
			for (k=0;k<hword.length;k++) {
				if (tText==hword[k]) {
					hideword=true;
					break;
				}
			}
		}
		if (tText.length>=3 && hideword==false) {
			no_labeled++;
			if (no_perfix!=0)
				outStr.innerHTML+=perfix;
			outStr.innerHTML+="<span id='span-"+no_labeled+"' class='wblock' title='0'>"+tText+" </span>";
			if (no_surfix!=0)
				outStr.innerHTML+=surfix;
		}
		else {
			if (no_perfix!=0)
				outStr.innerHTML+=perfix;
			outStr.innerHTML+=tText;
			outStr.innerHTML+=" ";
			if (no_surfix!=0)
				outStr.innerHTML+=surfix;
		}
	}
}