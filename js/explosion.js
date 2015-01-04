/**
 * @param {WebGL} gl
 * @param {float} [force=0.5] 0..1
 */
var Explosion = function(gl, force) {
	this._gl = gl;
	this._ts = Date.now();

	force = force || 0.5;
	force = 0.1 + force + 0.3*Math.random();

	this._lifetime = 1500 + 1000*force + 1500*Math.random();
	this._position = mat4.create();

	var center = vec3.create();
	for (var i=0;i<3;i++) {
		center[i] = 10*(Math.random()-.5);
	}
	mat4.translate(this._position, this._position, center);
	mat4.rotateX(this._position, this._position, Math.random()*Math.PI);
	mat4.rotateY(this._position, this._position, Math.random()*Math.PI);
	
	this._particleSets = [];
	
	var r = Math.random();
	switch (true) {
		case (r > 0.7):
			this._buildSet("sphere", force, 0.5);
			this._buildSet("sphere", force, 0.5);
		break;

		case (r > 0.4):
			this._buildSet("sphere", force);
		break;

		case (r > 0.35):
			this._buildSet("circle", force, 0.5);
			this._buildSet("circle", force, 0.5);
		break;

		case (r > 0.3):
			this._buildSet("circle", force);
		break;

		case (r > 0.2):
			this._buildSet("circle", force*0.7);
			this._buildSet("circle", force*1.2);
		break;

		case (r > 0.1):
			this._buildSet("circle", force*0.7);
			this._buildSet("circle", force*1);
			this._buildSet("circle", force*1.3);
		break;

		case (r > 0.05):
			this._buildSet("sphere", force*0.7);
			this._buildSet("circle", force*1);
			this._buildSet("circle", force*1.3);
		break;

		default:
			this._buildSet("sphere", force*0.7);
			this._buildSet("circle", force*1.2);
		break;
	}
}

Explosion.prototype.render = function(program, now, vMatrix) {
	var age = now - this._ts;
	if (age > this._lifetime) { 
		this._particleSets.forEach(function(ps) {
			ps.destroy();
		});
		return false;
	}

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

Explosion.prototype._buildSet = function(type, force, amount) {
	var color = vec3.create();
	color[0] = 0.4 + 0.6*Math.random();
	color[1] = 0.3 + 0.6*Math.random();
	color[2] = 0.2 + 0.6*Math.random();
	this._particleSets.push(new ParticleSet(this._gl, type, force, color, amount));
}
