var Explosion = function(gl) {
	this._gl = gl;
	this._ts = Date.now();
	this._lifetime = 3000;
	this._position = mat4.create();
	
	var color = vec3.fromValues(0.2+0.8*Math.random(), 0.2+0.8*Math.random(), 0.2+0.8*Math.random());

	this._particleSets = [
		new ParticleSet(gl, color)
	];
}

Explosion.prototype.render = function(program, now, vMatrix) {
	var age = now - this._ts;
	if (age > this._lifetime) { return false; }

	var gl = this._gl;
	var a = program.attributes;
	var u = program.uniforms;
	
	var modelView = mat4.multiply(mat4.create(), vMatrix, this._position);

	gl.uniform1i(u.uStartTime, this._ts);
	gl.uniform1f(u.uLifetime, this._lifetime);
	gl.uniformMatrix4fv(u.uModelView, false, modelView);

	this._particleSets.forEach(function(ps) {
		ps.render(program);
	});
	
	return true;
}
