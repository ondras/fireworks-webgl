var node = document.createElement("canvas");
node.width = 800;
node.height = 600;
document.body.appendChild(node);
var o = {
	alpha: false
}
var gl = node.getContext("webgl", o);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
var camera = new Camera();

var sync = function() {
	node.width = node.parentNode.offsetWidth;
	node.height = node.parentNode.offsetHeight;
	camera.syncPort(node);
	gl.viewport(0, 0, node.width, node.height);
}
window.onresize = sync;
sync();

var scene = [];
var stars = new Stars(gl);

var programs = {
	points: new Program.Points(gl),
	explosions: new Program.ParticleSet(gl)
}

var gravity = vec3.fromValues(0, -1e-7, 0);
var eye = vec3.create();
var center = vec3.create();
var up = vec3.fromValues(0, 1, 0);


var render = function() {
	var now = Date.now();
	var t = now / 2e4;
	eye[0] = 10*Math.cos(t);
	eye[2] = 10*Math.sin(t);
	camera.lookAt(eye, center, up);

	gl.clear(gl.COLOR_BUFFER_BIT);

	/* 1. background */
	programs.points.use();

	stars.render(programs.points, camera);
	
	/* explosions */
	programs.explosions.use();
	var u = programs.explosions.uniforms;

	gl.uniformMatrix4fv(u.uProjection, false, camera.pMatrix);
	gl.uniform3fv(u.uGravity, gravity);
	gl.uniform1i(u.uCurrentTime, now);
	
	scene = scene.filter(function(item) {
		return item.render(programs.explosions, now, camera.vMatrix);
	});
}

var tick = function() {
	requestAnimationFrame(tick);
	render();
}
tick();

var add = function() {
	scene.push(new Explosion(gl));
	setTimeout(add, 500 + 2000*Math.random());
}
add();
