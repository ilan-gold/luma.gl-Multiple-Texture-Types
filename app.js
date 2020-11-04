/* global fetch, DOMParser */
import React, { useState, useEffect } from "react";
import { render } from "react-dom";

import DeckGL, { OrthographicView } from "deck.gl";
import XRLayer from "./XRLayer";

import { loadImage } from "@loaders.gl/images";
const baseColormapUrl =
  "https://cdn.jsdelivr.net/gh/kylebarron/deck.gl-raster/assets/colormaps/";

async function getColormap({ name }) {
  return loadImage(`${baseColormapUrl + name}.png`);
}
const HEIGHT = 512;
const WIDTH = 512;

export default function App() {
  const [imageData, setImageData] = useState(null);
  const [colormap, setColormap] = useState(null);

  useEffect(() => {
    const getColormapAndSetImage = async () => {
      setColormap(await getColormap({ name: "viridis" }));
      setImageData({
        data: new Uint16Array(
          Array.from({ length: HEIGHT * WIDTH }, () =>
            Math.floor(Math.random() * 65535)
          )
        ),
        height: HEIGHT,
        width: WIDTH,
      });
    };
    getColormapAndSetImage();
  }, []);
  console.log(imageData);
  const layer =
    colormap &&
    imageData &&
    new XRLayer({
      colormap,
      imageData,
      bounds: [0, 512, 512, 0],
    });

  return (
    <DeckGL
      views={[new OrthographicView({ id: "ortho" })]}
      layers={[layer]}
      initialViewState={{ target: [256, 256, 0], zoom: -1 }}
      controller={true}
    />
  );
}

export function renderToDOM(container) {
  render(<App />, container);
}
