
# RISCO JS map image content generation

Rui Cavaco, Feb 2022

RISCO JS is, at present day, a map image generator and manager completely relying on HTML5 Canvas.

This document describes:

- the graphics contexts used, their management, and respective **canvas** elements
- the image generation lifecycle  
- the process of generating the map image

## *Canvas* element

«*The Canvas API provides a means for drawing graphics via JavaScript and the HTML* &lt;canvas&gt; *element. Among other things, it can be used for animation, game graphics, data visualization, photo manipulation, and real-time video processing.*

*The Canvas API largely focuses on 2D graphics. The WebGL API, which also uses the &lt;canvas&gt; element, draws hardware-accelerated 2D and 3D graphics.*»

-- from [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

The ***canvas*** element is an HTML DOM element filling a rectangular area in the document over which vector and raster graphics are rendered.

## Graphic contexts and *canvas* elements

## UML Diagrams

```mermaid
classDiagram
	class MapController{
		grCtrlrMgr GraphicControllerMgr
		MapController(p_elemid, po_initconfig, p_debug_callsequence) void
		+create()
		+getGraphicController(string) > grCtrlrMgr.get(string) CanvasController
	}
	class GraphicControllerMgr{
		orderedkeys List~string~
		graphicControllerCollection CanvasController~string~
		activekey string
		GraphicControllerMgr(p_mapctrler: MapController, p_elemid: string)
		create(p_mapctrler: MapController, p_elemid: string, p_canvaskey: string) void
		get(string = activekey) CanvasController
		setActive(p_canvaskey: string) void
	}
	class CanvasController{
		- _mapcontroller MapController
		- _ctxorder List~string~
		- _ctxdict HTML5Canvas~string~
		defaultDisplayLayer HTML5Canvas
		getTopCanvasElement() HTML5Canvas
		getDefaultDisplayLayer() HTML5Canvas
		setActiveDisplayLayer(string) void
		getCtx(p_displayer: string) HTML5Canvas
		saveCtx(p_displayer: string) void
		restoreCtx(p_displayer: string) void
		prepDisplay(opt_force: boolean = null) void
		clearImageMarkers() void
		clearDisplay(opt_background: missing) void
		clearDisplayLayer(p_layername: string, opt_background: ?) void
		getCanvasDims() missing
		getStrokeStyle(opt_displaylayer: string) string
		getFillStyle(opt_displaylayer: string) string
		getLineWidth(opt_displaylayer: string) string
		getLineDash()
		getFont()
		getTextAlign()
		getBaseline()
		setStrokeStyle()
		setFillStyle()
		setLineWidth()
		setLineDash()
		setLineJoin()
		setLineCap()
		setFont()
		setTextAlign()
		setBaseline()
		getFontSize()
		setFontSize()
		setShadowColor()
		getShadowColor()
		setShadowOffsetX()
		getShadowOffsetX()
		setShadowOffsetY()
		getShadowOffsetY()
		setShadowBlur()
		getShadowBlur()
		setGlobalCompositeOperation()
		setLabelBackground()
		getLabelBackground()
		measureTextWidth()
		plainText()
		rotatedText() 
		applyStyle()
		drawSimplePath()
		drawMultiplePath()
		drawMultiplePathCollection()
		drawCenteredRect()
		drawCrossHairs()
		drawDiamond()
		drawSquare()
		drawCircle()
		drawRect()
		tintImgFilter()
		toGrayScaleImgFilter(p_ctx, p_imgobj, p_x, p_y, p_ctxw, p_ctxh, null_filteradicdata)
		toGrayScaleImgFilter()
		drawImage()
		setMarkVertexFunc()
		setMarkVertices()
		setMarkMidpointFunc()
		setMarkMidpoints()
		setMarker()
		resizeCanvasToDisplaySize()
	}

	MapController "1" o.. "1" GraphicControllerMgr
	GraphicControllerMgr "1" *.. "*" CanvasController
```








