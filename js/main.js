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

var program = new Program(gl, {
	vsId: "vs",
	fsId: "fs",
	attributes: ["aPosition", "aVelocity"],
	uniforms: ["uModelView", "uProjection", "uStartTime", "uCurrentTime", "uLifetime", "uGravity", "uColor"]
});

program.use();
gl.uniform3f(program.uniforms.uGravity, 0, -1e-7, 0);

var eye = vec3.create();
var center = vec3.create();
var up = vec3.fromValues(0, 1, 0);

var render = function() {
	var u = program.uniforms;
	var now = Date.now();

	var t = now / 10000;
	eye[0] = 10*Math.cos(t);
	eye[2] = 10*Math.sin(t);
	camera.lookAt(eye, center, up);

	gl.clear(gl.COLOR_BUFFER_BIT);

//	gl.uniformMatrix4fv(u.uView, false, camera.vMatrix);
	gl.uniformMatrix4fv(u.uProjection, false, camera.pMatrix);
	gl.uniform1i(u.uCurrentTime, now);
	
	scene = scene.filter(function(item) {
		return item.render(program, now, camera.vMatrix);
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
