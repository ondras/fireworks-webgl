attribute vec3 aPosition;
attribute vec3 aColor;
attribute float aSize;

uniform mat4 uViewProjection;

varying vec3 vColor;

void main(void) {
	gl_Position = uViewProjection * vec4(aPosition, 1.0);
	gl_PointSize = aSize;
	vColor = aColor;
}
