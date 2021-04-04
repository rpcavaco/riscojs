
function SpatialIndexer(p_mapcontroller, p_step) {
	
	this.getClassStr = function() {
		return "SpatialIndexer";
	};
	this.i18nmsgs = {
			"pt": {
				"NONEW": "'SpatialIndexer' é classe, o seu construtor foi invocado sem 'new'",
				"NOMAPCTRL": "'SpatialIndexer' requer um objecto MapController, foi passada uma referencia nula",
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
		return this.i18nmsgs[lang][p_msgkey]
	};

	if ( !(this instanceof arguments.callee) )
		throw new Error(this.msg("NONEW"));
	
	if (p_mapcontroller === null) 
		throw new Error(this.msg("NOMAPCTRL"));
	
	this.mapcontroller = p_mapcontroller;
	this.matrix = {};
	this.added_points_count = 0;
	this.added_lines_count = 0;
	this.added_polys_count = 0;
	
	var cdims = this.mapcontroller.getGraphicController().getCanvasDims();
	
	this.step = p_step;	
	this.width = parseInt(Math.ceil(cdims[0] / this.step));
	this.height = parseInt(Math.ceil(cdims[1] / this.step));
	
	this.resize = function() {
		var cdims = this.mapcontroller.getGraphicController().getCanvasDims();
		
		this.width = parseInt(Math.ceil(cdims[0] / this.step));
		this.height = parseInt(Math.ceil(cdims[1] / this.step));
	};
	this.clear = function() {
		this.matrix = {};
		this.added_points_count = 0;
		this.added_lines_count = 0;
		this.added_polys_count = 0;
	};

	this.addToMatrix = function(p_row, p_col,  p_layername, p_objid) 
	{
		var idx = (p_row*this.width)+p_col;

		if (this.matrix[p_layername] === undefined) {
			this.matrix[p_layername] = [];
		}

		if (this.matrix[p_layername][idx] === undefined) {
			this.matrix[p_layername][idx] = [];
		} 
		
		if (this.matrix[p_layername][idx].indexOf(p_objid) < 0) {			
			this.matrix[p_layername][idx].push(p_objid);
		}
	};

	// TODO
	this.addPoly = function(p_scrcoords, p_path_levels, p_layername, p_objid) 
	{		
		var env = [null, null, null, null];
		
		function cycleCoords(pp_coords, p_spatindex, p_envidxs, pp_objid) 
		{		
			var j, dy, dx, m, col, row, fincol, finrow, d = 0; n;
			var c, xInc, yInc;
			var ctrcnt = 10000;
			var n = pp_coords.length;
			var step = p_spatindex.step;

			function expandEnv(p_row, p_col, pp_envidxs) 
			{
				if (p_col < pp_envidxs[0] || pp_envidxs[0] == null) {
					pp_envidxs[0] = p_col;
				}
				if (p_col > pp_envidxs[2] || pp_envidxs[2] == null) {
					pp_envidxs[2] = p_col;
				}
				if (p_row < pp_envidxs[1] || pp_envidxs[1] == null) {
					pp_envidxs[1] = p_row;
				}
				if (p_row > pp_envidxs[3] || pp_envidxs[3] == null) {
					pp_envidxs[3] = p_row;
				}			
			}
			
			for (var i=0; i<n-2; i+=2) 
			{
				j = i + 2;
				
				dx = pp_coords[j] - pp_coords[i];
				dy = pp_coords[j+1] - pp_coords[i+1];

				col = Math.floor(pp_coords[i] / step);
				row = Math.floor(pp_coords[i+1] / step);
				fincol = Math.floor(pp_coords[j] / step);
				finrow = Math.floor(pp_coords[j+1] / step);
				
				expandEnv(row, col, p_envidxs);
				
				if (col === undefined) {
					throw new Error("spindex addPoly col:"+col);
				}
				if (row === undefined) {
					throw new Error("spindex addPoly row:"+row);
				}
				if (fincol === undefined) {
					throw new Error("spindex addPoly fincol:"+fincol);
				}
				if (finrow === undefined || isNaN(finrow)) {
					throw new Error("spindex addPoly finrow:"+finrow+" idx:"+(j+1)+" lastcoord:"+pp_coords[j+1]);
				}
			
				xInc = 1;
				yInc = 1;
				if (dx < 0) {
					xInc = -1;
					dx = -dx;
				}
				if (dy < 0) {
					yInc = -1;
					dy = -dy;
				}

				if (dy <= dx) 
				{
					c = 2*dx; 
					m = 2*dy;	
				}
				else 
				{
					c = 2*dy; 
					m = 2*dx;
				}
				
				if (dy <= dx) 
				{
					while (ctrcnt > 0) 
					{
						ctrcnt--;
						p_spatindex.addToMatrix(row, col,  p_layername, pp_objid);
						if (col == fincol) {
							break;
						}
						col += xInc;
						d += m;
						if (d > dx) {
							row += yInc;
							d -= c;
						}
						expandEnv(row, col, p_envidxs);
					}
					if (ctrcnt <= 0) {
						throw new Error("spindex addPoly ctrcnt A cycleCoords:"+ctrcnt+" fincol:"+fincol+" col:"+col);
					}
				}
				else 
				{
					while (ctrcnt > 0) 
					{
						ctrcnt--;
						p_spatindex.addToMatrix(row, col,  p_layername, pp_objid);
						if (row == finrow) {
							break;
						}
						row += yInc;
						d += m;
						if (d > dy) {
							col += xInc;
							d -= c;
						}
						expandEnv(row, col, p_envidxs);
					}				
					if (ctrcnt <= 0) {
						throw new Error("spindex addPoly ctrcnt B cycleCoords:"+ctrcnt+" finrow:"+finrow+" row:"+row);
					}			
				}	
			}		
		}

		var has_points = false;
		switch (p_path_levels)
		{			
			case 1:
				if (p_scrcoords.length > 0) {
					has_points = true;
				}
				cycleCoords(p_scrcoords, this, env, p_objid);
				break;
				
			case 2:
				for (var j=0; j<p_scrcoords.length; j++) {
					if (!has_points && p_scrcoords[j].length > 0) {
						has_points = true;
					}
					cycleCoords(p_scrcoords[j], this, env, p_objid);
				}
				break;
				
			case 3:
				for (var i=0; i<p_scrcoords.length; i++) 
				{
					for (var j=0; j<p_scrcoords[i].length; j++) {
						if (!has_points && p_scrcoords[i][j].length > 0) {
							has_points = true;
						}
						cycleCoords(p_scrcoords[i][j], this, env, p_objid);
					}
				}
				break;
		}	

		var cell, tmpcell, idx, tmpidx, insidx, found_count = 0;
		var cells_to_fill = [];
		var found_bool = false;
		var doregistervoids = false;
		var dofillvoids = false;
		
		var layercell = this.matrix[p_layername];

		if (layercell!=null && has_points) 
		{
			for (var row=env[1]; row<=env[3]; row++) 
			{
				for (var col=env[0]; col<=env[2]; col++) 
				{
					idx = (row*this.width)+col;
					cell = layercell[idx];

					dofillvoids = false;
					if (cell != null && cell.indexOf(p_objid) >= 0) {
						if (!found_bool) {
							if (doregistervoids && cells_to_fill.length > 0) {
								dofillvoids = true;
							}
							doregistervoids = false;
							found_bool = true;
						}
					} else {
						if (found_bool) {
							doregistervoids = true;
							found_bool = false;
						}
					}
					
					if (doregistervoids) {
						cells_to_fill.push(idx);
					}
					
					if (dofillvoids) {
						for (var k=0; k<cells_to_fill.length; k++) {
							tmpidx = cells_to_fill[k];
							tmpcell = layercell[tmpidx];
							if (tmpcell == null) {
								this.matrix[p_layername][tmpidx] = [];
								tmpcell = this.matrix[p_layername][tmpidx];
							}
							if (tmpcell.indexOf(p_objid) < 0) {
								tmpcell.push(p_objid);
							}
						}
						cells_to_fill.length = 0;
					}

				}
				cells_to_fill.length = 0;
			}
			
		}
		
		this.added_polys_count++;
	};

	this.addLine = function(p_scrcoords, p_path_levels, p_layername, p_objid) 
	{
		function cycleCoords(pp_coords, p_spatindex) 
		{		
			var j, dy, dx, m, col, row, fincol, finrow, d = 0; n;
			var c, xInc, yInc;
			var ctrcnt = 10000;
			var n = pp_coords.length;
			
			var step = p_spatindex.step;
			
			for (var i=0; i<n-2; i+=2) 
			{
				j = i + 2;
				
				dx = pp_coords[j] - pp_coords[i];
				dy = pp_coords[j+1] - pp_coords[i+1];

				col = Math.floor(pp_coords[i] / step);
				row = Math.floor(pp_coords[i+1] / step);
				fincol = Math.floor(pp_coords[j] / step);
				finrow = Math.floor(pp_coords[j+1] / step);
				
				if (col === undefined) {
					throw new Error("spindex addLine col:"+col);
				}
				if (row === undefined) {
					throw new Error("spindex addLine row:"+row);
				}
				if (fincol === undefined) {
					throw new Error("spindex addLine fincol:"+fincol);
				}
				if (finrow === undefined || isNaN(finrow)) {
					throw new Error("spindex addLine finrow:"+finrow+" idx:"+(j+1)+" lastcoord:"+pp_coords[j+1]);
				}
			
				xInc = 1;
				yInc = 1;
				if (dx < 0) {
					xInc = -1;
					dx = -dx;
				}
				if (dy < 0) {
					yInc = -1;
					dy = -dy;
				}
			
				if (dy <= dx) 
				{
					c = 2*dx; 
					m = 2*dy;
					
					while (ctrcnt > 0) 
					{
						ctrcnt--;
						p_spatindex.addToMatrix(row, col,  p_layername, p_objid);
						if (col == fincol) {
							break;
						}
						col += xInc;
						d += m;
						if (d > dx) {
							row += yInc;
							d -= c;
						}
					}
					if (ctrcnt <= 0) {
						throw new Error("spindex addLine ctrcnt A cycleCoords:"+ctrcnt+" fincol:"+fincol+" col:"+col);
					}
				}
				else 
				{
					c = 2*dy; 
					m = 2*dx;
					
					while (ctrcnt > 0) 
					{
						ctrcnt--;
						p_spatindex.addToMatrix(row, col,  p_layername, p_objid);
						if (row == finrow) {
							break;
						}
						row += yInc;
						d += m;
						if (d > dy) {
							col += xInc;
							d -= c;
						}
						if (ctrcnt <= 0) {
							throw new Error("spindex addLine ctrcnt B cycleCoords:"+ctrcnt+" finrow:"+finrow+" row:"+row);
						}			
					}				
				}	
			}		
		}

		switch (p_path_levels)
		{			
			case 1:
				cycleCoords(p_scrcoords, this);
				break;
				
			case 2:
				for (var j=0; j<p_scrcoords.length; j++) {
					cycleCoords(p_scrcoords[j], this);
				}
				break;
				
			case 3:
				for (var i=0; i<p_scrcoords.length; i++) 
				{
					for (var j=0; j<p_scrcoords[i].length; j++) {
						cycleCoords(p_scrcoords[i][j], this);
					}
				}
				break;
		}	
			
		this.added_lines_count++;
	};
			
	this.addPoint = function(p_scrptx, p_scrpty, p_layername, p_objid) 
	{
		p_scrpt = [p_scrptx, p_scrpty];
		
		var col = Math.floor(p_scrpt[0] / this.step);
		var row = Math.floor(p_scrpt[1] / this.step);
		
		this.addToMatrix(row, col,  p_layername, p_objid);
			
		this.added_points_count++;
	};

	this.findNearestObject = function(p_scr_pt, p_pix_radius, p_layername) 
	{
		var col = Math.floor(p_scr_pt[0] / this.step);
		var row = Math.floor(p_scr_pt[1] / this.step);
		var ret;
		
		var cell_radius = Math.ceil(p_pix_radius / this.step);	
		//console.log("p_pix_radius:"+p_pix_radius+", cell_radius:"+cell_radius+", step:"+this.step);
		
		var check_items=[], found_oid=null, found_dist=null;
		
		if (this.added_points_count + this.added_lines_count + this.added_polys_count == 0) {
			return [];
		}

		var checkobj = {
			found_oid: null,
			found_dist: 9999999,
			aux: null
		};
		
		function check(p_matrix, p_mwidth, p_mapctrller, p_col, p_row, p_pt, p_radius, p_layer, out_checkobj) 
		{
			var ci = 0;
			var cell=null, layercell = p_matrix[p_layer];
			var feat, featid, dist, mindist;
			var idx = (p_row*p_mwidth)+p_col;
			
			var ret_np = null;
			
			if (layercell !== undefined && layercell != null) 
			{
				cell = layercell[idx];
				if (cell !== undefined && cell != null) 
				{
					featid = cell[ci];
					while (featid !== undefined && featid !== null) 
					{
						feat = p_mapctrller.getFeature(p_layername, featid);
						if (feat == null) {
							console.log("feat null, id:"+featid);
						} else {
							switch (feat.type) {
							
								// TODO: mpoint
								case "point":
									dist = geom.distance(p_pt, [feat.points[0], feat.points[1]]);
									break;

								case "mline":
								case "line":
									dist = geom.distanceToLine(feat.points, feat.path_levels, p_pt);
									break;

								case "mpoly":
								case "poly":
								
									dist = geom.distanceToPoly(feat.points, feat.path_levels, p_pt);
									break;
									
							}
							
							if (dist <= p_radius && dist < out_checkobj.found_dist) {
								out_checkobj.found_dist = dist;
								out_checkobj.found_oid = featid;
								out_checkobj.aux = feat.attrs.n_policia;
							}
							
						}
						featid = cell[ci];
						ci++;
					}
				}
			}
		}
		
		var mincol = col - cell_radius;
		if (mincol < 0) {
			mincol = 0;
		}
		var minrow = row - cell_radius;
		if (minrow < 0) {
			minrow = 0;
		}
		var maxcol = col + cell_radius;
		if (maxcol > this.width) {
			maxcol = this.width;
		}
		var maxrow = row + cell_radius;
		if (maxrow > this.height) {
			maxrow = this.height;
		}
		
		var checkobj = {
			found_oid: null,
			found_dist: 9999999,
			aux: null
		};
		
		for (var i=mincol; i<maxcol; i++) {
			for (var j=minrow; j<maxrow; j++) {
				check(this.matrix, this.width, this.mapcontroller, i, j, 
						p_scr_pt, p_pix_radius, p_layername, checkobj);
			}
		}
		
		if (checkobj.found_oid !== null) {
			ret = [checkobj.found_oid, checkobj.found_dist];
		} else {
			ret = [];
		}

		return ret;
	};
	
}
