attribute vec3 aVelocity;

uniform mat4 uProjection;
uniform mat4 uModelView;
uniform vec3 uGravity;
uniform vec3 uColor;
uniform int uStartTime;
uniform int uCurrentTime;
uniform float uLifetime;

varying vec3 vColor;
varying float vLifetime;

void main(void) {
	float age = float(uCurrentTime - uStartTime);

	vec3 position = log(1.0+age * 0.02) * aVelocity
					+ 0.5 * age * age * uGravity;
						
	vec4 cameraPosition = uModelView * vec4(position, 1.0);
	gl_Position = uProjection * cameraPosition;

	float distanceSquared = abs(dot(cameraPosition, cameraPosition));
	distanceSquared = clamp(distanceSquared, 1.0, 10000.0);      
	gl_PointSize = 7.0 + 1000.0 / distanceSquared;

	vLifetime = 1.0 - (age / uLifetime);
	vColor = uColor;
}
