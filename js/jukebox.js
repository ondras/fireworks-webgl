var C = [null, null];
var deltas = [];
var tmp = null;

var Jukebox = {
	_ctx: null,
	_audio: new Audio(),
	_data: null,
	_analyser: null,
	_lastValue: 0,
	_playlistIndex: -1,
	_playlist: [
		{name:"ZZ Top &ndash; Gimme All Your Lovin'", file:"zz.ogg", threshold:1.5},
		{name:"Peter Gabriel &ndash; Sledge Hammer", file:"hammer.ogg", threshold:2},
		{name:"Lenny Kravitz &ndash; American Woman", file:"woman.ogg", threshold:2},
		{name:"Phatt Bastard &amp; The Drummachine", file:"phatt.ogg", threshold:1},
		{name:"Primal Scream &ndash; Rocks", file:"rocks.ogg", threshold:2},
		{name:"Propellerheads &ndash; History Repeating", file:"history.ogg", threshold:2},
		{name:"Mousse T. &ndash; Horny", file:"horny.ogg", threshold:2.5},
		{name:"Tom Jones &ndash; Sexbomb", file:"sexbomb.ogg", threshold:1.5}
	],
	
	handleEvent: function(e) {
		switch (e.type) {
			case "load":
				this._init();
			break;
			
			case "ended":
				document.querySelector("#banner").innerHTML = "";
				if (this._playlistIndex > -1) { this._next(); }
 			break;
			
			case "submit":
				e.preventDefault();
				if (e.target.id != "url") { return; }
				var url = document.querySelector("#url input");
				if (!url.value) { return; }
				this._playUrl(url.value);
			break;
			
			case "change":
				if (!e.target.files.length) { return; }
				var file = e.target.files[0];
				if (!this._testType(file.type)) { return; }
				var url = URL.createObjectURL(file);
				this._play(url, file.name);
			break;
			
			case "click":
				this["_" + e.target.id]();
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

		this._audio.addEventListener("ended", this);
		
		this._analyser = this._ctx.createAnalyser();
		this._analyser.fftSize = 2048;
		this._analyser.smoothingTimeConstant = 0.5
		this._analyser.connect(this._ctx.destination);

		var source = this._ctx.createMediaElementSource(this._audio);
		source.connect(this._analyser);
		this._data = new Uint8Array(this._analyser.frequencyBinCount);

		this._build();
		this._next();

		this._tick = this._tick.bind(this);
		setInterval(this._tick, 50);
		
		for (var i=0;i<C.length;i++) {
			var canvas = document.createElement("canvas");
			C[i] = canvas;
			canvas.height = 260;
			canvas.style.top = (260*i) + "px";
			document.body.appendChild(canvas);
			canvas.style.position = "absolute";
		}
	},
	
	_build: function() {
		var forms = [].slice.call(document.querySelectorAll("#jukebox form"));
		forms.forEach(function(form) {
			form.addEventListener("submit", this);
		}, this);
		
		document.querySelector("#jukebox #prev").addEventListener("click", this);
		document.querySelector("#jukebox #next").addEventListener("click", this);
		document.querySelector("#jukebox #file input").addEventListener("change", this);
		document.querySelector("#jukebox #total").innerHTML = this._playlist.length;
	},
	
	_playUrl: function(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("head", url, true);
		
		xhr.addEventListener("load", function() {
			var ct = xhr.getResponseHeader("Content-Type");
			if (!this._testType(ct)) { return; }
			this._play(url);
		}.bind(this));

		xhr.addEventListener("error", function(e) {
			var str = "Sorry, this URL cannot be opened.\n\n";
			if (xhr.status) {
				str += "HTTP/" + xhr.status;
			} else {
				str += "Please make sure that the resource is served with proper CORS headers.";
			}
			alert(str);
		});

		try {
			xhr.send();
		} catch (e) {
			alert("Sorry, this URL cannot be opened (" + e.message + ")");
		}
	},
	
	_testType: function(type) {
		if (!this._audio.canPlayType(type)) {
			alert("Sorry, this file type (" + type + ") is not supported by your browser.");
			return false;
		} else {
			return true;
		}
	},
	
	_play: function(url, name) {
		this._audio.src = url;
		this._audio.play();
		document.querySelector("#banner").innerHTML = name || url;
	},
	
	_next: function() {
		this._playList(this._playlistIndex+1);
	},
	
	_prev: function() {
		this._playList(this._playlistIndex-1);
	},
	
	_playList: function(index) {
		this._playlistIndex = (index + this._playlist.length) % this._playlist.length;
		document.querySelector("#jukebox #current").innerHTML = this._playlistIndex+1;
		var item = this._playlist[this._playlistIndex];
		this._play("ogg/" + item.file, item.name);
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
			this._data[2]/tmp[2] || 0,
			this._data[3]/tmp[3] || 0,
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
