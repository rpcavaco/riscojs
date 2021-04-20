
var MapCtrlConst = {
	MMPD: 25.4 / 96.0,
	ACCPTBLE_LYRREDRAW_DELAY_MSEC: 10,
	MAPCHANGE_TIMEOUT_MSEC: 8000,
	SPINDEX_STEP: 10,
	MAXSCALE_VALUE: 9999999999,
	CLEARMODE_ALL: 0,
	CLEARMODE_RASTER: 2,
	CLEARMODE_VECTOR: 4,
	REFRESH_VECTORS: 2,
	REFRESH_RASTERS: 4,
	MINSCALE: 100,
	MAXLAYERCOUNT: 300,
	TOCBCKGRDCOLOR: "rgba(24, 68, 155, 0.85)",
	DEFAULT_USE_SCREEN_COORD_SPACE: true
};

// opt_alternate_Layer - indica se o filtro se destina a ser aplicado APENAS
// quando a layer indicada em lname não está visível
function LayerFilter(p_lname, p_fieldname, p_fieldvalue, opt_alternate_Layer) {
	
	this.lname = p_lname;
	this.fname = p_fieldname;
	this.fvalue = p_fieldvalue;
	
	if (opt_alternate_Layer) {
		this.alternate_Layer = true;
	} else {
		this.alternate_Layer = false;
	}

	this.getLayerName = function() {
		return this.lname;
	}

	this.getIsAlternateLayer = function() {
		return this.alternate_Layer;
	}
	
	this.toURLStr = function() {
		return String.format("{0},{1},{2}", this.lname, this.fname ,this.fvalue);
	}
	
	this.toShortURLStr = function() {
		return String.format("{0},{1}", this.fname ,this.fvalue);
	}
	
}

function rasterLayerCounter(p_name) {
	
	this.loaded = 0;
	this.totalrequests = 0;
	this.errors = 0;
	this.name = p_name;
	
	this.init = function(totalImgRequests) {
		this.loaded = 0;
		this.totalrequests = totalImgRequests;
	};

	this.reset = function() {
		this.loaded = 0;
		this.totalrequests = 0;
		this.errors = 0;
	};

	this.hasRequests = function() {
		return (this.totalrequests > 0);
	};
	
	this.allLoaded = function() {
		return (this.loaded == this.totalrequests);
	};
	
	this.incrementLoaded = function() {
		this.loaded = this.loaded+1;
	};

	this.resetLoaded = function() {
		this.loaded = 0;
	};

	this.decrementRequests = function(p_iserror) {
		this.totalrequests = this.totalrequests - 1;
		if (p_iserror) {
			this.errors++;
		}
	};
	
	this.getRequestsCount = function() {
		return this.totalrequests;
	};

	this.getLoadedCount = function() {
		return this.loaded;
	};

	this.toString = function() {
		return this.loaded + "/" + this.totalrequests;
	};
	
	this.toDiagnosticsString= function() {
		return String.format("total:{0}, loaded:{1}, errors:{2}", this.totalrequests, this.loaded, this.errors);
	};

}

function rasterLayerCounters() {
	
	this.counters = {};
	
	this.init = function(p_rasterlyrname, totalImgRequests) {
		if (this.counters[p_rasterlyrname] === undefined) {
			this.counters[p_rasterlyrname] = new rasterLayerCounter(p_rasterlyrname);
		}
		this.counters[p_rasterlyrname].init(totalImgRequests);
	};

	this.resetLoaded = function(p_rasterlyrname) {
		this.counters[p_rasterlyrname].resetLoaded();
	};

	this.incrementLoaded = function(p_rasterlyrname) {
		this.counters[p_rasterlyrname].incrementLoaded();
	};

	this.reset = function(p_rasterlyrname) {
		if (this.counters[p_rasterlyrname] === undefined) {
			this.counters[p_rasterlyrname] = new rasterLayerCounter(p_rasterlyrname);
		}
		this.counters[p_rasterlyrname].reset();
	};
	
	this.resetAll = function() {
		for (var k in this.counters) {
			if (this.counters.hasOwnProperty(k)) {
				this.reset(k);
			}
		}
	};

	this.decrementRequests = function(p_rasterlyrname, p_iserror) {
		this.counters[p_rasterlyrname].decrementRequests(p_iserror);
	};

	this.toString = function(p_rasterlyrname) {
		return this.counters[p_rasterlyrname].toString();
	};

	this.toDiagnosticsString= function() {
		var outarray = [];
		for (var rnamex in this.counters) 
		{
			if (this.counters.hasOwnProperty(rnamex)) {
				outarray.push(rnamex+": "+this.counters[rnamex].toDiagnosticsString());
			} 
		}
		return outarray.join(",");
	};
	
	this.getRequestsCount = function(p_rasterlyrname) {
		return this.counters[p_rasterlyrname].getRequestsCount();
	};

	this.getLoadedCount = function(p_rasterlyrname) {
		return this.counters[p_rasterlyrname].getLoadedCount();
	};

	this.allLoaded = function() {
		var ret = true;
		for (var rnamex in this.counters) 
		{
			if (this.counters.hasOwnProperty(rnamex)) {
				if (!this.counters[rnamex].allLoaded()) {
					ret = false;
					break;
				}
			} 
			if (!ret) {
				break;
			}
		}
		return ret;
	};

	this.hasRequests = function(p_rasterlyrname) {
		return this.counters[p_rasterlyrname].hasRequests();
	};

}

function scaleLevelFromScaleValue(p_sclvalue) {
	var ret;
	if (p_sclvalue < 200) {
		ret = 0;
	} else if (p_sclvalue >= 200 && p_sclvalue < 375) {
		ret = 1;
	} else if (p_sclvalue >= 375 && p_sclvalue < 750) {
		ret = 2;
	} else if (p_sclvalue >= 750 && p_sclvalue < 1500) {
		ret = 3;
	} else if (p_sclvalue >= 1500 && p_sclvalue < 3000) {
		ret = 4;
	} else if (p_sclvalue >= 3000 && p_sclvalue < 6000) {
		ret = 5;
	} else if (p_sclvalue >= 6000 && p_sclvalue < 12000) {
		ret = 6;
	} else if (p_sclvalue >= 12000 && p_sclvalue < 24000) {
		ret = 7;
	} else if (p_sclvalue >= 24000 && p_sclvalue < 48000) {
		ret = 8;
	} else if (p_sclvalue >= 48000 && p_sclvalue < 126000) {
		ret = 9;
	} else if (p_sclvalue >= 252000 && p_sclvalue < 500000) {
		ret = 10;
	} else if (p_sclvalue >= 500000 && p_sclvalue < 1000000) {
		ret = 11;
	} else if (p_sclvalue >= 1000000 && p_sclvalue < 2000000) {
		ret = 12;
	} else {
		ret = 13;
	}
	
	return ret;
};

function scaleValueFromTMSZoomLevel(p_zoomlvl) {
	var ret = null;
	var scales = [125, 250, 500, 1000, 2000, 4000, 8000, 15000, 35000, 70000, 150000,
			250000, 500000, 1000000, 2000000, 4000000, 10000000];
	var sclidx = 22 - p_zoomlvl;
	if (sclidx >= 0 && sclidx < scales.length) {
		ret = scales[sclidx];
	}
	
	return ret;
};

function TMSZoomLevelFromScaleValue(p_scalevl) {
	let ret = null;
	if (p_scalevl <= 125) {
		ret = 22;
	} else if (p_scalevl <= 250) {
		ret = 21;
	} else if (p_scalevl <= 500) {
		ret = 20;
	} else if (p_scalevl <= 1000) {
		ret = 19;
	} else if (p_scalevl <= 2000) {
		ret = 18;
	} else if (p_scalevl <= 4000) {
		ret = 17;
	} else if (p_scalevl <= 8000) {
		ret = 16;
	} else if (p_scalevl <= 15000) {
		ret = 15;
	} else if (p_scalevl <= 35000) {
		ret = 14;
	} else if (p_scalevl <= 70000) {
		ret = 13;
	} else if (p_scalevl <= 150000) {
		ret = 12;
	} else if (p_scalevl <= 250000) {
		ret = 11;
	} else if (p_scalevl <= 500000) {
		ret = 10;
	} else if (p_scalevl <= 1000000) {
		ret = 9;
	} else if (p_scalevl <= 2000000) {
		ret = 8;
	} else if (p_scalevl <= 4000000) {
		ret = 7;
	} else if (p_scalevl <= 10000000) {
		ret = 6;
	} else {
		ret = 5;
	}
	return ret;
};

function topLeftCoordsFromRowCol(p_col, p_row, p_rasterSpecs, out_terraincoords) {
	
	out_terraincoords.length = 0;	
	
	out_terraincoords[0] = (p_col * p_rasterSpecs.colwidth) + p_rasterSpecs.easting;
	out_terraincoords[1] = p_rasterSpecs.topnorthing - (p_row * p_rasterSpecs.rowheight);
	
}
 
