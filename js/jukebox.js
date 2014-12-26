var C = [null, null];
var deltas = [];
var tmp = null;

var Jukebox = {
	_ctx: null,
	_audio: new Audio(),
	_data: null,
	_analyser: null,
	_lastValue: 0,
	_node: document.createElement("div"),

	handleEvent: function(e) {
		switch (e.type) {
			case "load":
				this._init();
			break;
			
			case "change":
				this._audio.src = "ogg/" + e.target.value;
				this._audio.play();
			break;
			
			case "playing":
				/* fixme mode resolution */
				var s = this._node.querySelector("select");
				document.querySelector("#banner").innerHTML = s.options[s.selectedIndex].innerHTML;
			break;
			
			case "ended":
				document.querySelector("#banner").innerHTML = "";
				/* fixme only in playlist */
				this._next();
			break;
		}
	},
	
	_init: function() {
		try {
			this._ctx = new (window.AudioContext || window.webkitAudioContext)();
		} catch (e) {
			alert("Sorry, no Web Audio API support detected. Get a modern browser and come back again.");
			return;
		}

		document.body.appendChild(this._node);
		this._node.id = "jukebox";
		this._audio.addEventListener("ended", this);
		this._audio.addEventListener("playing", this);
		
		this._analyser = this._ctx.createAnalyser();
		this._analyser.fftSize = 32;
		this._analyser.smoothingTimeConstant = 0.5
		this._analyser.connect(this._ctx.destination);

		var source = this._ctx.createMediaElementSource(this._audio);
		source.connect(this._analyser);
		this._data = new Uint8Array(this._analyser.frequencyBinCount);

		this._buildSelect();
		this._next();

		this._tick = this._tick.bind(this);
		setInterval(this._tick, 17);
		
		for (var i=0;i<C.length;i++) {
			var canvas = document.createElement("canvas");
			C[i] = canvas;
			canvas.height = 260;
			canvas.style.top = (260*i) + "px";
			document.body.appendChild(canvas);
			canvas.style.position = "absolute";
		}
	},
	
	_buildSelect: function() {
		var songs = [
			{name:"ZZ Top &ndash; Gimme All Your Lovin'", file:"zz.ogg", threshold:1.5},
			{name:"Peter Gabriel &ndash; Sledge Hammer", file:"hammer.ogg", threshold:2},
			{name:"Lenny Kravitz &ndash; American Woman", file:"woman.ogg", threshold:2},
			{name:"Phatt Bastard &amp; The Drummachine", file:"phatt.ogg", threshold:1},
			{name:"Primal Scream &ndash; Rocks", file:"rocks.ogg", threshold:2},
			{name:"Propellerheads &ndash; History Repeating", file:"history.ogg", threshold:2},
			{name:"Mousse T. &ndash; Horny", file:"horny.ogg", threshold:2.5},
			{name:"Tom Jones &ndash; Sexbomb", file:"sexbomb.ogg", threshold:1.5}
		];
		
		var s = document.createElement("select");
		s.addEventListener("change", this);
		this._node.appendChild(s);

		songs.forEach(function(song) {
			var o = document.createElement("option");
			o.value = song.file;
			o.innerHTML = song.name;
			s.appendChild(o);
		});
		s.selectedIndex = -1;
	},
	
	_next: function() {
		var s = this._node.querySelector("select");
		var i = (s.selectedIndex+1) % s.options.length;
		s.selectedIndex = i;
		this._audio.src = "ogg/" + s.value;
		this._audio.play();
	},
	
	_tick: function() {
		this._analyser.getByteFrequencyData(this._data);
		
		var value = (this._data[12]);

		var delta = value / this._lastValue;

		this._lastValue = value;
		
		if (delta > 3) {
			Render.scene.push(new Explosion(Render.gl));
		}
		
		
		var bars = function(canvas, data) {
			var w = 10;
			var s = 1;
			var c = canvas.getContext("2d");
			canvas.width = data.length * (w+s);
			c.fillStyle = "white";
			
			for (var i=0;i<data.length;i++) {
				var amount = data[i] + 2;
				c.fillRect(i*(w+s), canvas.height-amount, w, amount);
				
			}
		}
		
		var line = function(canvas, data) {
			var c = canvas.getContext("2d");
			canvas.width = data.length;
			var colors = ["white", "red", "green", "blue", "yellow", "pink"];
			
			var len = data[0].length;
			for (var i=0;i<len;i++) {
				c.beginPath();
				data.forEach(function(value, index) {
					var amount = 50*value[i] + 20*i;
					c[index ? "lineTo" : "moveTo"](index, canvas.height-amount);
				});
				c.strokeStyle = colors[i % colors.length];
				c.stroke();
			}
			
		}
		
		bars(C[0], this._data);

		if (!tmp) { 
			tmp = [].slice.call(this._data);
			return;
		}
		
		deltas.push([
			this._data[0]/tmp[0] || 0,
			this._data[1]/tmp[1] || 0,
			this._data[11]/tmp[11] || 0,
			this._data[12]/tmp[12] || 0,
			this._data[13]/tmp[13] || 0,
			this._data[14]/tmp[14] || 0,
		]);
		if (deltas.length > 200) deltas.shift();
		line(C[1], deltas);

		tmp = [].slice.call(this._data);

	}
}
window.addEventListener("load", Jukebox);
