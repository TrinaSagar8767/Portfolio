import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';

import {graphics} from './graphics.js';
import {math} from './math.js';
import {noise} from './noise.js';
import {quadtree} from './quadtree.js';
import {spline} from './spline.js';
import {utils} from './utils.js';
import {GLTFLoader} from 'https://unpkg.com/three@0.119.1/examples/jsm/loaders/GLTFLoader.js'

const scene = new THREE.Scene();

export const terrain = (function() {
  //generate a chunk of terrain, place a tree model on the highest points

  class HeightGenerator {

    constructor(generator, position, minRadius, maxRadius) {
      this._position = position.clone();
      this._radius = [minRadius, maxRadius];
      this._generator = generator;
    }
  
    Get(x, y) {
      const distance = this._position.distanceTo(new THREE.Vector2(x, y));
      let normalization = 1.0 - math.sat(
          (distance - this._radius[0]) / (this._radius[1] - this._radius[0]));
      normalization = normalization * normalization * (3 - 2 * normalization);
  
      return [this._generator.Get(x, y), normalization];
    }
  }
  
  
  class FixedHeightGenerator {
    constructor() {}
  
    Get() {
      return [50, 1];
    }
  }
  
  
  class Heightmap {
    constructor(params, img) {
      this._params = params;
      this._data = graphics.GetImageData(img);
    }
  
    Get(x, y) {
      const _GetPixelAsFloat = (x, y) => {
        const position = (x + this._data.width * y) * 4;
        const data = this._data.data;
        return data[position] / 255.0;
      }
  
      // Bilinear filter
      const offset = new THREE.Vector2(-250, -250);
      const dimensions = new THREE.Vector2(500, 500);
  
      const xf = 1.0 - math.sat((x - offset.x) / dimensions.x);
      const yf = math.sat((y - offset.y) / dimensions.y);
      const w = this._data.width - 1;
      const h = this._data.height - 1;
  
      const x1 = Math.floor(xf * w);
      const y1 = Math.floor(yf * h);
      const x2 = math.clamp(x1 + 1, 0, w);
      const y2 = math.clamp(y1 + 1, 0, h);
  
      const xp = xf * w - x1;
      const yp = yf * h - y1;
  
      const p11 = _GetPixelAsFloat(x1, y1);
      const p21 = _GetPixelAsFloat(x2, y1);
      const p12 = _GetPixelAsFloat(x1, y2);
      const p22 = _GetPixelAsFloat(x2, y2);
  
      const px1 = math.lerp(xp, p11, p21);
      const px2 = math.lerp(xp, p12, p22);
  
      return math.lerp(yp, px1, px2) * this._params.height;
    }
  }
  
  //biome variables, remove later
  const _WHITE = new THREE.Color(0x808080);
  const _OCEAN = new THREE.Color(0xd9d592);
  const _BEACH = new THREE.Color(0xd9d592);
  const _SNOW = new THREE.Color(0xFFFFFF);
  const _FOREST_TROPICAL = new THREE.Color(0x4f9f0f);
  const _FOREST_TEMPERATE = new THREE.Color(0x2b960e);
  const _FOREST_BOREAL = new THREE.Color(0x29c100);
  
  const _GREEN = new THREE.Color(0x80FF80);
  const _RED = new THREE.Color(0xFF8080);
  const _BLACK = new THREE.Color(0x000000);
  
  const _MIN_CELL_SIZE = 500;
  const _FIXED_GRID_SIZE = 10;
  const _MIN_CELL_RESOLUTION = 64;
  
  
  // Cross-blended Hypsometric Tints
  // http://www.shadedrelief.com/hypso/hypso.html
  class HyposemetricTints {
    //color values, will be replaced by texturing later
    constructor(params) {
      const _colourLerp = (t, p0, p1) => {
        const c = p0.clone();
  
        return c.lerpHSL(p1, t);
      };
      this._colourSpline = [
        new spline.LinearSpline(_colourLerp),
        new spline.LinearSpline(_colourLerp)
      ];
      // Arid
      this._colourSpline[0].AddPoint(0.0, new THREE.Color(0xb7a67d));
      this._colourSpline[0].AddPoint(0.5, new THREE.Color(0xf1e1bc));
      this._colourSpline[0].AddPoint(1.0, _SNOW);
  
      // Humid
      this._colourSpline[1].AddPoint(0.0, _FOREST_BOREAL);
      this._colourSpline[1].AddPoint(0.5, new THREE.Color(0xcee59c));
      this._colourSpline[1].AddPoint(1.0, _SNOW);
  
      this._params = params;
    }
  
    Get(x, y, z) {
      const m = this._params.biomeGenerator.Get(x, z);
      const h = y / 100.0;
  
      if (h < 0.05) {
        return _OCEAN;
      }
  
      const c1 = this._colourSpline[0].Get(h);
      const c2 = this._colourSpline[1].Get(h);
  
      //return c1.lerpHSL(c2, m);
      return _SNOW;
    }
  }
  
  
  class FixedColourGenerator {
    constructor(params) {
      this._params = params;
    }
  
    Get() {
      return this._params.colour;
    }
  }
  

  class TerrainChunk {
    constructor(params) {
      this._params = params;
      this._Init(params);
      this.trees = [];//declare array for trees
      this.scene = params.scene;
      console.log("this.scene");
    }

    
    
    Destroy() {
      this._params.group.remove(this._plane);
      //clear this.trees
    }

    Hide() {
      this._plane.visible = false;
    }

    Show() {
      this._plane.visible = true;
    }

    _Init(params) {
      console.log("chunk params: ", this._params);

      //load snow texture
      const loader = new THREE.TextureLoader();
      const snow_tex = loader.load('../public/Snow_seamless.jpg');


      //initialization of plane based on params
      const size = new THREE.Vector3(params.width, 0, params.width);
      //use three.js mesh class to make base plane for chunk, will add heightmap later
      this._plane = new THREE.Mesh(
          new THREE.PlaneGeometry(size.x, size.z, params.resolution, params.resolution),
          new THREE.MeshStandardMaterial(
            {
              map: snow_tex
            }
          ));

      //mesh properties
      this._plane.castShadow = false;
      this._plane.receiveShadow = true;
      this._plane.rotation.x = -Math.PI / 2;
      this._params.group.add(this._plane);

    }

    _GenerateHeight(v) {
      //generate the heightmap here
      const offset = this._params.offset;
      const heightPairs = [];
      let normalization = 0;
      let z = 0;
      for (let gen of this._params.heightGenerators) {
        heightPairs.push(gen.Get(v.x + offset.x, -v.y + offset.y));
        normalization += heightPairs[heightPairs.length-1][1];
      }

      if (normalization > 0) {
        for (let h of heightPairs) {
          z += h[0] * h[1] / normalization;
        }
      }

      return z;
    }

    *_Rebuild() {
      //rebuild the plane to have the heightmap, place the trees at the maximum height
      const NUM_STEPS = 2000;
      const colours = [];
      const offset = this._params.offset;
      let count = 0;
      let zlist = [];

      for (let v of this._plane.geometry.vertices) { //v represents each vertex on flat plane
        //generate the heightmap here using helper function
        v.z = this._GenerateHeight(v); //attach generated z coordinate to v
        //for loop applied to plane property of terrain chunk, modifies geometry.vertices property
        //generate trees for the chunk here
        //create tree array property for terrain chunk
        //properties of chunk will get removed when chunk is removed
        //console.log(v.z);
        zlist.push(v.z); //use to get maximum height

        //colors generated, replace later with ground texture/shader
        colours.push(this._params.colourGenerator.Get(v.x + offset.x, v.z, v.y + offset.y));
        count++;
        if (count > NUM_STEPS) {
          count = 0;
          yield;
        }
      }

      //loop to place trees
      let maxHeight = Math.max(...zlist.filter(val => !isNaN(val)));
      let minHeight = Math.max(...zlist.filter(val => !isNaN(val)));
      //console.log("max:",maxHeight);
      let loader = new GLTFLoader();
      for (let v of this._plane.geometry.vertices) {
        //get coordinates of trees right
        if(v.z == maxHeight){


          //leaf layer colors
            const material = new THREE.MeshBasicMaterial({ color: 0xffadad });
            const material1a = new THREE.MeshBasicMaterial({ color: 0xffd6a5 });
            const material1b = new THREE.MeshBasicMaterial({ color: 0xfdffb6 });
            const material1c = new THREE.MeshBasicMaterial({ color: 0xcaffbf });
            const material1d = new THREE.MeshBasicMaterial({ color: 0x9bf8ff });
            const material1e = new THREE.MeshBasicMaterial({ color: 0xa0c4ff });
            const material1f = new THREE.MeshBasicMaterial({ color: 0xbdb2ff });

            //extra
            const material2 = new THREE.MeshBasicMaterial({color: 0xffffff }); 
            const material3 = new THREE.MeshBasicMaterial({color: 0xc4a484 });
            const material4 = new THREE.MeshBasicMaterial({color: 0xff68b9 });

            //extra dimension materials on trunk
            const material_a = new THREE.MeshBasicMaterial({color: 0xb5836b});
            const treeloader = new THREE.CubeTextureLoader();
            const barktex = treeloader.load(['../public/Flower_texture.png','../public/Flower_texture.png','../public/Flower_texture.png','../public/Flower_texture.png','../public/Flower_texture.png','../public/Flower_texture.png']);

            //trunk geometry
            const geometry = new THREE.BoxGeometry(25,300,25);//center
            const geometry_a = new THREE.BoxGeometry(35,300,10);//add dimension on x side
            const geometry_b = new THREE.BoxGeometry(10,300,35);//add dimension on z side
            //form tree trunk
            const mesh1 = new THREE.Mesh(geometry, material3); //trunk
            mesh1.position.set(v.x,0,v.y); //tree trunk
            const mesh1a = new THREE.Mesh(geometry_a, material_a); //trunk
            mesh1a.position.set(v.x,0,v.y); //tree trunk
            const mesh1b = new THREE.Mesh(geometry_b, material_a); //trunk
            mesh1b.position.set(v.x,0,v.y); //tree trunk

            mesh1.castShadow = true;
            mesh1.receiveShadow = true;
            mesh1a.castShadow = true;
            mesh1a.receiveShadow = true;
            mesh1b.castShadow = true;
            mesh1b.receiveShadow = true;

            this.scene.add(mesh1);
            this.trees.push(mesh1);
            this.scene.add(mesh1a);
            this.trees.push(mesh1a);
            this.scene.add(mesh1b);
            this.trees.push(mesh1b);




            //geometry for parts of trees

            ///first leaf layer
            const geometry2 = new THREE.BoxGeometry(210,40,210);
            const geometry3 = new THREE.BoxGeometry(200,10,200);
            //second leaf layer
            const geometry2a = new THREE.BoxGeometry(180,37,180);
            const geometry3a = new THREE.BoxGeometry(180,10,180);
            //third leaf layer
            const geometry2b = new THREE.BoxGeometry(160,34,160);
            const geometry3b = new THREE.BoxGeometry(160,10,160);
            //fourth leaf layer
            const geometry2c = new THREE.BoxGeometry(140,31,140);
            const geometry3c = new THREE.BoxGeometry(140,10,140);
            //fifth leaf layer
            const geometry2d = new THREE.BoxGeometry(120,28,120);
            const geometry3d = new THREE.BoxGeometry(120,10,120);
            //sixth leaf layer
            const geometry2e = new THREE.BoxGeometry(100,25,100);
            const geometry3e = new THREE.BoxGeometry(100,10,100);
            //seventh leaf layer
            const geometry2f = new THREE.BoxGeometry(80,22,80);
            const geometry3f = new THREE.BoxGeometry(80,10,80);

            //extra
            const geometry4 = new THREE.BoxGeometry(175,50,175);
            const geometry5 = new THREE.BoxGeometry(350,30,350);

            //const mesh = new THREE.Mesh(geometry, map:snow_tex);
            //barktex.wrapS = THREE.RepeatWrapping;
            //barktex.wrapT = THREE.RepeatWrapping;
            barktex.wrapS = barktex.wrapT = THREE.MirroredRepeatWrapping;
            barktex.offset.set(0.5, 0.5);
            //barktex.repeat.set( 4, 4 );
  
            const mesh = new THREE.Mesh(
              geometry,
              new THREE.MeshStandardMaterial(
                {
                  map: barktex
                }
              ));
  

            //add tree trunks, tree leaves, and clouds
  
            //first leaf layer
            const mesh2 = new THREE.Mesh(geometry2,material);
            const mesh3 = new THREE.Mesh(geometry3, material2);
            //second leaf layer
            const mesh2a = new THREE.Mesh(geometry2a,material1a);
            const mesh3a = new THREE.Mesh(geometry3a, material2);
            //third leaf layer
            const mesh2b = new THREE.Mesh(geometry2b,material1b);
            const mesh3b = new THREE.Mesh(geometry3b, material2);
            //fourth leaf layer
            const mesh2c = new THREE.Mesh(geometry2c,material1c);
            const mesh3c = new THREE.Mesh(geometry3c, material2);
            //fifth leaf layer
            const mesh2d = new THREE.Mesh(geometry2d,material1d);
            const mesh3d = new THREE.Mesh(geometry3d, material2);
            //sixth leaf layer
            const mesh2e = new THREE.Mesh(geometry2e,material1e);
            const mesh3e = new THREE.Mesh(geometry3e, material2);
            //seventh leaf layer
            const mesh2f = new THREE.Mesh(geometry2f,material1f);
            const mesh3f = new THREE.Mesh(geometry3f, material2);




            const mesh4 = new THREE.Mesh(geometry4, material4);
            const mesh5 = new THREE.Mesh(geometry5, material4);
  

            

            const rads = 0.8971;
            //place first leaf layer

            mesh2.position.set(v.x,160,v.y); //+40
            //mesh2.rotation.y = Math.PI / 9;
            mesh2.castShadow = true;
            mesh2.receiveShadow = true;
            this.scene.add(mesh2);
            this.trees.push(mesh2);

            mesh3.position.set(v.x,190,v.y); //+10
            //mesh3.rotation.y = Math.PI / 9;
            mesh3.castShadow = true;
            mesh3.receiveShadow = true;
            this.scene.add(mesh3);
            this.trees.push(mesh3);

            //place second leaf layer
            mesh2a.position.set(v.x,200,v.y); //+37
            mesh2a.rotation.y = rads;
            mesh2a.castShadow = true;
            mesh2a.receiveShadow = true;
            this.scene.add(mesh2a);
            this.trees.push(mesh2a);

            mesh3a.position.set(v.x,237,v.y); //+10
            mesh3a.rotation.y = rads;
            mesh3a.castShadow = true;
            mesh3a.receiveShadow = true;
            this.scene.add(mesh3a);
            this.trees.push(mesh3a);

            //place third leaf layer
            mesh2b.position.set(v.x,247,v.y); //+34
            mesh2b.rotation.y = 2 * rads;
            mesh2b.castShadow = true;
            mesh2b.receiveShadow = true;
            this.scene.add(mesh2b);
            this.trees.push(mesh2b);

            mesh3b.position.set(v.x,281,v.y); //+10
            mesh3b.rotation.y = 2 * rads;
            mesh3b.castShadow = true;
            mesh3b.receiveShadow = true;
            this.scene.add(mesh3b);
            this.trees.push(mesh3b);
            
            //place fourth leaf layer
            mesh2c.position.set(v.x,291,v.y); //+31
            mesh2c.rotation.y = 3 * rads;
            mesh2c.castShadow = true;
            mesh2c.receiveShadow = true;
            this.scene.add(mesh2c);
            this.trees.push(mesh2c);

            mesh3c.position.set(v.x,322,v.y); //+10
            mesh3c.rotation.y = 3 * rads;
            mesh3c.castShadow = true;
            mesh3c.receiveShadow = true;
            this.scene.add(mesh3c);
            this.trees.push(mesh3c);
            
            //place fifth leaf layer
            mesh2d.position.set(v.x,332,v.y); //+28
            mesh2d.rotation.y = 4 * rads;
            mesh2d.castShadow = true;
            mesh2d.receiveShadow = true;
            this.scene.add(mesh2d);
            this.trees.push(mesh2d);

            mesh3d.position.set(v.x,360,v.y); //+10
            mesh3d.rotation.y = 4 * rads;
            mesh3d.castShadow = true;
            mesh3d.receiveShadow = true;
            this.scene.add(mesh3d);
            this.trees.push(mesh3d);
           
            //place sixth leaf layer
            mesh2e.position.set(v.x,370,v.y); //+25
            mesh2e.rotation.y = 5 * rads;
            mesh2e.castShadow = true;
            mesh2e.receiveShadow = true;
            this.scene.add(mesh2e);
            this.trees.push(mesh2e);

            mesh3e.position.set(v.x,395,v.y); //+10
            mesh3e.rotation.y = 5 * rads;
            mesh3e.castShadow = true;
            mesh3e.receiveShadow = true;
            this.scene.add(mesh3e);
            this.trees.push(mesh3e);
           
            //place seventh leaf layer
            mesh2f.position.set(v.x,405,v.y); //+22
            mesh2f.rotation.y = 6 * rads;
            mesh2f.castShadow = true;
            mesh2f.receiveShadow = true;
            this.scene.add(mesh2f);
            this.trees.push(mesh2f);

            mesh3f.position.set(v.x,427,v.y); //+10
            mesh3f.rotation.y = 6 * rads;
            mesh3f.castShadow = true;
            mesh3f.receiveShadow = true;
            this.scene.add(mesh3f);
            this.trees.push(mesh3f);

        }

      }

      //add trees to scene, make sure neither are null
      //this.scene.add(this.trees);
      //this._params.group.add(this.trees);

      //color function
      for (let f of this._plane.geometry.faces) {
        const vs = [f.a, f.b, f.c];

        const vertexColours = [];
        for (let v of vs) {
          vertexColours.push(colours[v]);
        }
        f.vertexColors = vertexColours;

        count++;
        if (count > NUM_STEPS) {
          count = 0;
          yield;
        }
      }

      yield;
      this._plane.geometry.elementsNeedUpdate = true;
      this._plane.geometry.verticesNeedUpdate = true;
      this._plane.geometry.computeVertexNormals(); //for lighting
      this._plane.position.set(offset.x, 0, offset.y);
    }
  }

  class TerrainChunkRebuilder {
    constructor(params) {
      this._pool = {};
      this._params = params;
      //this.scene = this._params.scene;
      //scene not passed in constructor
      this._Reset();
    }
    AllocateChunk(params) {
      //allocate function called by manager
      const w = params.width;

      if (!(w in this._pool)) {
        this._pool[w] = [];
      }

      let c = null;
      if (this._pool[w].length > 0) {
        c = this._pool[w].pop();
        c._params = params;
      } else {
        //console.log("rebuilder params being passed to allocate chunk: ", params);
        //terrain chunk given params that were passed to allocate function
        c = new TerrainChunk(params);
        
      }

      c.Hide();

      this._queued.push(c);

      return c;    
    }

    _RecycleChunks(chunks) {
      for (let c of chunks) {
        if (!(c.chunk._params.width in this._pool)) {
          this._pool[c.chunk._params.width] = [];
        }

        c.chunk.Hide();
        this._pool[c.chunk._params.width].push(c.chunk);
      }
    }

    _Reset() {
      this._active = null;
      this._queued = [];
      this._old = [];
      this._new = [];
    }

    get Busy() {
      return this._active;
    }

    Update2() {
      for (let b of this._queued) {
        b._Rebuild().next();
        this._new.push(b);
      }
      this._queued = [];

      if (this._active) {
        return;
      }

      if (!this._queued.length) {
        this._RecycleChunks(this._old);
        for (let b of this._new) {
          b.Show();
        }
        this._Reset();
      }
    }

    Update() {
      if (this._active) {
        const r = this._active.next();
        if (r.done) {
          this._active = null;
        }
      } else {
        const b = this._queued.pop();
        if (b) {
          this._active = b._Rebuild();
          this._new.push(b);
        }
      }

      if (this._active) {
        return;
      }

      if (!this._queued.length) {
        this._RecycleChunks(this._old);
        for (let b of this._new) {
          b.Show();
        }
        this._Reset();
      }
    }
  }

  class TerrainChunkManager {
    constructor(params) {
      //params: camera, scene, gui, guiparams
      this._Init(params);
    }

    _Init(params) {
      this._params = params;

      this._material = new THREE.MeshStandardMaterial({
        wireframe: false,
        wireframeLinewidth: 1,
        color: 0xFFFFFF,
        side: THREE.FrontSide,
        vertexColors: THREE.VertexColors,
      });
      //add scene parameter to rebuilder
      console.log("params: ", params)
      this._builder = new TerrainChunkRebuilder(params); //create builder, functions can use different parameters when called from manager

      this._InitNoise(params);
      this._InitBiomes(params);
      this._InitTerrain(params);
    }

    _InitNoise(params) {
      params.guiParams.noise = {
        octaves: 6,
        persistence: 0.707,
        lacunarity: 1.8,
        exponentiation: 4.5,
        height: 300.0,
        scale: 1100.0,
        noiseType: 'simplex',
        seed: 1
      };

      const onNoiseChanged = () => {
        for (let k in this._chunks) {
          this._chunks[k].chunk.Rebuild();
        }
      };

      const noiseRollup = params.gui.addFolder('Terrain.Noise');
      noiseRollup.add(params.guiParams.noise, "noiseType", ['simplex', 'perlin', 'rand']).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.noise, "scale", 32.0, 4096.0).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.noise, "octaves", 1, 20, 1).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.noise, "persistence", 0.25, 1.0).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.noise, "lacunarity", 0.01, 4.0).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.noise, "exponentiation", 0.1, 10.0).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.noise, "height", 0, 512).onChange(
          onNoiseChanged);

      this._noise = new noise.Noise(params.guiParams.noise);

      params.guiParams.heightmap = {
        height: 16,
      };

      const heightmapRollup = params.gui.addFolder('Terrain.Heightmap');
      heightmapRollup.add(params.guiParams.heightmap, "height", 0, 128).onChange(
          onNoiseChanged);
    }

    _InitBiomes(params) {
      //biome function, will be taken out later
      params.guiParams.biomes = {
        octaves: 2,
        persistence: 0.5,
        lacunarity: 2.0,
        exponentiation: 3.9,
        scale: 2048.0,
        noiseType: 'simplex',
        seed: 2,
        exponentiation: 1,
        height: 1
      };

      const onNoiseChanged = () => {
        for (let k in this._chunks) {
          this._chunks[k].chunk.Rebuild();
        }
      };

      const noiseRollup = params.gui.addFolder('Terrain.Biomes');
      noiseRollup.add(params.guiParams.biomes, "scale", 64.0, 4096.0).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.biomes, "octaves", 1, 20, 1).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.biomes, "persistence", 0.01, 1.0).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.biomes, "lacunarity", 0.01, 4.0).onChange(
          onNoiseChanged);
      noiseRollup.add(params.guiParams.biomes, "exponentiation", 0.1, 10.0).onChange(
          onNoiseChanged);

      this._biomes = new noise.Noise(params.guiParams.biomes);
    }

    _InitTerrain(params) {
      params.guiParams.terrain= {
        wireframe: false,
      };

      this._group = new THREE.Group()
      params.scene.add(this._group);

      const terrainRollup = params.gui.addFolder('Terrain');
      terrainRollup.add(params.guiParams.terrain, "wireframe").onChange(() => {
        for (let k in this._chunks) {
          this._chunks[k].chunk._plane.material.wireframe = params.guiParams.terrain.wireframe;
        }
      });

      this._chunks = {};
      this._params = params;
    }

    _CellIndex(p) {
      const xp = p.x + _MIN_CELL_SIZE * 0.5;
      const yp = p.z + _MIN_CELL_SIZE * 0.5;
      const x = Math.floor(xp / _MIN_CELL_SIZE);
      const z = Math.floor(yp / _MIN_CELL_SIZE);
      return [x, z];
    }

    _CreateTerrainChunk(offset, width) {
      //use helper functions to create a chunk
      const params = {
        group: this._group,
        material: this._material,
        width: width,
        offset: new THREE.Vector3(offset.x, offset.y, 0),
        resolution: _MIN_CELL_RESOLUTION,
        biomeGenerator: this._biomes,
        colourGenerator: new HyposemetricTints({biomeGenerator: this._biomes}),
        heightGenerators: [new HeightGenerator(this._noise, offset, 100000, 100000 + 1)], //generate height using noise
        scene: this._params.scene //make sure this is not null
      };

      return this._builder.AllocateChunk(params);
    }

    Update(_) {
      this._builder.Update();
      if (!this._builder.Busy) {
        this._UpdateVisibleChunks_Quadtree();
      }
    }

    _UpdateVisibleChunks_Quadtree() {
      function _Key(c) {
        return c.position[0] + '/' + c.position[1] + ' [' + c.dimensions[0] + ']';
      }

      const q = new quadtree.QuadTree({
        min: new THREE.Vector2(-32000, -32000),
        max: new THREE.Vector2(32000, 32000),
      });
      q.Insert(this._params.camera.position);

      const children = q.GetChildren();

      let newTerrainChunks = {};
      const center = new THREE.Vector2();
      const dimensions = new THREE.Vector2();
      for (let c of children) {
        c.bounds.getCenter(center);
        c.bounds.getSize(dimensions);

        const child = {
          position: [center.x, center.y],
          bounds: c.bounds,
          dimensions: [dimensions.x, dimensions.y],
        };

        const k = _Key(child);
        newTerrainChunks[k] = child;
      }

      const intersection = utils.DictIntersection(this._chunks, newTerrainChunks);
      const difference = utils.DictDifference(newTerrainChunks, this._chunks);
      const recycle = Object.values(utils.DictDifference(this._chunks, newTerrainChunks));

      this._builder._old.push(...recycle);

      newTerrainChunks = intersection;

      for (let k in difference) {
        const [xp, zp] = difference[k].position;

        const offset = new THREE.Vector2(xp, zp);
        newTerrainChunks[k] = {
          position: [xp, zp],
          chunk: this._CreateTerrainChunk(offset, difference[k].dimensions[0]),
        };
      }

      this._chunks = newTerrainChunks;
    }

    _UpdateVisibleChunks_FixedGrid() {
      function _Key(xc, zc) {
        return xc + '/' + zc;
      }

      const [xc, zc] = this._CellIndex(this._params.camera.position);

      const keys = {};

      for (let x = -_FIXED_GRID_SIZE; x <= _FIXED_GRID_SIZE; x++) {
        for (let z = -_FIXED_GRID_SIZE; z <= _FIXED_GRID_SIZE; z++) {
          const k = _Key(x + xc, z + zc);
          keys[k] = {
            position: [x + xc, z + zc]
          };
        }
      }
      
      const difference = utils.DictDifference(keys, this._chunks);
      const recycle = Object.values(utils.DictDifference(this._chunks, keys));

      for (let k in difference) {
        if (k in this._chunks) {
          continue;
        }

        const [xp, zp] = difference[k].position;

        const offset = new THREE.Vector2(xp * _MIN_CELL_SIZE, zp * _MIN_CELL_SIZE);
        this._chunks[k] = {
          position: [xc, zc],
          chunk: this._CreateTerrainChunk(offset, _MIN_CELL_SIZE),
        };
      }
    }

    _UpdateVisibleChunks_Single() {
      //updating level of detail
      function _Key(xc, zc) {
        return xc + '/' + zc;
      }

      // Check the camera's position.
      const [xc, zc] = this._CellIndex(this._params.camera.position);
      const newChunkKey = _Key(xc, zc);

      // We're still in the bounds of the previous chunk of terrain.
      if (newChunkKey in this._chunks) {
        return;
      }

      // Create a new chunk of terrain.
      const offset = new THREE.Vector2(xc * _MIN_CELL_SIZE, zc * _MIN_CELL_SIZE);
      this._chunks[newChunkKey] = {
        position: [xc, zc],
        chunk: this._CreateTerrainChunk(offset, _MIN_CELL_SIZE),
      };
    }
  }

  return {
    TerrainChunkManager: TerrainChunkManager
  }
})();