function Envelope2D() {

	this.i18nmsgs = {
			"pt": {
				"NONEW": "'Envelope2D' é classe, o seu construtor foi invocado sem 'new'",					
				"INVALIDPT": "Ponto inválido",
				"NO": ""				
			}
		};
	this.msg = function(p_msgkey) {
		let langstr = navigator.language || navigator.userLanguage;
		let lang = langstr.substring(0,2);		
		if (this.i18nmsgs[lang] === undefined) {
			for (let k in this.i18nmsgs) {
				if (this.i18nmsgs.hasOwnProperty(k)) {
					lang = k;
					break;
				}
			}
		}
		return this.i18nmsgs[lang][p_msgkey];
	};
			
	if ( !(this instanceof arguments.callee) )
		throw new Error(this.msg("NONEW"));
	
	this.getClassStr = function() {
		return "Envelope2D";
	};
	
	this.minx = 0;
	this.miny = 0;
	this.maxx = 0;
	this.maxy = 0;
	
	this.getArray = function() {
		return [this.minx, this.miny, this.maxx, this.maxy];
	}
	
	this.setMinsMaxs = function(p_minx, p_miny, p_maxx, p_maxy) {
		
		if (isNaN(p_minx)) {
			throw new Error("Envelope.setMinsMaxs: p_minx is NaN");
		}
		if (isNaN(p_miny)) {
			throw new Error("Envelope.setMinsMaxs: p_miny is NaN");
		}
		if (isNaN(p_maxx)) {
			throw new Error("Envelope.setMinsMaxs: p_maxx is NaN");
		}
		if (isNaN(p_maxy)) {
			throw new Error("Envelope.setMinsMaxs: p_maxy is NaN");
		}

		this.minx = Math.min(p_minx, p_maxx);
		this.maxx = Math.max(p_minx, p_maxx);
		this.miny = Math.min(p_miny, p_maxy);
		this.maxy = Math.max(p_miny, p_maxy);
	};

	this.setFromOther = function(p_other) {
		this.minx = Math.min(p_other.minx, p_other.maxx);
		this.maxx = Math.max(p_other.minx, p_other.maxx);
		this.miny = Math.min(p_other.miny, p_other.maxy);
		this.maxy = Math.max(p_other.miny, p_other.maxy);
	};
	
	this.setNullAround = function(p_center) {
		if (p_center === null || typeof p_center != 'object' || p_center.length != 2) 
			throw new Error(this.msg("INVALIDPT"));

		if (isNaN(p_center[0])) {
			throw new Error("setNullAround: cy is NaN");
		}

		if (isNaN(p_center[1])) {
			throw new Error("setNullAround: cy is NaN");
		}

		this.minx = p_center[0];
		this.miny = p_center[1];
		this.maxx = p_center[0];
		this.maxy = p_center[1];		
	};

	this.setAround = function(p_center, p_half_width) {
		if (p_center === null || typeof p_center != 'object' || p_center.length != 2) 
			throw new Error(this.msg("INVALIDPT"));

		if (isNaN(p_center[0])) {
			throw new Error("setNullAround: cy is NaN");
		}

		if (isNaN(p_center[1])) {
			throw new Error("setNullAround: cy is NaN");
		}

		if (p_half_width==null || isNaN(p_half_width)) {
			throw new Error("setNullAround: p_half_width is null or NaN");
		}
		
		this.minx = p_center[0]-p_half_width;
		this.miny = p_center[1]-p_half_width;
		this.maxx = p_center[0]+p_half_width;
		this.maxy = p_center[1]+p_half_width;		
	};
	
	this.addPoint = function(p_pt) 
	{
		if (p_pt[0] < this.minx) {
			this.minx = p_pt[0];
		}
		if (p_pt[0] > this.maxx) {
			this.maxx = p_pt[0];
		}
		if (p_pt[1] < this.miny) {
			this.miny = p_pt[1];
		}
		if (p_pt[1] > this.maxy) {
			this.maxy = p_pt[1];
		}
	};
	
	this.getCenter = function(out_pt) 
	{
		var w = this.maxx - this.minx;
		var h = this.maxy - this.miny;
		
		out_pt[0] = this.minx + (w / 2.0);
		out_pt[1] = this.miny + (h / 2.0);		
	};
	
	this.getOrigin = function(out_pt) 
	{
		out_pt[0] = this.minx;
		out_pt[1] = this.miny;		
	};
	
	this.expand = function(p_mult) 
	{		
		var w = this.maxx - this.minx;
		var h = this.maxy - this.miny;
		var cx = this.minx + (w / 2.0);
		var cy = this.miny + (h / 2.0);
		
		var expw = w * p_mult;
		var exph = h * p_mult;
		
		this.minx = cx - (expw / 2.0);
		this.maxx = this.minx + expw;
		this.miny = cy - (exph / 2.0);
		this.maxy = this.miny + exph;		
	};
	
	this.toString = function() {
		var fmt = "minx:{0} miny:{1} maxx:{2} maxy:{3} w:{4} h:{5}";
		var w = this.maxx - this.minx;
		var h = this.maxy - this.miny;
		return String.format(fmt, 
					formatFracDigits(this.minx,2), 
					formatFracDigits(this.miny,2), 
					formatFracDigits(this.maxx,2), 
					formatFracDigits(this.maxy,2),
					w, h
				);
	};	
	
	this.getWidth = function() {
		return this.maxx - this.minx;
	};
	
	this.getHeight = function() {
		return this.maxy - this.miny;
	};

	this.getWHRatio = function(opt_esv, opt_elv) 
	{
		var ret = 0, esv = 0.00001, elv = 9999999;
		
		if (opt_esv) {
			esv = opt_esv;
		}
		if (opt_elv) {
			elv = opt_elv;
		}
		
		var h = this.getHeight();
		
		if (Math.abs(h) < esv) {
			ret = elv;
		} else {
			ret = this.getWidth() / h;			
		}
		
		return ret;
	};
	
	this.widthIsBigger = function() {
		return this.getWidth() > this.getHeight();
	};
	
	this.checkPointIsOn = function(p_pt) {
		return (p_pt[0] >= this.minx && p_pt[0] <= this.maxx &&
				p_pt[1] >= this.miny && p_pt[1] <= this.maxy);
	};
	
}

