var WebGL = function(camera, options) {
	this._programs = {};

	var o = {alpha:false, antialias:false};
	for (var p in options) { o[p] = options[p]; }
	var gl = this._node.getContext("webgl", o) || this._node.getContext("experimental-webgl", o);
	if (!gl) { throw new Error("WebGL not supported"); }
	this._ctx = gl;

	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	gl.clearColor(0, 0, 0, 1);
}
