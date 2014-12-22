var Stars = function(gl) {
	this._gl = gl;

	this._buffers = {
		position: gl.createBuffer(),
		color: gl.createBuffer(),
		size: gl.createBuffer()
	}
	
	this._build(gl, this._buffers);
}

Stars.prototype._build = function(gl, buffers) {
	this._count = 10000;
	
	var tmp = vec3.create();
	var position = [];
	var color = [];
	var size = [];
	
	for (var i=0;i<this._count;i++) {
		vec3.random(tmp, 1000);
		position.push(tmp[0], tmp[1], tmp[2]);
		
		var c = 0.2 + Math.random()*0.5;
		
		color.push(c, c, c);
		size.push(1 + 2*Math.random());
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.size);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(size), gl.STATIC_DRAW);
}

Stars.prototype.render = function(program, camera) {
	var gl = this._gl;
	var a = program.attributes;
	var u = program.uniforms;
	var buffers = this._buffers;

	var viewProjection = mat4.multiply(mat4.create(), camera.pMatrix, camera.vMatrix);
	gl.uniformMatrix4fv(u.uViewProjection, false, viewProjection);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.vertexAttribPointer(a.aPosition, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
	gl.vertexAttribPointer(a.aColor, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.size);
	gl.vertexAttribPointer(a.aSize, 1, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.POINTS, 0, this._count);
}
