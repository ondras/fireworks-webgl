var Explosion = function(gl, force) {
	this._gl = gl;
	this._ts = Date.now();
	this._lifetime = 2000 + 2000*Math.random();
	this._position = mat4.create();

	var center = vec3.create();
	for (var i=0;i<3;i++) {
		center[i] = 10*(Math.random()-.5);
	}
	mat4.translate(this._position, this._position, center);
	
	var color = vec3.create();
	for (var i=0;i<color.length;i++) {
		color[i] = 0.4 + 0.6*Math.random();
	}

	force = (force || 0.5) + 0.5*Math.random();

	this._particleSets = [
		new ParticleSet(gl, color, force)
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
