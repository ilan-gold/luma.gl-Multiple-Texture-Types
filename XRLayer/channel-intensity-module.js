export default {
  name: "channel-intensity-module",
  defines: {
    SAMPLER_TYPE: "usampler2D",
  },
  fs: `\
  float sample_and_apply_clamp(SAMPLER_TYPE channel, vec2 vTexCoord, vec2 clamp) {
    float fragIntensity = float(texture(channel, vTexCoord).r);
    float slidersAppliedToIntensity = (fragIntensity - clamp[0]) / max(0.0005, (clamp[1] - clamp[0]));
    return max(0.0, slidersAppliedToIntensity);
  }

  vec3 sample_colormap_texture(float intensity, sampler2D colormap) {
    vec2 loc = vec2(min(max(intensity, 1.0 / 255.0), 1.0 - (1.0 / 255.0)), 0.5);
    vec3 sampled = texture(colormap, loc).rgb;
    return sampled;
  }
`,
};
