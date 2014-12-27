precision highp float;

varying vec3 vColor;
varying float vLifetime;

void main(void) {
	float dist = length((gl_PointCoord-0.5)*2.0);
	if (dist > 1.0) { discard; }

	float alpha = 1.0-dist;
	alpha = pow(alpha, 3.0);
	alpha = alpha * vLifetime;

	gl_FragColor = vec4(vColor, alpha);
}
