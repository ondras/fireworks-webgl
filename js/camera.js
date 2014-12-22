var Camera = function(options) {
	this._options = {
		fov: 45 * Math.PI/180,
		aspect: 1,
		near: 0.1,
		far: 3000
	}
	this.pMatrix = mat4.create();
	this.vMatrix = mat4.create();
	this.configure(options);
}

Camera.prototype.configure = function(options) {
	for (var p in options) { this._options[p] = options[p]; }
	mat4.perspective(this.pMatrix, this._options.fov, this._options.aspect, this._options.near, this._options.far);
}

Camera.prototype.lookAt = function(eye, center, up) {
	mat4.lookAt(this.vMatrix, eye, center, up);
}

Camera.prototype.lookFrom = function(eye, rotX, rotY, rotZ) {
	var translation = vec3.scale(vec3.create(), eye, -1);
	mat4.identity(this.vMatrix);
	mat4.rotateX(this.vMatrix, this.vMatrix, rotX);
	mat4.rotateY(this.vMatrix, this.vMatrix, rotY);
	mat4.rotateZ(this.vMatrix, this.vMatrix, rotZ);
	mat4.translate(this.vMatrix, this.vMatrix, translation);
}

Camera.prototype.syncPort = function(node) {
	this.configure({aspect: node.width/node.height});
	return this;
}