function RetrievalController() {
	
	this.p_orderedlayers = null;
	this._layersandstats = null;
	this._requestid = null;
	this._currlayerindex = null;
	this._rasterlayersspecs = {};
	this.layerscalelimits = {};
	this._orderedlayernames = [];
	this._ordrasterlayernames = [];
	this.layercount = 0;
	this.dolog = false;

	this.reset = function() {
		this._layersandstats = null;
		this._currlayerindex = null;
	};
	this.getLayerCount = function() {
		return this.layercount;
	};
	this.getRequestId = function() {
		return this._requestid;
	};
	this.getRasterCount = function() {
		return this._ordrasterlayernames.length;
	};
	this.getLayerNames = function(p_retlist, opt_tolower) 
	{
		if (this.dolog) {
			console.trace("getLayerNames");
		}
		p_retlist.length = 0;
		var grn_i=0;
		while (this._orderedlayernames[grn_i] !== undefined && this._orderedlayernames[grn_i] != null) 
		{
			if (opt_tolower) {
				p_retlist.push(this._orderedlayernames[grn_i].toLowerCase());
			} else {
				p_retlist.push(this._orderedlayernames[grn_i]);
			}
			grn_i++;
			if (grn_i > MapCtrlConst.MAXLAYERCOUNT) {
				throw new Error("getLayerNames: excess layer name cycling");
			}
		}
	};
	this.getRasterNames = function(p_retlist, opt_tolower) 
	{
		if (this.dolog) {
			console.trace("getRasterNames");
		}
		p_retlist.length = 0;
		var grn_i=0;
		while (this._ordrasterlayernames[grn_i] !== undefined && this._ordrasterlayernames[grn_i] != null) 
		{
			if (opt_tolower) {
				p_retlist.push(this._ordrasterlayernames[grn_i].toLowerCase());
			} else {
				p_retlist.push(this._ordrasterlayernames[grn_i]);
			}
			grn_i++;
			if (grn_i > MapCtrlConst.MAXLAYERCOUNT) {
				throw new Error("getRasterNames: excess layer name cycling");
			}
		}
	};
	this.clearRasterNames = function() {
		if (this.dolog) {
			console.trace("clearRasterNames");
		}
		this._ordrasterlayernames.length = 0;
	};
	this.setRasterNames = function(p_rasternameslist) {
		if (p_rasternameslist.length < 1) {
			return;
		}
		if (this.dolog) {
			console.trace("setRasterNames");
		}
		this._ordrasterlayernames.length = 0;
		var i=0;
		while (p_rasternameslist[i] !== undefined && p_rasternameslist[i] != null) {
			this._ordrasterlayernames.push(p_rasternameslist[i]);
			i++;
		}
	};
	this.setLayerScaleLimits = function(p_lname, p_bottom, p_top) {
		this.layerscalelimits[p_lname] = [p_bottom, p_top];
	};
	// Set layers during initial read
	this.initialSetLayers = function (p_orderedlayers, p_orderedrasterlayers, p_layers_with_stats) {
		this._orderedlayernames = clone(p_orderedlayers);
		this._ordrasterlayernames = clone(p_orderedrasterlayers);
		this.layercount = this._orderedlayernames.length;
		if (!p_layers_with_stats) {
			this._currlayerindex = -1;
		}
	};
	
	this.setRasterLayerSpecs = function(p_name, p_obj, p_general_obj) {
		this._rasterlayersspecs[p_name] = clone(p_obj);
		this._rasterlayersspecs[p_name].outimgext = p_general_obj.outimgext;
		this._rasterlayersspecs[p_name].pixsize = p_general_obj.pixsize;
		this._rasterlayersspecs[p_name].topnorthing = p_general_obj.topnorthing;
		this._rasterlayersspecs[p_name].easting = p_general_obj.easting;
		this._rasterlayersspecs[p_name].level = p_obj.level;
		//this._rasterlayersspecs[p_name].pixsize = p_general_obj.pixsize;
	};
	this.getRasterLayerSpecs = function(p_name) {
		return this._rasterlayersspecs[p_name];
	};
	this.clearRasterLayerSpecs = function() {
		this._rasterlayersspecs = {};
	};
	this.existRasterLayerSpecs = function(p_name) {
		return (this._rasterlayersspecs[p_name] !== undefined && this._rasterlayersspecs[p_name] != null);
	};
	this.existAnyRasterLayerSpecs = function() {
		return !isEmpty(this._rasterlayersspecs);
	};
	this.cycleRasterLayerSpecs = function(p_function, p_mapctrller, the_rcvctrler, p_clrimgflagref)
	{
		for (var name in this._rasterlayersspecs) {
			if (this._rasterlayersspecs.hasOwnProperty(name)) {
				p_function(name, this._rasterlayersspecs[name], p_mapctrller, the_rcvctrler, p_clrimgflagref);
			}
		}
	};
	this.existLayerStats = function() {
		ret = false;

		if (this._layersandstats != null) {
			ret = !isEmpty(this._layersandstats);
		}
		return ret;
	};
	this.setLayersStats = function (p_obj) {
		this._currlayerindex = -1;
		this._requestid = p_obj.reqid;
		
		if (p_obj.stats) {
			this._layersandstats = clone(p_obj.stats);
		}
		
		return (p_obj.stats != null);
	};
	this.hasAnythingToDraw = function() {
		var lname, lstats, ret = false;		
		for (var i=0; i<this._orderedlayernames.length; i++) 
		{
			lname = this._orderedlayernames[i];
			lstats = this._layersandstats[lname];
			if (lstats != null) {
				if (lstats.nvert > 0) {
					ret = true;
					break;
				}
			}
		}
		return ret;
	};

	this.hasCurrLayer = function() {
		var ret = false;
		if (this._currlayerindex < (this._orderedlayernames.length-1)) {
			ret = true;
		}
		return ret;
	};
	
	this.checkLayerScaleDepVisibility = function(p_lname, p_scale) {
		var ret = false;
		if (this.layerscalelimits[p_lname] === undefined) {	
			ret = true;
		} else {
			if (p_scale >= this.layerscalelimits[p_lname][0] && p_scale <= this.layerscalelimits[p_lname][1]) {
				ret = true;
			}				
		}		
		return ret;
	};
	this.hasVisibleLayersAtThisScale = function(p_scale) {
		var lname, ret = false;	
		
		//if (this.existLayerStats())
		
		if (!ret) {
			for (var i=0; i<this._orderedlayernames.length; i++) {
				lname = this._orderedlayernames[i];
				ret = this.checkLayerScaleDepVisibility(lname, p_scale);
				if (ret) {
					break;
				}
			}
		}
		return ret;
	};
	this.getVisibleLayersList = function(p_scale, out_list, opt_alllayers_returns_emptylist) {
		out_list.length = 0;
		var lname, cnt=0, is_ok = false;	
		
		if (opt_alllayers_returns_emptylist) 
		{
			for (var i=0; i<this._orderedlayernames.length; i++) 
			{
				lname = this._orderedlayernames[i];
				if (this.layerscalelimits[lname] === undefined) {		
					cnt++;
				} else {
					if (p_scale >= this.layerscalelimits[lname][0] && p_scale <= this.layerscalelimits[lname][1]) {
						cnt++;
					}				
				}
			}
			
			if (cnt == this.layercount) {
				is_ok = true;
			}
		} 
		
		if (!is_ok) 
		{
			for (var i=0; i<this._orderedlayernames.length; i++) {
				lname = this._orderedlayernames[i];
				if (this.layerscalelimits[lname] === undefined) {		
					out_list.push(lname);
				} else {
					if (p_scale >= this.layerscalelimits[lname][0] && p_scale <= this.layerscalelimits[lname][1]) {
						out_list.push(lname);
					}				
				}
			}
		}
	};

	// Como os limites de escala já foram testados no pedido de estatísticas,
	// basta verificar se a próxima layer está presente no último resultado de 
	// estatísticas, com núm. vértices > 0
	this.nextCurrLayer = function() 
	{
		var lname, lstats, found = false;
		var idx = this._currlayerindex;
		while (idx < (this._orderedlayernames.length-1)) {
			idx++;
			lname = this._orderedlayernames[idx];
			lstats = this._layersandstats[lname];
			if (lstats !== undefined && lstats != null) 
			{
				if (lstats != null) {
					if (lstats.nvert > 0) {
						found = true;
						this._currlayerindex = idx;
					}
				}
			}
			if (found) {
				break;
			}
		}
		if (!found) {
			this._currlayerindex = -1;
		}
		//console.log("nextCurrLayer lyr:"+lname+" found:"+found);
		return found;
	};
	this.getCurrLayerName = function() {
		var ret = null;
		if (this._currlayerindex !== null && this._currlayerindex >= 0) {
			ret = this._orderedlayernames[this._currlayerindex];
		}
		return ret;
	};
	this.getCurrNumbers = function(p_retobj) {
		var lname;
		p_retobj.length = 3;
		p_retobj[0] = null;
		if (this._currlayerindex !== null && this._currlayerindex >= 0) {
			lname = this._orderedlayernames[this._currlayerindex];
			p_retobj[0] = lname;
			if (this._layersandstats[lname] !== undefined && this._layersandstats[lname] != null) 
			{
				p_retobj[1] = this._layersandstats[lname].nchunks;
				p_retobj[2] = this._layersandstats[lname].nvert;
			} 
			else {
				p_retobj[1] = null;
				p_retobj[2] = null;				
			}
		}
	};
	this.currIsFirstLayer = function() {
		return (this._currlayerindex === 0);
	};
	this.currentlyRetrieving = function() {
		return (this._currlayerindex !== null && this._currlayerindex >= 0);
	};
	
	
}

function rasterkey(p_lvl, p_col, p_row) {
	//console.log("lvl col row:"+p_lvl+","+p_col+","+p_row);
	return formatPaddingDigits(p_lvl,0,3) + "_" + 
			formatPaddingDigits(p_col,0,5) + "_" + 
			formatPaddingDigits(p_row,0,5);
}

function rasterkey_from_pyramid_pos(p_pyrposarray) {
	//console.log("p_pyrposarray:"+JSON.stringify(p_pyrposarray));
	return formatPaddingDigits(p_pyrposarray[0],0,3) + "_" + 
			formatPaddingDigits(p_pyrposarray[1],0,5) + "_" + 
			formatPaddingDigits(p_pyrposarray[2],0,5);
}

function maxScaleView(p_scale, p_center) {
	this.scale = p_scale;
	this.terrain_center = [p_center[0], p_center[1]];
}

function emptyImageURL() {
	return '';
}

