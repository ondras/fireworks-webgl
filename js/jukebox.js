var Jukebox = {
	_ctx: null,
	_audio: new Audio(),
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
		
		this._buildSelect();
		
		this._next();

		var canvas = document.createElement("canvas");
		canvas.height = 260;
		document.body.appendChild(canvas);
		canvas.style.position = "fixed";
		canvas.style.left = canvas.style.top = 0;

		var source = this._ctx.createMediaElementSource(this._audio);
		var analyser = this._ctx.createAnalyser();
		analyser.fftSize = 32;
		source.connect(analyser);
		analyser.connect(this._ctx.destination);
		var dataArray = new Uint8Array(analyser.frequencyBinCount);

		var x = function() {
			var w = 5;
			var s = 1;
			analyser.getByteFrequencyData(dataArray);
			var c = canvas.getContext("2d");
			canvas.width = dataArray.length * (w+s);
			c.fillStyle = "white";
			
			for (var i=0;i<dataArray.length;i++) {
				var amount = dataArray[i] + 2;
				c.fillRect(i*(w+s), canvas.height-amount, w, amount);
				
			}
			c.stroke();
			
			return dataArray;
		}
		setInterval(x, 20);
	},
	
	_buildSelect: function() {
		var songs = [
			{name:"Peter Gabriel &ndash; Sledge Hammer", file:"hammer.ogg", threshold:2},
			{name:"Lenny Kravitz &ndash; American Woman", file:"woman.ogg", threshold:2},
			{name:"Phatt Bastard &amp; The Drummachine", file:"phatt.ogg", threshold:1},
			{name:"Primal Scream &ndash; Rocks", file:"rocks.ogg", threshold:2},
			{name:"Propellerheads &ndash; History Repeating", file:"history.ogg", threshold:2},
			{name:"ZZ Top &ndash; Gimme All Your Lovin'", file:"zz.ogg", threshold:1.5},
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
	}
}
window.addEventListener("load", Jukebox);
