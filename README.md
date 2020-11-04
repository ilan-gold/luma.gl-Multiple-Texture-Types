# luma.gl-Multiple-Texture-Types

A repo for reproducing a luma.gl issue.

### Usage

To start:

```bash
# install dependencies
npm install
# bundle and serve the app with webpack
npm start
```

A random noise image should appear initially but once you set `luma.log.priority = 2`, nothing should appear and the following sort of error logged:

```
deck: error during update of XRLayer({id: 'XRLayer-32768-32768-65536-0-Tiled-Image-ome-tiff-#detail#-1-0--6'}) Error: Error validating: Validation Failed: Sampler error:
  Samplers of different types use the same texture image unit.
   - or -
  A sampler's texture unit is out of range (greater than max allowed or negative).
    at Program._compileAndLink (program.js:369)
    at Program.initialize (program.js:79)
    at new Program (program.js:39)
    at ProgramManager.get (program-manager.js:163)
    at Model._checkProgram (model.js:417)
    at Model.initialize (model.js:71)
    at new Model (model.js:30)
    at XRLayer._getModel (XRLayer.js:161)
    at XRLayer.updateState (XRLayer.js:121)
    at XRLayer._updateState (layer.js:756)
```
