var ParticleSet = function(gl, color) {
	this._gl = gl;
	this._buffers = {
		position: gl.createBuffer(),
		color: gl.createBuffer(),
		velocity: gl.createBuffer()
	}
	
	this._build(gl, this._buffers);
	this._color = color;
}

ParticleSet.prototype._build = function(gl, buffers) {
	this._count = 1000;
	
	var center = vec3.fromValues(2*(Math.random() - 0.5), 2*(Math.random() - 0.5), 2*(Math.random() - 0.5));
	var tmp = vec3.create();
	
	var position = [];
	var velocity = [];
	
	for (var i=0;i<this._count;i++) {
		position.push(center[0], center[1], center[2]);
		vec3.random(tmp, 0.3);
		velocity.push(tmp[0], tmp[1], tmp[2]);
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(velocity), gl.STATIC_DRAW);
}

ParticleSet.prototype.render = function(program) {
	var gl = this._gl;
	var a = program.attributes;
	var u = program.uniforms;
	var buffers = this._buffers;

	gl.uniform3fv(u.uColor, this._color);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.vertexAttribPointer(a.aPosition, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
	gl.vertexAttribPointer(a.aVelocity, 3, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.POINTS, 0, this._count);
}
