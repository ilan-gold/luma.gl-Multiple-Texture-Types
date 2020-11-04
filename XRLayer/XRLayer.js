/* eslint-disable prefer-destructuring */
import GL from "@luma.gl/constants";
import { COORDINATE_SYSTEM, Layer, project32 } from "@deck.gl/core";
import { Model, Geometry, Texture2D } from "@luma.gl/core";
import fs from "./xr-layer-fragment-colormap.webgl2";
import vs from "./xr-layer-vertex.webgl2";
import imageModule from "./channel-intensity-module";

const defaultProps = {
  pickable: true,
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  imageData: { type: "object", value: {}, compare: true },
  bounds: { type: "array", value: [0, 0, 1, 1], compare: true },
  colormap: { type: "object", value: null, compare: true },
};

export default class XRLayer extends Layer {
  getShaders() {
    imageModule.defines.SAMPLER_TYPE = "usampler2D";
    return super.getShaders({
      vs,
      fs,
      defines: {
        SAMPLER_TYPE: "usampler2D",
      },
      modules: [project32, imageModule],
    });
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        update: this.calculatePositions,
        noAlloc: true,
      },
    });
    this.setState({
      numInstances: 1,
      positions: new Float64Array(12),
    });
  }

  finalizeState() {
    super.finalizeState();

    if (this.state.image) {
      this.state.image.delete();
    }
  }

  updateState({ props, oldProps, changeFlags }) {
    // setup model first
    const { gl } = this.context;
    // We only want to get new shaders if the colormap turns on and off.
    if (changeFlags.extensionsChanged) {
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({ model: this._getModel(gl) });

      this.getAttributeManager().invalidateAll();
    }
    if (props.imageData !== oldProps.imageData) {
      this.loadImageTexture(props.imageData);
    }
    if (props.colormap !== oldProps.colormap) {
      if (props.colormap) {
        // Colormap is a promise - I couldn't get it working by resolving the promise before hitting
        // the XRLayer (i.e resolving in MultiscaleImageLayer etc.).
        this.setState({
          colormap: new Texture2D(gl, {
            data: props.colormap,
            parameters: {
              [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
              [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
              [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
              [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
            },
          }),
        });
      } else {
        this.setState({ colormap: null });
      }
    }
    const attributeManager = this.getAttributeManager();
    if (props.bounds !== oldProps.bounds) {
      attributeManager.invalidate("positions");
    }
  }

  /**
   * This function creates the luma.gl model.
   */
  _getModel(gl) {
    if (!gl) {
      return null;
    }

    /*
       0,0 --- 1,0
        |       |
       0,1 --- 1,1
     */
    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertexCount: 4,
        attributes: {
          texCoords: new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]),
        },
      }),
      isInstanced: false,
    });
  }

  calculatePositions(attributes) {
    const { positions } = this.state;
    const { bounds } = this.props;
    // bounds as [minX, minY, maxX, maxY]
    /*
      (minX0, maxY3) ---- (maxX2, maxY3)
             |                  |
             |                  |
             |                  |
      (minX0, minY1) ---- (maxX2, minY1)
   */
    positions[0] = bounds[0];
    positions[1] = bounds[1];
    positions[2] = 0;

    positions[3] = bounds[0];
    positions[4] = bounds[3];
    positions[5] = 0;

    positions[6] = bounds[2];
    positions[7] = bounds[3];
    positions[8] = 0;

    positions[9] = bounds[2];
    positions[10] = bounds[1];
    positions[11] = 0;

    // eslint-disable-next-line  no-param-reassign
    attributes.value = positions;
  }

  draw({ uniforms }) {
    const { image, model, colormap } = this.state;
    if (image && model && colormap) {
      model
        .setUniforms({
          ...uniforms,
          colormap,
          image,
          clamp: [20000, 40000],
        })
        .draw();
    }
  }

  loadImageTexture(imageData) {
    if (this.state.image) {
      this.state.image.delete();
    }
    this.setState({
      image: this.dataToTexture(
        imageData.data,
        imageData.width,
        imageData.height
      ),
    });
  }

  dataToTexture(data, width, height) {
    const texture = new Texture2D(this.context.gl, {
      width,
      height,
      data,
      // we don't want or need mimaps
      mipmaps: false,
      parameters: {
        // NEAREST for integer data
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
        // CLAMP_TO_EDGE to remove tile artifacts
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
      },
      format: GL.R16UI,
      dataFormat: GL.RED_INTEGER,
      type: GL.UNSIGNED_SHORT,
    });
    return texture;
  }
}

XRLayer.layerName = "XRLayer";
XRLayer.defaultProps = defaultProps;
