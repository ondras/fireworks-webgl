var Program = function(gl, def) {
	this.gl = gl;
	this.attributes = {};
	this.uniforms = {};

	var vs = (def.vs ? this._shaderFromString(gl.VERTEX_SHADER, def.vs) : this._shaderFromId(def.vsId));
	var fs = (def.fs ? this._shaderFromString(gl.FRAGMENT_SHADER, def.fs) : this._shaderFromId(def.fsId));

	this.program = gl.createProgram();
	gl.attachShader(this.program, vs);
	gl.attachShader(this.program, fs);
	gl.linkProgram(this.program);

	if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
		throw new Error("Could not link the shader program");
	}

	gl.deleteShader(vs);
	gl.deleteShader(fs);

	(def.attributes || []).forEach(function(name) {
		this.attributes[name] = gl.getAttribLocation(this.program, name);
	}, this);

	(def.uniforms || []).forEach(function(name) {
		this.uniforms[name] = gl.getUniformLocation(this.program, name);
	}, this);
}

Program.prototype.use = function() {
	this.gl.useProgram(this.program);

	for (var p in this.attributes) { 
		this.gl.enableVertexAttribArray(this.attributes[p]);
	}
}

Program.prototype._shaderFromId = function(id) {
	var node = document.querySelector("#" + id);
	if (!node) { throw new Error("Cannot find shader for ID '"+id+"'"); }

	var gl = this.gl;

	var src = "";
	var child = node.firstChild;

	while (child) {
		if (child.nodeType == child.TEXT_NODE) { src += child.textContent; }
		child = child.nextSibling;
	}

	if (node.type == "x-shader/x-fragment") {
		var type = gl.FRAGMENT_SHADER;
	} else if (node.type == "x-shader/x-vertex") {
		var type = gl.VERTEX_SHADER;
	} else {
		throw new Error("Unknown shader type '" + node.type +"'");
	}

	return this._shaderFromString(type, src);
}

Program.prototype._shaderFromString = function(type, str) {
	var gl = this.gl;

	var shader = gl.createShader(type);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error("Could not compile shader: " + gl.getShaderInfoLog(shader));
	}
	return shader;
}
