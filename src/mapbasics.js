
// Detecção de browser, Rob W, rob@robwu.nl
var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isFirefox = /Firefox/.test(navigator.userAgent);   // Firefox 1.0+
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isEdge = /Edge/.test(navigator.userAgent);
var isWin = navigator.platform.indexOf('Win') === 0;

/**
 * This function returns a copy of its input object.
 * @param {Object} obj any object
 * @returns {Object} a fresh copy of that object.
 */ 
 function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = new obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
}

function setClass(p_node, p_class_str) {
	p_node.classList.add(p_class_str);
}

var MOUSEBTN_LEFT = 1;
var MOUSEBTN_MIDDLE = 2;
var MOUSEBTN_RIGHT = 4;

function filterMouseButton(evt, mouseButtonMask) {
	var ret = false;
	var butprop = 'which';
	var val = -1;
	
	if (typeof evt.which != 'undefined')
	{
		val = evt.which;
		if (val == 1 && (mouseButtonMask & MOUSEBTN_LEFT) == MOUSEBTN_LEFT) // 0, 1
		{
			ret = true;
		}
		else if (val == 2 && (mouseButtonMask & MOUSEBTN_MIDDLE) == MOUSEBTN_MIDDLE) // 1, 2
		{
			ret = true;
		}
		else if (val == 3 && (mouseButtonMask & MOUSEBTN_RIGHT) == MOUSEBTN_RIGHT) // 3, 2
		{
			ret = true;
		}
	}
	else if (typeof evt.button != 'undefined')
	{
		butprop = 'button';
		val = evt.button;
		if (evt.button == 1 && (mouseButtonMask & MOUSEBTN_LEFT) == MOUSEBTN_LEFT)
		{
			ret = true;
		}
		else if (evt.button == 4 &&  (mouseButtonMask & MOUSEBTN_MIDDLE) == MOUSEBTN_MIDDLE)
		{
			ret = true;
		}
		else if (evt.button == 2 && (mouseButtonMask & MOUSEBTN_RIGHT) == MOUSEBTN_RIGHT)
		{
			ret = true;
		}
	}
	
	return [butprop, val, ret];
}

function getTarget(e) {
	var targ;
	if (!e) var e = window.event;
	if (e.target) targ = e.target;
	else if (e.srcElement) targ = e.srcElement;
	try {
		if (targ.nodeType == 3) // defeat Safari bug
			targ = targ.parentNode;
	} catch(e) {
		// do nothing
	};
	return targ;
}

function ajaxSender(url, reqListener, postdata, opt_req, opt_cors_compatmode, opt_rec_blob) {
	var oReq
	if (opt_req != null) {
		oReq = opt_req;
	} else {
		if (opt_cors_compatmode && typeof XDomainRequest != 'undefined') {
			oReq = new XDomainRequest();
		} else {
			oReq = new XMLHttpRequest();
		}
	}
	
	if (opt_cors_compatmode && typeof XDomainRequest != 'undefined') {	
		oReq.onload = reqListener;
	} else {
		oReq.onreadystatechange = reqListener;
	}
	
	var meth, finalurl;
	
	if (postdata != null)
	{
		meth = "POST";
		finalurl = url;
		//finalurl = url + ((/\?/).test(url) ? "&_ts=" : "?_ts=") + (new Date()).getTime();
	}
	else
	{
		meth = "GET";
		//finalurl = url;
		// para prevenir o caching dos pedidos 
		finalurl = url + ((/\?/).test(url) ? "&_ts=" : "?_ts=") + (new Date()).getTime();
	}

	if (opt_cors_compatmode && typeof XDomainRequest != 'undefined') {
		oReq.open(meth, finalurl);
	} else {
		oReq.open(meth, finalurl, true);
	}

	if (postdata && oReq.setRequestHeader !== undefined && oReq.setRequestHeader != null)
	{
		oReq.setRequestHeader('Content-type','application/json');  
	}
	if (oReq.setRequestHeader) {
		oReq.setRequestHeader('X-Requested-With', 'XMLHttpRequest');  // Tells server that this call is made for ajax purposes.
	}
	
	if (opt_rec_blob) {
		oReq.responseType = 'blob';
	}
	
	oReq.send(postdata);
	
	return oReq;

}

function finishEvent(e){
	//console.log('finish event');
    if(e.stopPropagation) {
		e.stopPropagation();
	} else {
		e.cancelBubble=true;
	}
    if(e.preventDefault) {
		e.preventDefault();
	}
    return false;
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		} 
	}
	return "";
}

function setCookie(p_name, p_value) {
	document.cookie = p_name + "=" + p_value;
}

function formatPaddingDigits(inValue,digit,numDigits) {
	var outstr = inValue.toString();
	
	for (var i=0; i<numDigits; i++)
	{
		if (outstr.length >= numDigits) {
			break;
		}
		
		outstr = digit.toString() + outstr;	
	}
	
	return outstr;
}

function formatFracDigits(inValue,numFracDigits) {
	if (typeof(myString) == "string") 
	{
		origNumber = parseFloat(inValue);
	}
	else 
	{
		origNumber = inValue;
	}
	
	power10 = Math.pow(10,numFracDigits);
	valNumerico=Math.round(origNumber*power10)/power10;
	
	strNumerica = valNumerico.toString();
	
	var sepChar = ",";
	var splitResults = strNumerica.split(sepChar);
	if (splitResults.length < 2)
	{
		sepChar = ".";
		splitResults = strNumerica.split(sepChar);
	}

	zeros = "00000000000000000";
	var result = "";
	if (splitResults.length == 2)
	{
		intPart = splitResults[0];
		fracPart = splitResults[1].substr(0,numFracDigits);
		padStr = "";
		if (fracPart.length < numFracDigits)
		{
			padStr = zeros.substr(0,(numFracDigits-fracPart.length));
		}
		if (numFracDigits==0)
			result = intPart;
		else
			result = intPart + sepChar + fracPart + padStr;
	}	
	else if (splitResults.length == 1)
	{
		intPart = splitResults[0];
		fracPart = zeros.substr(0,numFracDigits);
		if (numFracDigits==0)
			result = intPart;
		else
			result = intPart + sepChar + fracPart;
	}
	
	return result;
}

