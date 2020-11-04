export default `\
#version 300 es
#define SHADER_NAME xr-layer-vertex-shader

in vec2 texCoords;
in vec3 positions;
in vec3 positions64Low;

out vec2 vTexCoord;

void main(void) {
  gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
  vTexCoord = texCoords;
}
`;
