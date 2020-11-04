export default `\
#version 300 es
#define SHADER_NAME xr-layer-fragment-shader
precision highp float;
precision highp int;
precision highp SAMPLER_TYPE;
precision highp sampler2D;

// our texture
uniform SAMPLER_TYPE image;

// colormap
uniform sampler2D colormap;

// clamp
uniform vec2 clamp;

in vec2 vTexCoord;

out vec4 color;

void main() {
  float intensity = sample_and_apply_clamp(image, vTexCoord, clamp);
  color = vec4(sample_colormap_texture(intensity, colormap), 1.0);
}
`;