function showLoaderImg()
{
	var el = document.getElementById('loaderimg');	
	if (el)
	{
		el.style.display = '';
	}
}

function hideLoaderImg()
{
	var el = document.getElementById('loaderimg');	
	if (el)
	{
		el.style.display = 'none';
	}
}

function extend(ChildClass, ParentClass) {
	ChildClass.prototype = new ParentClass();
	ChildClass.prototype.constructor = ChildClass;
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

// @function getWheelDelta(ev: DOMEvent): Number
// Gets normalized wheel delta from a mousewheel DOM event, in vertical
// pixels scrolled (negative if scrolling down).
// Events from pointing devices without precise scrolling are mapped to
// a best guess of 60 pixels -- Leaflet.JS

var wheelPxFactor = (isWin && isChrome) ? 2 * window.devicePixelRatio :
	isFirefox ? window.devicePixelRatio : 1;
 
function getWheelDelta(e) {
	return (isEdge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
	       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / wheelPxFactor : // Pixels
	       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
	       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
	       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
	       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
	       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
	       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
	       0;
}

MOUSE_WHEEL_SENSITIVITY = 1.0;
// creates a global "addWheelListener" method
// example: addWheelListener( elem, function( e ) { console.log( e.deltaY ); e.preventDefault(); } );

(function(window,document) {

    var prefix = "", _addEventListener, onwheel, support;

    // detect event model
    if ( window.addEventListener ) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
              document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
              "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
    
    window.addWheelListener = function( elem, callback, useCapture ) {
        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support == "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
    };

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
        	
            !originalEvent && ( originalEvent = window.event );

            // create a normalized event object
            var event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                deltaZ: 0,
                pageX: originalEvent.pageX,
                pageY: originalEvent.pageY,
                preventDefault: function() {
                    originalEvent.preventDefault ?
                        originalEvent.preventDefault() :
                        originalEvent.returnValue = false;
                }
            };
            
            // calculate deltaY (and deltaX) according to the event
            if ( support == "mousewheel" ) {
                event.deltaY = - MOUSE_WHEEL_SENSITIVITY * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                originalEvent.wheelDeltaX && ( event.deltaX = - MOUSE_WHEEL_SENSITIVITY * originalEvent.wheelDeltaX );
            } else {
                event.deltaY = originalEvent.detail;
            }
            
            // it's time to fire the callback
            return callback( event );

        }, useCapture || false );
    }

})(window,document);

function CallSequence(p_activate) {
	this.active = false;
	this.method = "";
	this.function_invocations = {};
	this.function_messages = {};
	this.sequence = [];
	this.activate = function() {
		this.active = true;
	}
	if (p_activate) {
		this.activate();
	}
	this.clear = function() {
		if (!this.active) {
			return;
		}
		this.method = "";
		this.function_invocations = {};
		this.sequence.length = 0;
	};
	this.init = function(p_method) {
		if (!this.active) {
			return;
		}
		this.clear();
		this.method = p_method;
	};
	this.rollout = function(opt_doclear) {
		if (!this.active) {
			return;
		}
		if (this.sequence.length < 1) {
			return;
		}
		console.log("");
		console.log("*****************************************");
		console.log("** Calling Sequence                    **");
		console.log("*****************************************");
		console.log(String.format("*  method: {0}", this.method));
		console.log("*");
		var fname, tstr, seq;
		for (var i=0; i<this.sequence.length; i++) {
			fname = this.sequence[i][0];
			tstr = this.sequence[i][2].toISOString().slice(11,23);
			seq = formatPaddingDigits(i,'0',2);
			console.log(String.format("{0}, {1}: >> calling {2}{3}",seq,tstr,fname,JSON.stringify(this.sequence[i][1], null, 2)));
			for (var j=0; j<this.function_messages[fname].length; j++) {
				tstr = this.function_messages[fname][j][1].toISOString().slice(11,23);
				console.log(String.format("    {0} {1}",tstr,this.function_messages[fname][j][0]));
			}
		}
		console.log("*****************************************");
		if (opt_doclear) {
			this.clear();
		}
	};
	this.calling = function(p_fname, p_args, p_caller) {
		var full_fname, invocation_count = 0;
		if (!this.active) {
			return;
		}
		if (this.method.length < 1) {
			throw new Error("CallSequence.calling error, object not inited.");
		}
		if (this.function_invocations[p_fname] !== undefined && this.function_invocations[p_fname] != null) {
			invocation_count = this.function_invocations[p_fname];
		}
		invocation_count++;
		this.function_invocations[p_fname] = invocation_count;
		full_fname = String.format("{0}_{1}", p_fname, formatPaddingDigits(invocation_count,'0',2))
		this.sequence.push([full_fname, p_args, new Date()]);
		this.function_messages[full_fname] = [];
		return invocation_count;
	};
	this.addMsg = function(p_fname, p_invocation, p_msg) {
		var full_fname;
		if (!this.active) {
			return;
		}
		full_fname = String.format("{0}_{1}", p_fname, formatPaddingDigits(p_invocation,'0',2))
		if (this.function_messages[full_fname] === undefined) {
			throw new Error(String.format("CallSequence.addMsg: function '{0}', invocation {1}, not found", p_fname, p_invocation));
		}
		this.function_messages[full_fname].push([p_msg, new Date()]);
	}
};