var Render = {
	scene: [],
	gl: null,
	_node: null,
	_stars: null,
	_programs: {},
	_gravity: vec3.fromValues(0, -1e-7, 0),
	_eye: vec3.create(),
	_center: vec3.create(),
	_up: vec3.fromValues(0, 1, 0),
	
	handleEvent: function(e) {
		switch (e.type) {
			case "load":
				this._init();
			break;
			
			case "resize":
				this._sync();
			break;
		}
	},
	
	_init: function() {
		this._node = document.createElement("canvas");
		var o = {
			alpha: false
		}
		this.gl = this._node.getContext("webgl", o) || this._node.getContext("experimental-webgl", o);
		if (!this.gl) {
			alert("Sorry, no WebGL API support detected. Get a modern browser and come back again.");
			return;
		}

		document.body.appendChild(this._node);
		var gl = this.gl;

		this._programs.points = new Program.Points(gl);
		this._programs.explosions = new Program.ParticleSet(gl);

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		this._camera = new Camera();
		this._stars = new Stars(gl);

		window.addEventListener("resize", this);
		this._sync();
	
		this._tick = this._tick.bind(this);
		this._tick();
	},
	
	_sync: function() {
		var w = this._node.parentNode.offsetWidth;
		var h = this._node.parentNode.offsetHeight;
		this._node.width = w;
		this._node.height = h;
		this._camera.syncPort(this._node);
		this.gl.viewport(0, 0, w, h);
		if (w != this.gl.drawingBufferWidth || h != this.gl.drawingBufferHeight) {
			alert("Your WebGL implementation seems to be having troubles with its drawing buffer size."); 
		}
	},

	_render: function() {
		var gl = this.gl;
		var now = Date.now();
		var t = now / 3e4;
		var R = 20;
		this._eye[0] = R*Math.cos(t);
		this._eye[2] = R*Math.sin(t);
		this._camera.lookAt(this._eye, this._center, this._up);

		gl.clear(gl.COLOR_BUFFER_BIT);

		/* 1. background */
		this._programs.points.use();
		this._stars.render(this._programs.points, this._camera);
		
		/* 2. explosions */
		var program = this._programs.explosions;
		program.use();
		var u = program.uniforms;

		gl.uniformMatrix4fv(u.uProjection, false, this._camera.pMatrix);
		gl.uniform3fv(u.uGravity, this._gravity);
		gl.uniform1i(u.uCurrentTime, now);
		
		this.scene = this.scene.filter(function(item) {
			return item.render(program, now, this._camera.vMatrix);
		}, this);
	},

	_tick: function() {
		requestAnimationFrame(this._tick);
		this._render();
	}

}
window.addEventListener("load", Render);