function layerActivateTOC(p_domelem, p_ctx, p_backing_obj, p_patterns, p_bxwith, p_bxheight) {
	
	p_domelem.style.color = 'white';
	p_ctx.fillStyle = MapCtrlConst.TOCBCKGRDCOLOR;
	p_ctx.strokeStyle = p_ctx.fillStyle;
	p_ctx.fillRect (0, 0, p_bxwith, p_bxheight);
	p_ctx.strokeRect (0, 0, p_bxwith, p_bxheight);
	
	let innerw = p_bxwith - 4;
	let innerh = p_bxheight - 4;
	
	const styleobj =  p_backing_obj.sty.style;
	const geomtype =  p_backing_obj.gtype;
	//const layername = p_backing_obj.sty.lname;
	// const lblsample = p_backing_obj.lblsample
	const markerf = p_backing_obj.markerf
	
	styleflags = {};
	ctxGenericApplyStyle(p_ctx, styleobj, p_patterns, styleflags);

	if (geomtype == "POLY") {
		if (styleflags.fill) {
			p_ctx.fillRect (3, 3, innerw, innerh);
		}
		if (styleflags.stroke) {
			p_ctx.strokeRect (3, 3, innerw, innerh);
		}
	} else if (geomtype == "LINE") {
		if (styleflags.stroke) {
			p_ctx.beginPath();
			p_ctx.moveTo(3,innerh);
			p_ctx.lineTo(8,3);
			p_ctx.lineTo(innerw-5,innerh);
			p_ctx.lineTo(innerw,3);
			p_ctx.stroke();
		}
	} else if (geomtype == "POINT") {

		/* Amostra etiqueta
		if (styleobj.font !== undefined) {
			p_ctx.font = styleobj.font;
		}
		
		let lbltxt = "Az";
		if (labelsample) {
			lbltxt = labelsample.slice(0,3);
		}
		p_ctx.fillText(lbltxt, 14, 12);
		*/
		
		const tocattrs = styleobj.tocattrs;
		const tocscale = styleobj.tocscale;
		
		if (window[markerf] !== undefined) {		
			window[markerf](p_ctx, [3+parseInt(innerw/2), 3+parseInt(innerh/2)], tocscale, -1, tocattrs);
		}

	}

}

function layerDeactivateTOC(p_domelem, p_ctx, p_patterns, p_not_viz_img_params, p_bxwith, p_bxheight) {
	
	p_domelem.style.color = '#a0a0a0';
	p_ctx.fillStyle = MapCtrlConst.TOCBCKGRDCOLOR;
	p_ctx.strokeStyle = p_ctx.fillStyle;
	p_ctx.fillRect (0, 0, p_bxwith, 20);
	p_ctx.strokeRect (0, 0, p_bxwith, 20);

	// Draw blocked eye 
	canvasAddSingleImage(p_ctx, p_not_viz_img_params[0], p_not_viz_img_params[1], p_not_viz_img_params[2]);

	// Draw two crossed lines 
	
	/*
	let innerw = p_bxwith - 4;
	let innerh = p_bxheight - 4;
	let maxw = innerw-6;
	let maxh = innerh;

	styleflags = {};
	ctxGenericApplyStyle(p_ctx, {
		"strokecolor": "#a0a0a0",
		"linewidth": 2
	}, p_patterns, styleflags);
	
	p_ctx.beginPath();
	p_ctx.moveTo(4,maxh);
	p_ctx.lineTo(innerw,4);
	p_ctx.stroke();
	p_ctx.beginPath();
	p_ctx.lineTo(4,4);
	p_ctx.lineTo(innerw,maxh);
	p_ctx.stroke();
	
	*/

}

