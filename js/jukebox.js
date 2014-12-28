var Jukebox = {
	_ctx: null,
	_audio: new Audio(),
	_data: null,
	_analyser: null,
	_last: {
		ts: 0,
		value: 0
	},
	_decay: 300,
	_playlistIndex: -1,
	_playlist: [
		{name:"ZZ Top &ndash; Gimme All Your Lovin'", file:"zz.ogg"},
		{name:"Lenny Kravitz &ndash; American Woman", file:"woman.ogg"},
		{name:"Primal Scream &ndash; Rocks", file:"rocks.ogg"},
		{name:"Peter Gabriel &ndash; Sledge Hammer", file:"hammer.ogg"},
		{name:"Caravan Palace &ndash; Rock It For Me", file:"rockit.ogg"},
		{name:"Propellerheads &ndash; History Repeating", file:"history.ogg"},
		{name:"Mousse T. &ndash; Horny", file:"horny.ogg"},
		{name:"Tom Jones &ndash; Sexbomb", file:"sexbomb.ogg"},
		{name:"Phatt Bastard &amp; The Drummachine", file:"phatt.ogg"}
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
				this._play(url.value);
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
		this._analyser.fftSize = 1024;
		this._analyser.maxDecibels = -20;
		this._analyser.smoothingTimeConstant = 0.5
		this._analyser.connect(this._ctx.destination);

		var source = this._ctx.createMediaElementSource(this._audio);
		source.connect(this._analyser);
		this._data = new Uint8Array(this._analyser.frequencyBinCount);

		this._build();
		this._next();

		this._tick = this._tick.bind(this);
		setInterval(this._tick, 30);
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

		/* current values */
		var now = Date.now();
		var value = this._data[0];

		/* diffs */
		var delta = value-this._last.value;
		var timeDiff = now - this._last.ts;
		
		/* always maintain last */
		this._last.value = value;

		if (timeDiff < this._decay) { /* decay */
			this._last.value = value;
			return;
		}

		
		if (delta > 15) {
			this._last.ts = now;
			var force = delta / 50;
			Render.scene.push(new Explosion(Render.gl, force));
			
			/* one more! */
			if (force > 1.1) { Render.scene.push(new Explosion(Render.gl, 1)); }
		}
	}
}
window.addEventListener("load", Jukebox);
