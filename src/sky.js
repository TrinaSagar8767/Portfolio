import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';

import {Sky} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/objects/Sky.js';
import {Water} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/objects/Water.js';

//create a sky for the world
export const sky = (function() {

  class TerrainSky {
    constructor(params) {
      this._params = params;
      this._Init(params);
    }

    _Init(params) {
      //define geometry
      const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 100, 100);

      this._water = new Water(
        waterGeometry,
        {
          textureWidth: 2048,
          textureHeight: 2048,
          waterNormals: new THREE.TextureLoader().load( '../public/Ice.png', function ( texture ) {

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

          } ),
          alpha: 0.5,
          sunDirection: new THREE.Vector3(1, 0, 0),
          sunColor: 0xFFDE83,
          waterColor: 0xD4F1F9,
          distortionScale: 0.0,
          fog: undefined
        }
      );
      this._water.rotation.x = - Math.PI / 2;
      this._water.position.y = 4;

      //declare a sky
      this._sky = new Sky();
      this._sky.scale.setScalar(10000);

      this._group = new THREE.Group();
      this._group.add(this._water);
      this._group.add(this._sky);

      params.scene.add(this._group);

      params.guiParams.sky = {
        turbidity: 10.0,
        rayleigh: 2,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
        luminance: 1,
      };

      params.guiParams.sun = {
        inclination: 0.31,
        azimuth: 0.25,
      };

      const shaderChange = () => {
        for (let i in params.guiParams.sky) {
          this._sky.material.uniforms[i].value = params.guiParams.sky[i];
        }
        for (let i in params.guiParams.general) {
          this._sky.material.uniforms[i].value = params.guiParams.general[i];
        }
      };

      const sunChange = () => {
        var theta = Math.PI * (params.guiParams.sun.inclination - 0.5);
        var phi = 2 * Math.PI * (params.guiParams.sun.azimuth - 0.5);

        const sunPosition = new THREE.Vector3();
        sunPosition.x = Math.cos(phi);
        sunPosition.y = Math.sin(phi) * Math.sin(theta);
        sunPosition.z = Math.sin(phi) * Math.cos(theta);

        this._sky.material.uniforms['sunPosition'].value.copy(sunPosition);
        this._water.material.uniforms['sunDirection'].value.copy(sunPosition.normalize());
      };

      const skyRollup = params.gui.addFolder('Sky');
      skyRollup.add(params.guiParams.sky, "turbidity", 0.1, 30.0).onChange(shaderChange);
      skyRollup.add(params.guiParams.sky, "rayleigh", 0.1, 4.0).onChange(shaderChange);
      skyRollup.add(params.guiParams.sky, "mieCoefficient", 0.0001, 0.1).onChange(shaderChange);
      skyRollup.add(params.guiParams.sky, "mieDirectionalG", 0.0, 1.0).onChange(shaderChange);
      skyRollup.add(params.guiParams.sky, "luminance", 0.0, 2.0).onChange(shaderChange);

      const sunRollup = params.gui.addFolder('Sun');
      sunRollup.add(params.guiParams.sun, "inclination", 0.0, 1.0).onChange(sunChange);
      sunRollup.add(params.guiParams.sun, "azimuth", 0.0, 1.0).onChange(sunChange);

        shaderChange();
        sunChange();
    }

    Update(ellapsedTime) {
      this._water.material.uniforms['time'].value += ellapsedTime;
      this._group.position.x = this._params.camera.position.x;
      this._group.position.z = this._params.camera.position.z;
    }
  }


  return {
    TerrainSky: TerrainSky
  }
})();