// Legend Manager
function StyleVisibility(p_mapctrlr, p_config) {

	this.styles = {};
	this.stylecount = 0;
	this.orderedindexes = [];
	this.elementstats = {}; // contains a per-style index dict with arrays 
		// carrying statistics: number of points, lines, polygons, 
		// other and a sample of element labeling

	this.layer_to_tocentries = {}; // per layername dict
	this.toc_entries = {}; // per style index dict
	
	this.widget_id = null;
	this.maplyrconfig = p_config.lconfig;
	this.maplyrnames = p_config.lnames;
	this.mapctrlssetup = p_config.controlssetup;
	this.mapcontroller = p_mapctrlr;
	this.do_debug = true;
	
	this.i18nmsgs = {
		"pt": {
			"NONEW": "'StyleVisibility' é classe, o seu construtor foi invocado sem 'new'",					
		}
	};
	this.msg = function(p_msgkey) {
		let langstr = navigator.language || navigator.userLanguage;
		let lang = langstr.substring(0,2);		
		if (this.i18nmsgs[lang] === undefined) {
			for (let k in this.i18nmsgs) {
				if (this.i18nmsgs.hasOwnProperty(k)) {
					lang = k;
					break;
				}
			}
		}
		return this.i18nmsgs[lang][p_msgkey];
	};
	
	if ( !(this instanceof arguments.callee) )
		throw new Error(this.msg("NONEW"));
	
	this.getClassStr = function() {
		return "StyleVisibility";
	};
	
	this.setWidgetId = function(p_widget_id) {
		this.widget_id = p_widget_id;
	};	
	this.clearvis = function() {		
		for (let styidx in this.toc_entries) {
			if (this.toc_entries.hasOwnProperty(styidx)) {
				this.toc_entries[styidx].pt = 0;
				this.toc_entries[styidx].lin = 0;
				this.toc_entries[styidx].pol = 0;
				this.toc_entries[styidx].undef = 0;
				this.toc_entries[styidx].lblsample = null;
			}
		}
	};
	this.isLyrTOCVisibile = function(p_lname) {
		let ret = false;

		const tocentries = this.layer_to_tocentries[p_lname];		
		for (let ti=0; ti<tocentries.length; ti++) {
			if (this.toc_entries[tocentries[ti]].visible) {
				ret = true;
				break;
			}
		}

		return ret;
		
	};
	this.isLyrTOCStyleVisibile = function(p_stdix) {
		
		const tocentries = this.layer_to_tocentries[p_lname];
		let ret = false;
		
		if (tocentries != null) {
			for (let ti=0; ti<tocentries.length; ti++) {
				if (this.toc_entries[tocentries[ti]].visible) {
					ret = true;
					break;
				}
			}
		}

		return ret;		
	};
	
	this.isLyrTOCVisibilityTrueOrUndef = function(p_lname) {
		
		let ret = true;
		const tocentries = this.layer_to_tocentries[p_lname];
		
		if (tocentries != null) {
			ret = false;
			for (let ti=0; ti<tocentries.length; ti++) {
				if (this.toc_entries[tocentries[ti]].visible) {
					ret = true;
					break;
				}
			}		
		}
		return ret;		
	};
	
	this.createLayerTOCEntry = function(p_lname, p_styidx) {
		
		if (this.layer_to_tocentries[p_lname] === undefined) {
			this.layer_to_tocentries[p_lname] = [];
		}
		if (this.layer_to_tocentries[p_lname].indexOf(p_styidx) < 0) {
			this.layer_to_tocentries[p_lname].push(p_styidx);
		}
		if (this.toc_entries[p_styidx] === undefined) {
			this.toc_entries[p_styidx] = {
				lname: p_lname, pt: 0, lin: 0, pol: 0, 
				undef: 0, lblsample: null,
				visible: true
			};
		}
	};
	
	// toggle layers or styles: if only opt_lname is given, toggles entire layer,
	//  if opt_style_index is given it toggles just that style
	this.toggleVisibility = function(opt_lname, opt_style_index) {
				
		if (opt_lname) {
			const lviz = this.mapcontroller.checkLayerVisibility(opt_lname);					
			const tocentries = this.layer_to_tocentries[opt_lname];
			if (tocentries != null) {
				for (let ti=0; ti<tocentries.length; ti++) {
					if (!lviz) {
						this.toc_entries[tocentries[ti]].visible = false;
					} else {
						this.toc_entries[tocentries[ti]].visible = !this.toc_entries[tocentries[ti]].visible;
					}
				}		
			}
			if (!lviz) {
				return false;
			}
		} else if (opt_style_index) {
			this.toc_entries[opt_style_index].visible = !this.toc_entries[opt_style_index].visible;
		}
		return true;
	};
	
	this._holdReleaseVisibility	 = function(p_tovisible, p_lname) {
		
		const lviz = this.mapcontroller.checkLayerVisibility(p_lname);
		const tocentries = this.layer_to_tocentries[p_lname];
		let ret = false
		if (!lviz) {			
			if (tocentries != null) {
				for (let ti=0; ti<tocentries.length; ti++) {
					this.toc_entries[tocentries[ti]].visible = false;
				}
			}
		} else {
			if (tocentries != null) {
				for (let ti=0; ti<tocentries.length; ti++) {
					if (this.toc_entries[tocentries[ti]].visible) {
						if (!p_tovisible) {
							this.toc_entries[tocentries[ti]].visible = false;
							ret = true;
						}
					} else {
						if (p_tovisible) {
							this.toc_entries[tocentries[ti]].visible = true;
							ret = true;
						}
					}
				}
			}
		}
		
		return ret;
	}
	
	this.holdVisibility = function(p_lname) {
		return this._holdReleaseVisibility(false, p_lname);
	};
	this.releaseVisibility = function(p_lname) {
		return this._holdReleaseVisibility(true, p_lname);
	};

	this.getGeomType = function(p_idx) {	
	
		let ret = (function(p_this) {
			return Object.keys(p_this.toc_entries[p_idx]).reduce(function(a, b) {
				let ret = null;
				let va = p_this.toc_entries[p_idx][a];
				let vb = p_this.toc_entries[p_idx][b];
				if (va == 0 || va == null) { va = NaN };
				if (vb == 0 || vb == null) { vb = NaN };
				if (!isNaN(va) && !isNaN(vb)) {
					ret = va > vb ? a : b;
				} else if (isNaN(va) && isNaN(vb)) {
					ret = null;
				} else if (isNaN(va)) {
					ret = b;
				} else if (isNaN(vb)) {
					ret = a;
				}

				return ret;
			});
		})(this);
		
		if (ret !== null) {
			switch(ret) {
				case 'pt':
					ret = "POINT";
					break;
				case 'lin':
					ret = "LINE";
					break;
				case 'pol':
					ret = "POLY";
					break;
				case 'undef':
					ret = "UNDEF";
					break;
				default:
					ret = "NONE";
			}
		}
		
		return ret;		
	};
	
	this.getTotalFeatsPerIdx = function(p_idx) {

		const lgtypes = ['pt', 'lin', 'pol'];
		let ret = 0;
		
		for (let ti=0; ti<lgtypes.length; ti++) {
			ret += this.toc_entries[p_idx][lgtypes[ti]];
		}
		
		return ret;
	};

	this.getTotalFeatsPerLayer = function(p_lname) {
		
		const tocentries = this.layer_to_tocentries[p_lname];
		let ret = 0;
		
		if (tocentries != null) {
			for (let ti=0; ti<tocentries.length; ti++) {
				ret += this.getTotalFeatsPerIdx(tocentries[ti]);
			}
		}

		return ret;
	};
	
	this.genCanvasTOCElem = function(p_d, p_d2, p_backing_obj, p_cnvidx, p_legcell_dims, p_ismapvisible, p_layer_notviz_image_params, p_tcfn) {
		
		let canvasel, ctx, cnvidx = p_cnvidx + 1;
		
		if (!p_backing_obj.empty) {

			// Legend symbol
			canvasel = document.createElement('canvas');
			canvasel.setAttribute('class', 'visctrl-classimg');
			canvasel.setAttribute('id', 'cnv'+cnvidx);
			canvasel.setAttribute('width', p_legcell_dims.w);
			canvasel.setAttribute('height', p_legcell_dims.h);
				
			ctx = canvasel.getContext('2d');

			if (this.do_debug) {
				console.log(" === START genCanvasTOCElem =========");
				console.log("  LAYERNAME:", p_backing_obj.sty.lname);
				console.log("  TOCVIZ:", this.isLyrTOCVisibile(p_backing_obj.sty.lname));
				console.log("  gtype, isMapvisible:", p_backing_obj.gtype, p_ismapvisible);
				console.log(" === END ===========================");
			}

			if (this.isLyrTOCVisibile(p_backing_obj.sty.lname) && p_ismapvisible && p_backing_obj.gtype != "NONE") {
				layerActivateTOC(p_d, ctx, p_backing_obj, this.mapcontroller.fillpatterns, p_legcell_dims.w, p_legcell_dims.h );
			} else {
				layerDeactivateTOC(p_d, ctx, this.mapcontroller.fillpatterns, p_layer_notviz_image_params, p_legcell_dims.w, p_legcell_dims.h);
			}
			
			if (p_tcfn != null && window[p_tcfn] !== undefined) {
				(function(p_canvasel, p_func) {	
					attEventHandler(p_canvasel, 'click',
						function(evt) { window[p_func](false); }
					);
				})(canvasel,p_tcfn);
			} else {
				(function(p_self, p_canvasel, p_lname, p_styindex) {						
					attEventHandler(p_canvasel, 'click',
						function(evt) {
							if (p_self.toggleVisibility(p_lname, p_styindex)) {
								p_self.mapcontroller.redraw(false, true);
								p_self.mapcontroller.onChangeFinish("toggleTOC");
							} 
						}
					);
				})(this, canvasel, p_backing_obj.sty.lname, p_backing_obj.sty._index);
			}

			/*
			(function(p_self, p_canvasel, p_styleobj, p_lname) {						
				attEventHandler(p_canvasel, 'mouseover',
					function(evt) {
						var objectoids = p_self.mapcontroller.perattribute_indexing.get(p_lname, p_styleobj._index);
						var inscreenspace = true;
						var dlayer = 'transient';
						if (objectoids) {
							p_self.mapcontroller.clearTransient();
							for (var oidx=0; oidx<objectoids.length; oidx++) {
								// TODO - passar para init / app.js
								p_self.mapcontroller.drawSingleFeature(p_lname, objectoids[oidx], inscreenspace, dlayer,  
											{										
												"strokecolor": 'cyan',
												"linewidth": 3,
												"shadowcolor": "#000",
												"shadowoffsetx": 2,
												"shadowoffsety": 2,
												"shadowblur": 2
											}, null, true, null,						
											false);	
							}
						}

					}
				);
			})(this, canvasel, p_backing_obj.sty.style, p_backing_obj.sty.lname);
			*/

			p_d2.appendChild(canvasel);
			
		}
	
		return cnvidx;
	};
	
	this.updateWidget = function(p_title_caption_key, p_i18n_function) {

		let leg_container = null;	
		let oidx;
		let t, r, pd, d, d2, w, x, capparent, sty, lyrtitle, gtype=null, tmpgtype;
		let currlayercaption = null;
		let lname, transients_found = 0, labelkey_found, possibly_emptysubentries_oidx;
		let topPadLayerHeading = '6px';
		let botPadLayerHeading = '4px';
		let ordredstyles = [];
		let dobreak = false;
		let isMapVisible = false;
		let lnamesidx = 0;
		let lentries_count = 0;
		let thematic_widget = null;
		
		let legend_control_defaults = this.mapcontroller.legend_control_defaults;
		let layer_notviz_image_params = this.mapcontroller.layer_notviz_image_params;
		
		let items = 0, cnvidx = -1, legendcaption_created=false;
		let leg_par, legp_style, leg_tmp_elem, leg_tmp_style;
		
		let leg_dims = { cols:0 };

		const legcfg = this.mapcontroller.mapctrlsmgr.legendcfg;		
		const visibility_widget = document.getElementById(legcfg.visibility_widget_name);
		const legend_ctrl = visibility_widget.parentNode;
		
		if (legend_control_defaults.entrywidth === undefined) {
			leg_tmp_elem = document.querySelector(String.format('#{0} td', legcfg.visibility_widget_name));
			if (leg_tmp_elem) {				
				leg_tmp_style = getComputedStyle(leg_tmp_elem);				
				legend_control_defaults.entrywidth = parseInt(leg_tmp_style.getPropertyValue('width')) + legcfg.legcell_dims.w;		
			}
		}

		if (legend_control_defaults.width === undefined) {
			leg_tmp_elem = document.getElementById('legendctrl');
			if (leg_tmp_elem) {				
				leg_tmp_style = getComputedStyle(leg_tmp_elem);				
				legend_control_defaults.width = parseInt(leg_tmp_style.getPropertyValue('width'));		
				legend_control_defaults.height = parseInt(leg_tmp_style.getPropertyValue('height'));		
			}
		}
		
		if (legend_control_defaults.width === undefined) {
			legend_control_defaults.width = 5 * legcfg.legcell_dims.w;
			leg_tmp_elem = document.getElementById('legendctrl');
			if (leg_tmp_elem) {
				leg_tmp_elem.style.width = legend_control_defaults.width + 'px';
			}
		}

		if (legend_control_defaults.entrywidth === undefined) {
			legend_control_defaults.entrywidth = 3 * legcfg.legcell_dims.w;
		}
		
		// Internationalized legend container title
		function createTitleCaption(p_parent, p_title_key) {
			let x = document.createTextNode(p_i18n_function(p_title_key));				
			p_parent.appendChild(x);				
			setClass(p_parent, "visctrl-h1");
			setClass(p_parent, "unselectable");
		}
		
		let backing_obj={}, backing_obj_arr = [];
			
		if (this.widget_id) {

			for (lnamesidx=(this.maplyrnames.length-1); lnamesidx>=0; lnamesidx--) {
				
				lname = this.maplyrnames[lnamesidx];
				ordredstyles.length = 0;
				transients_found = 0;
				labelkey_found = false;
				stylesindexes_missing_labelkey = [];
				thematic_widget = null;
				lyrtitle = "";
				additions_to_backobj = 0;
				
				if (this.styles[lname] !== undefined) {
					
					if (this.do_debug) {
						console.log("[UPD TOC] layer", lname, ", cont.styles:"+this.styles[lname].length);
					}

					for (let k=0; k<this.styles[lname].length; k++) {

						sty = clone(this.styles[lname][k]);
						if (sty == null) {
							console.warn("[UPD TOC] style", k, "in", lname, "is null");
							continue;
						}

						if (sty["thematic_control"] !== undefined && sty["thematic_control"] != null && sty["thematic_control"].length > 0) {
							if (this.elementstats[sty._index] !== undefined) {
								thematic_widget = { "ctrl": sty["thematic_control"], "styleobj": sty, "lblsample": this.elementstats[sty._index][4] };
							} else {
								thematic_widget = { "ctrl": sty["thematic_control"], "styleobj": sty, "lblsample": "" };
							}
						}

						// Share thematic control from main style to transient and other styles added to layer
						if ((sty["thematic_control"] === undefined || sty["thematic_control"] == null) && (thematic_widget != null)) {
							sty["thematic_control"] = thematic_widget["ctrl"];
						}

						if (sty['transient'] !== undefined && sty['transient']) {
							transients_found++;
						}
						
						if (!labelkey_found) {
							if (sty["lyrlabelkey"] !== undefined && sty["lyrlabelkey"].length > 0) {
								lyrtitle = p_i18n_function(sty["lyrlabelkey"]);
							}
							if ((sty["lyrlabelkey"] !== undefined && sty["lyrlabelkey"].length > 0) || 
									(sty.style !== undefined && sty.style["labelkey"] !== undefined && sty.style["labelkey"].length > 0)
								) {
									labelkey_found = true;
							}	
						}

						if (this.do_debug) {
							console.log("[UPD TOC] layer", lname, ", pushing style index", sty._index, "into styleorder, layertitle:", lyrtitle);
						}
						ordredstyles.push([sty._index, sty]);
					}
						
				}
				// If TOC label exists
				if (labelkey_found) {
				
					ordredstyles.sort(function(a,b) {
						return a[0] - b[0];
					});

					isMapVisible = this.mapcontroller.checkLayerVisibility(lname);
					if (!this.isLyrTOCVisibile(lname) || !isMapVisible || gtype == "NONE") {
						// if layer style was dinamically added and is now deactivated, don't create TOC entry				
						 if (ordredstyles.length > 0 && ordredstyles.length == transients_found) {
							if (this.do_debug) {
								console.log("[UPD TOC] layer", lname, ", removing TOC entry (presum. dynamic. added at first and then deactivated)");
							}
							continue;
						}
					}

					// if no features found, don't create  TOC entry
					let fc = this.mapcontroller.featuresFound(lname);
					if (fc < 1) {
						console.warn("[UPD TOC] layer", lname, ", removing TOC entry - no features found");
						continue;
					}

					if (this.do_debug) {
						console.log("[UPD TOC] layer", lname, ", ordered styles count", ordredstyles.length);
					}

					if (ordredstyles.length > 1) {
						
						for (var j=0; j<ordredstyles.length; j++) {
							
							oidx = ordredstyles[j][0];
							sty = ordredstyles[j][1];
							
							tmpgtype = this.getGeomType(oidx);	
							if (gtype == null || tmpgtype != "NONE") {
								gtype = tmpgtype;
							}
													
							if (Object.keys(this.elementstats).indexOf(oidx.toString()) < 0) {
								if (this.do_debug) {
									console.log("[UPD TOC] layer", lname, ", sty.index", oidx, "not in these elementstats:", Object.keys(this.elementstats));
								}
								continue;
							}
							
							let isMapVisible = this.mapcontroller.checkLayerVisibility(sty.lname);

							if (!this.isLyrTOCVisibile(sty.lname) || !isMapVisible || gtype == "NONE") {
								 if (sty['transient'] !== undefined && sty['transient']) {
									if (this.do_debug) {
										console.log("[UPD TOC] layer", lname, ", sty.index", oidx, "transient, not for TOC");
									}
									continue;
								}
							}
							
							if ((sty["lyrlabelkey"] === undefined || sty["lyrlabelkey"].length < 1) && 
									(sty.style["labelkey"] === undefined || sty.style["labelkey"].length < 1)
								) {
									if (this.do_debug) {
										console.log("[UPD TOC] layer", lname, ", sty.index", oidx, "no 'labelkey' (and also no layer label key)");
									}
									continue;
							}
							
							if (sty["lyrlabelkey"] !== undefined && sty["lyrlabelkey"].length > 0) {
								lyrtitle = p_i18n_function(sty["lyrlabelkey"]);
							}

							if (sty.style["labelkey"] !== undefined) {
								
								if (additions_to_backobj == 0 && lyrtitle.length > 0) {
									backing_obj.lbl = lyrtitle;
									backing_obj.lblstyle = 'ENTRY';
									backing_obj.lname = lname;
									backing_obj.colspan = 2;
									backing_obj.lblsample = backing_obj.sty = null;
									backing_obj.gtype = null;
									backing_obj.grpbndry = 'START';
									backing_obj_arr.push(clone(backing_obj));
									additions_to_backobj++;
								}
								
								if (sty.style["labelvalue"] !== undefined && sty.style["labelvalue"] != null) {
									const fmts = p_i18n_function(sty.style["labelkey"]);
									const val = sty.style["labelvalue"];
									if (val == 1) {
										backing_obj.lbl = String.format(fmts[0], val);
									} else {
										backing_obj.lbl = String.format(fmts[1], val);
									}
								} else {
									backing_obj.lbl = p_i18n_function(sty.style["labelkey"]);
								}
								backing_obj.lblstyle = 'SUBENTRY';
								backing_obj.colspan = 1;
								backing_obj.lblsample = this.elementstats[oidx][4];
								backing_obj.gtype = gtype;
								backing_obj.markerf = (this.maplyrconfig[lname]["markerfunction"] !== undefined ? this.maplyrconfig[lname]["markerfunction"] : null);
								backing_obj.sty = sty;
								backing_obj.grpbndry = 'NONE';
								backing_obj_arr.push(clone(backing_obj));	
								additions_to_backobj++;
							
							} else {

								stylesindexes_missing_labelkey.push(j);

							}
						}	// for (var j=0; j<ordredstyles.length; j++) {
						
					} else if (ordredstyles.length > 0) {

						oidx = ordredstyles[0][0];
						sty = ordredstyles[0][1];

						tmpgtype = this.getGeomType(oidx);	
						if (gtype == null || tmpgtype != "NONE") {
							gtype = tmpgtype;
						}

						backing_obj.lbl = lyrtitle;
						backing_obj.lblstyle = 'ENTRY';
						backing_obj.lname = lname;
						backing_obj.colspan = 1;
						backing_obj.lblsample = this.elementstats[oidx][4];
						backing_obj.gtype = gtype;
						backing_obj.markerf = (this.maplyrconfig[lname]["markerfunction"] !== undefined ? this.maplyrconfig[lname]["markerfunction"] : null);
						backing_obj.sty = sty;
						backing_obj.grpbndry = 'NONE';
						backing_obj_arr.push(clone(backing_obj));
						additions_to_backobj++;
					}

					if (this.do_debug && stylesindexes_missing_labelkey.length > 0) {
						console.log("[UPD TOC] layer", lname, "sty.indexes without label key:", stylesindexes_missing_labelkey);
					}

					if (stylesindexes_missing_labelkey.length > 0 && backing_obj_arr.length==0) {
						
						for (let _oidx, _sty, siml_idx=0; siml_idx<stylesindexes_missing_labelkey.length; siml_idx++) {

							_oidx = ordredstyles[siml_idx][0];
							_sty = ordredstyles[siml_idx][1];
							_sty['transient'] = false;

							backing_obj.lbl = lyrtitle;
							backing_obj.lblstyle = 'ENTRY';
							backing_obj.lname = lname;
							backing_obj.colspan = 1;
							backing_obj.lblsample = this.elementstats[_oidx][4];
							backing_obj.gtype = gtype;
							backing_obj.markerf = (this.maplyrconfig[lname]["markerfunction"] !== undefined ? this.maplyrconfig[lname]["markerfunction"] : null);
							backing_obj.sty = _sty;
							backing_obj.grpbndry = 'NONE';
							backing_obj_arr.push(clone(backing_obj));
							additions_to_backobj++;
						
						}
					}
				} else { // if (labelkey_found)
					if (this.do_debug) {
						console.log("[UPD TOC] layer", lname, "NO TOC label");
					}				
				}

				// If this layer was not added to backing object and has thematic widget,
				// a dummy style is added to provide a TOC entry with invisibility symbol
				if (thematic_widget != null && backing_obj_arr.length==0) {
					let _sty = thematic_widget["styleobj"];
					let _lbs = thematic_widget["lblsample"];

					if (_sty["lyrlabelkey"] !== undefined && _sty["lyrlabelkey"].length > 0) {
						lyrtitle = p_i18n_function(_sty["lyrlabelkey"]);
					} else {
						lyrtitle = "";
					}
					backing_obj.lbl = lyrtitle;
					backing_obj.lblstyle = 'ENTRY';
					backing_obj.lname = lname;
					backing_obj.colspan = 1;
					backing_obj.lblsample = _lbs;
					backing_obj.gtype = gtype;
					backing_obj.markerf = (this.maplyrconfig[lname]["markerfunction"] !== undefined ? this.maplyrconfig[lname]["markerfunction"] : null);
					backing_obj.sty = _sty;
					backing_obj.grpbndry = 'NONE';
					backing_obj_arr.push(clone(backing_obj));
					additions_to_backobj++;
				}
				
			} // for (lnamesidx=(this.maplyrnames.length-1); lnamesidx>=0; lnamesidx--) {

			// Ensure group boundaries are properly closed
			for (var bi=1; bi<backing_obj_arr.length; bi++) {				
				if (backing_obj_arr[bi].lblstyle == 'ENTRY' && 
				backing_obj_arr[bi-1].lblstyle == 'SUBENTRY') {
					backing_obj_arr[bi-1].grpbndry = 'STOP';
				}				
			}			
			if (backing_obj_arr[backing_obj_arr.length-1] !== undefined) {
				if (backing_obj_arr[backing_obj_arr.length-1].lblstyle == 'SUBENTRY') {
					backing_obj_arr[backing_obj_arr.length-1].grpbndry = 'STOP';
				}	
			}	
			
			let leg_prevcols = 0;
			let cols = 1; 			
			while ( ((backing_obj_arr.length * legcfg.elem_height) * 1.0 / cols) > legend_control_defaults.height && cols < legcfg.max_cols ) {
				cols++;
			}			
			leg_dims.cols = cols;
			currlayercaption = null;
			
			let paddingval, minwidth;			
			leg_container = document.getElementById(this.widget_id);
			if (leg_container != null && backing_obj_arr.length>0) {
				
				leg_par = leg_container.parentNode;
				
				if (leg_par && leg_dims.cols > 1) {
					legp_style = window.getComputedStyle(leg_par);
					paddingval = parseInt(legp_style.getPropertyValue('padding-left'));		
					paddingval += parseInt(legp_style.getPropertyValue('padding-right'));	
					
					// guarantee min width for TOC / legend
					minwidth = (legend_control_defaults.entrywidth * leg_dims.cols) + paddingval;					
					if (parseInt(leg_par.style.width) < minwidth) {					
						leg_par.style.width = minwidth + 'px';					
					}
				}

				while (leg_container.firstChild) {
					leg_container.removeChild(leg_container.firstChild);
				}	
				
				t = document.createElement("table");
				leg_container.appendChild(t);
				r = document.createElement("tr");	
				t.appendChild(r);				
				d = document.createElement("td");	
				r.appendChild(d);				
				capparent = document.createElement("p");	
				d.appendChild(capparent);
				
				let tcid, tcfn, opener_evt_attached = false;				
				for (let currcol=0, bi=0; bi<backing_obj_arr.length; bi++) {
					
					if (!legendcaption_created) {
						createTitleCaption(capparent, p_title_caption_key);
						legendcaption_created = true;
					}

					backing_obj = backing_obj_arr[bi];
					
					if (backing_obj.grpbndry == "START" || backing_obj.colspan > leg_dims.cols-currcol) {
						r = document.createElement("tr");	
						t.appendChild(r);
						currcol = 0;						
					}
					
					d = document.createElement("td");	
					r.appendChild(d);				
					
					if (backing_obj.sty !== undefined && backing_obj.sty != null && backing_obj.sty["thematic_control"] != null) {
						tcid = backing_obj.sty["thematic_control"]+"_opener";
						if (backing_obj.lblstyle == "SUBENTRY") {
							d.insertAdjacentHTML('afterbegin', (backing_obj.lbl ? backing_obj.lbl : ""));
						} else {
							d.insertAdjacentHTML('afterbegin', String.format("<span class='click' id='{0}'>{1}</span>", tcid, backing_obj.lbl));
						}
						tcfn = backing_obj.sty["thematic_control"]+"_opener_fn";
						if (window[tcfn] !== undefined && !opener_evt_attached) {
								attEventHandler(tcid, 'click',
									function(evt) { window[tcfn](false); }
								);
								opener_evt_attached = true;
						}
					} else {
						d.insertAdjacentHTML('afterbegin', (backing_obj.lbl ? backing_obj.lbl : ""));
					}

					if (backing_obj.lblstyle == "ENTRY") {
						
						setClass(d, "visctrl-entry");
						setClass(d, "unselectable");
						
						console.log(backing_obj);
						
						// attach event for toggling entire layer viz, all style classes
						(function(p_self, p_el, p_lname) {						
							attEventHandler(p_el, 'click',
								function(evt) {
									if (p_self.toggleVisibility(p_lname, null)) {
										p_self.mapcontroller.redraw(false, true);
										p_self.mapcontroller.onChangeFinish("toggleTOC");
									} 
								}
							);
						})(this, d, backing_obj.lname);
						
					} else if (backing_obj.lblstyle == "SUBENTRY") {
						setClass(d, "visctrl-subentry")
					}

					if (backing_obj.colspan > 1) {
						d.colSpan = backing_obj.colspan * leg_dims.cols;
					} else {
						// espaço simbolo
						d2 = document.createElement("td");	
						r.appendChild(d2);
						cnvidx = this.genCanvasTOCElem(d, d2, backing_obj, cnvidx, legcfg.legcell_dims, isMapVisible, layer_notviz_image_params, tcfn);
					}					
					currcol = currcol + backing_obj.colspan;											
				}									
				leg_par.style.removeProperty('visibility');
			} // if (leg_container) {			
		} // if (this.widget_id) {		
	};

	this.incrementElemStats = function(p_gtype, p_style_obj, p_layername, opt_increment, opt_lblsample) {

	//this.layer_to_tocentries = {}; // per layername dict
	//this.toc_entries = {}; // per style index dict

		
		let idx, inc;	
		if (opt_increment) {
			inc = opt_increment;
		} else {
			inc = 1;
		}
		if (p_style_obj["_index"] !== undefined) {
			
			idx = p_style_obj["_index"];
			
			// verificar se o estilo existe 
			found = false;
			for (let sti=0; sti<this.styles[p_layername].length; sti++) {
				if (this.styles[p_layername][sti]["_index"] == idx) {
					found = true;
					break;
				}
			}

			if (!found) {
				this.styles[p_layername].push({
						"transient": true, 
						"lname": p_layername,
						"_index": idx,
						"lyrlabelkey": (p_style_obj["lyrlabelkey"] !== undefined ? p_style_obj["lyrlabelkey"] : (p_style_obj["labelkey"] !== undefined ? p_style_obj["labelkey"] : "")),
						"style": clone(p_style_obj)
					});				
			}
			
			if (this.orderedindexes.indexOf(idx) < 0) {
				this.orderedindexes.push(idx);
			}
			console.assert(this.toc_entries[idx] !== undefined, String.format("Missing toc_entry {0}, wasn't properly created in StyleVisibility.createLayerTOCEntry",idx));
			if (this.elementstats[idx] === undefined) {
										/* point, line, poly, undefined */
				this.elementstats[idx] = [0,0,0,0, null];
			}
			
			if (p_gtype.toUpperCase() == "POINT") {
				this.elementstats[idx][0] = this.elementstats[idx][0] + inc;
				this.toc_entries[idx].pt =  this.toc_entries[idx].pt + inc;
				if (opt_lblsample) {
					this.elementstats[idx][4] = opt_lblsample;
					this.toc_entries[idx].lblsample = opt_lblsample;
				}
			} else if (p_gtype.toUpperCase() == "LINE") {
				this.elementstats[idx][1] = this.elementstats[idx][1] + inc;
				this.toc_entries[idx].lin =  this.toc_entries[idx].lin + inc;
			} else if (p_gtype.toUpperCase() == "POLY") {
				this.elementstats[idx][2] = this.elementstats[idx][2] + inc;
				this.toc_entries[idx].pol =  this.toc_entries[idx].pol + inc;
			} else {
				this.elementstats[idx][3] = this.elementstats[idx][3] + inc;
				this.toc_entries[idx].undef =  this.toc_entries[idx].undef + inc;
			}
		}	
	};

	let lc, cs, k_lname;
	for (let kli=0; kli < this.maplyrnames.length; kli++) {
		
		k_lname = this.maplyrnames[kli];
		
		if (!this.maplyrconfig.hasOwnProperty(k_lname))	{
			continue;
		}
		
		lc = this.maplyrconfig[k_lname];
		if (lc["style"] !== undefined && lc["style"] != null) {
			lc["style"]["_index"] = this.stylecount;				
			this.createLayerTOCEntry(k_lname, this.stylecount);
			this.stylecount++;
			if (this.styles[k_lname] === undefined) {
				this.styles[k_lname] = [];
			}
			this.styles[k_lname].push({
					"lname": k_lname,
					"_index": lc["style"]["_index"],
					"lyrlabelkey": (lc["labelkey"] !== undefined ? lc["labelkey"] : ""),
					"thematic_control": (lc["thematic_control"] !== undefined ? lc["thematic_control"] : null),
					"style": clone(lc["style"])
				});				
		} else if (lc["condstyle"] !== undefined && lc["condstyle"] != null) {
			
			cs = lc["condstyle"];
			if (this.styles[k_lname] === undefined) {
				this.styles[k_lname] = [];
			}

			for (let k_cstype in cs) {
				if (!cs.hasOwnProperty(k_cstype)) {
					continue;
				}
				if (k_cstype == "default") {
					cs[k_cstype]["_index"] = this.stylecount;
					this.createLayerTOCEntry(k_lname, this.stylecount);
					this.stylecount++;
					this.styles[k_lname].push({
							"lname": k_lname,
							"_index": cs[k_cstype]["_index"],
							"lyrlabelkey": (lc["labelkey"] !== undefined ? lc["labelkey"] : ""),
							"thematic_control": (lc["thematic_control"] !== undefined ? lc["thematic_control"] : null),
							"style": clone(cs[k_cstype])
						});
				} else if (k_cstype == "perattribute") {
					for (let k_attrname in cs[k_cstype]) {
						if (k_attrname == "_#ALL#_") {
							continue;
						}
						for (let i_class = 0; i_class < cs[k_cstype][k_attrname].length; i_class++) {
							cs[k_cstype][k_attrname][i_class]["style"]["_index"] = this.stylecount;
							this.createLayerTOCEntry(k_lname, this.stylecount);
							this.stylecount++;
							this.styles[k_lname].push({
									"lname": k_lname,
									"_index": cs[k_cstype][k_attrname][i_class]["style"]["_index"],
									"lyrlabelkey": (lc["labelkey"] !== undefined ? lc["labelkey"] : ""),
									"thematic_control": (lc["thematic_control"] !== undefined ? lc["thematic_control"] : null),
									"style": clone(cs[k_cstype][k_attrname][i_class]["style"])
								});
						} 
					}
				}
			}

		//} else if (lc["label"] !== undefined && lc["label"] != null && lc["label"]["style"] !== undefined && lc["label"]["style"] != null ) {
			//this.changeVisibility(k_lname, true);
		/* } else if (lc["markerfunction"] !== undefined && lc["markerfunction"] != null) {
			
			console.log(k_lname);
			cs = lc["condstyles"];
			this.createLayerTOCEntry(k_lname);
			if (this.styles[k_lname] === undefined) {
				this.styles[k_lname] = [];
			}
			
			for (let i=0; i<cs.length; i++) {

				cs[i]["_index"] = this.stylecount;
				this.stylecount++;
				this.styles[k_lname].push({
					"lname": k_lname,
					"_index": cs[i]["_index"],
					"lyrlabelkey": (lc["lyrlabelkey"] !== undefined ? lc["lyrlabelkey"] : (lc["labelkey"] !== undefined ? lc["labelkey"] : "")),
					"thematic_control": (cs[i]["thematic_control"] !== undefined ? cs[i]["thematic_control"] : null),
					"style": clone(cs[i]["style"]),
					"fparams": clone(cs[i]["fparams"])	
				});
			}
				*/
		} else if (lc["label"] !== undefined && lc["label"] != null && lc["label"]["style"] !== undefined && lc["label"]["style"] != null ) {

			lc["label"]["style"]["_index"] = this.stylecount;				
			this.stylecount++;
			if (this.styles[k_lname] === undefined) {
				this.styles[k_lname] = [];
			}
			this.createLayerTOCEntry(k_lname, lc["label"]["style"]["_index"]);
			this.styles[k_lname].push({
					"lname": k_lname,
					"_index": lc["label"]["style"]["_index"],
					"lyrlabelkey": (lc["labelkey"] !== undefined ? lc["labelkey"] : ""),
					"thematic_control": (lc["thematic_control"] !== undefined ? lc["thematic_control"] : null),
					"style": clone(lc["label"]["style"])
			});
				
		}
	}
	//console.log(JSON.stringify(this.styles.pec_sru));
}


