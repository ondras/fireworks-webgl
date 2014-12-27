Program.Points = function(gl) {
	var vs = this._get("shaders/points.vertex.glsl");
	var fs = this._get("shaders/points.fragment.glsl");

	var attributes = ["aPosition", "aColor", "aSize"];
	var uniforms = ["uViewProjection"];

	Program.call(this, gl, {
		vs: vs,
		fs: fs,
		attributes: attributes,
		uniforms: uniforms
	});	
}
Program.Points.prototype = Object.create(Program.prototype);

Program.Points.prototype._get = function(url) {
	var xhr = new XMLHttpRequest();
	xhr.open("get", url + "?" + Math.random(), false);
	xhr.send();
	return xhr.responseText;
}
