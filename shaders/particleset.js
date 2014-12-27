Program.ParticleSet = function(gl) {
	var vs = this._get("shaders/particleset.vertex.glsl");
	var fs = this._get("shaders/particleset.fragment.glsl");
	
	var attributes = ["aVelocity"];
	var uniforms = ["uModelView", "uProjection", "uStartTime", "uCurrentTime", "uLifetime", "uGravity", "uColor"];
	
	Program.call(this, gl, {
		vs: vs,
		fs: fs,
		attributes: attributes,
		uniforms: uniforms
	});	
}
Program.ParticleSet.prototype = Object.create(Program.prototype);

Program.ParticleSet.prototype._get = function(url) {
	var xhr = new XMLHttpRequest();
	xhr.open("get", url + "?" + Math.random(), false);
	xhr.send();
	return xhr.responseText;
}