function GraphicControllerMgr(p_mapctrler, p_elemid) {
	
	this.orderedkeys = [];
	this.graphicControllerCollection = {};
	this.activekey = null;
	
	this.create = function(p_mapctrler, p_elemid, p_canvaskey) {
		if (this.orderedkeys.indexOf(p_elemid) >= 0) {
			throw new Error(String.format("graphicControllerMgr: key already in use: {0}",p_canvaskey));
		}
		this.orderedkeys.push(p_elemid);
		this.graphicControllerCollection[p_canvaskey] = new CanvasController(p_elemid, p_mapctrler);
		this.activekey = p_canvaskey;
	};
	
	this.get = function(opt_canvaskey) {
		let key;
		if (this.orderedkeys.length == 0) {
			throw new Error("graphicControllerMgr: no controllers available");
		}
		if (opt_canvaskey) {
			if (this.graphicControllerCollection[opt_canvaskey] === undefined) {
				throw new Error(String.format("graphicControllerMgr: get - no key: {0}", opt_canvaskey));
			}
			key = opt_canvaskey;
		} else {
			if (this.activekey == null) {
				throw new Error("graphicControllerMgr: no active key");
			}
			key = this.activekey;
		}
		return this.graphicControllerCollection[key];
	};
	
	this.setActive = function(p_canvaskey) {
		if (this.orderedkeys.length == 0) {
			throw new Error("graphicControllerMgr: no controllers available");
		}
		if (this.graphicControllerCollection[p_canvaskey] === undefined) {
			throw new Error(String.format("graphicControllerMgr: setActive - no key: {0}", p_canvaskey));
		}
		this.activekey = p_canvaskey;
	};
	
	this.create(p_mapctrler, p_elemid, "main");
}

function MapAffineTransformation(opt_name) {
	
	/** 
	 * Transformation from ground length into screen dots.
	 * Screen to terrain achieved aplying inverse matrix.
	 */
	
	this.scaling = [];
	m3.identity(this.scaling);
	this.translating = [];
	m3.identity(this.translating);
	this.rotating = [];
	m3.identity(this.rotating);
	this._rotval = null;
	this._transval = [];
	this._name = opt_name;
	this.trace = false;

	this.setName = function(p_name) {
		this._name = p_name;
	};
	
	this.getMatrix = function(out_m) {
		m3.multiply(this.scaling, this.rotating, out_m);
		m3.multiply(out_m, this.translating, out_m);
		//m3.logMx(console, out_m);
	};	
	this.logMx = function() {
		let outmx = [];
		this.getMatrix(outmx);
		m3.logMx(console, outmx);
	};
	this.getInvMatrix = function(out_m) {
		let tmp = [];
		this.getMatrix(tmp);
		m3.inverse(tmp, out_m);
	};	
	this.setScaling = function(p_scalingf) {
		m3.scaling(p_scalingf, -p_scalingf, this.scaling);
		if (this.trace) {
			console.log("setScaling "+p_scalingf+" 1:"+this.getCartoScaleVal(MapCtrlConst.MMPD));
		}
	};
	this.setTranslating = function(p_tx, p_ty) {
		m3.translation(p_tx, p_ty, this.translating);
		if (this.trace) {
			console.trace(['translating', p_tx, p_ty]);
		}
	};
	this.translate = function(p_dx, p_dy) {
		m3.twod_shift(this.translating, p_dx, p_dy);
		if (this.trace) {
			console.trace(['2dshift', p_dx, p_dy]);
		}
	};
	this.getTranslate = function(out_res) {
		out_res.length = 2;
		out_res[0] = this.translating[6];
		out_res[1] = this.translating[7];
	};
	this.setRotating = function(p_deg) {
		m3.rotation(geom.rad2Deg(p_deg), this.rotating);
	};
	this.getScaling = function() {
		return m3.getCartoScaling(this.scaling);
	};
	this.getCartoScaleVal = function(p_mmpd) {
		return Math.round(1000.0 / (m3.getCartoScaling(this.scaling) * p_mmpd));
	};
	this.setScaleFromCartoScale = function(p_scaleval, p_mmpd) {		
		this.setScaling(1000.0 / (p_scaleval * p_mmpd));
	}
}



