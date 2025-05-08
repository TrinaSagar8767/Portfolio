import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';
import {GUI} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/libs/dat.gui.module.js';
import {controls} from './controls.js';
import {game} from './game.js';
import {sky} from './sky.js';
import {terrain} from './terrain.js';
import * as THREE2 from 'three2';

//import particleSystemFire from "./particleSystemFire.js";
//import particleSystemRain from "./particleSystemRain.js";
//import particleSystemSnow from "./particleSystemSnow.js";
//import particleSystemPetals from "./particleSystemPetals.js";
//import particleSystemCloud from "./particleSystemCloud.js";

//import ListPopupCtrl from "./ui.js"

let _APP = null;


//entrypoint in this file

/*steps of tutorial:
  define camera and put in controls - done
  create noise functions and basic math functions - done
  create terrain class for generating one chunk - done
  create graphics functions to render world - done
  create game class - done
  extend game class to create procedurally generated world - done
  define entities on initialization - done
  */

class ProceduralTerrain_Demo extends game.Game {
  constructor() {
    super();
  }

  _OnInitialize() {
    //define the initialize function declared in parent class


    this._CreateGUI(); //placeholder GUI

    //declare the camera
    this._userCamera = new THREE.Object3D(); //camera as an object
    this._userCamera.position.set(475,75,900); //values from tutorial
    //this.scene = new THREE.Scene();
    //declare a scene on initialization so we can add tree models
    //make scene a parameter for the chunk manager
    this._entities['_terrain'] = new terrain.TerrainChunkManager({
      camera: this._userCamera,
      scene: this._graphics.Scene,
      gui: this._gui,
      guiParams: this._guiParams,
    });

    
    this._entities['_sky'] = new sky.TerrainSky({
      camera: this._graphics.Camera,
      scene: this._graphics.Scene,
      gui: this._gui,
      guiParams: this._guiParams,
    });
    

    this._entities['_controls'] = new controls.FPSControls(
      {
        scene: this._graphics.Scene,
        camera: this._userCamera
      });

    this._graphics.Camera.position.copy(this._userCamera.position);

    this._LoadBackground();

    /*

    // Create arrays for instances of particle systems
    let cloudEffects = [];
    let snowEffects = [];
    let rainEffects = [];
    let fireEffects = [];
    // Call functions to fill arrays with instances of particle effects
    this.generateClouds(cloudEffects, snowEffects, rainEffects);
    this.generateFire(fireEffects);
    //Particles (singular instance for testing)
    //let fireEffect = new particleSystemFire(this._userCamera, new THREE2.Vector3(470, 70, 905), this._graphics.Scene, 50.0, '../public/img/fire.png', 0.5, 1.5, 3, 1.5, new THREE2.Vector3(0, 0, 0));
    //let cloudEffect = new particleSystemCloud(this._userCamera, new THREE2.Vector3(480, 100, 895), this._graphics.Scene, 50.0, '../public/img/smoke.png', 0.5, 10, 3, 0.5, new THREE2.Vector3(0, 0, 0));
    //let rainEffect = new particleSystemRain(this._userCamera, new THREE2.Vector3(485, 80, 895), this._graphics.Scene, 50.0, '../public/img/circle.png', 0.5, 2.5, 0.15, -2, new THREE2.Vector3(0, 0, 0), 1.0);
    //let snowEffect = new particleSystemSnow(this._userCamera, new THREE2.Vector3(490, 80, 895), this._graphics.Scene, 50.0, '../public/img/circle.png', 0.5, 5, 0.25, -0.5, new THREE2.Vector3(0, 0, 0), 1.0);
    //let petalsEffect = new particleSystemPetals(this._userCamera, new THREE2.Vector3(495, 80, 895), this._graphics.Scene, 50.0, '../public/img/petals.png', 0.5, 5, 0.5, -0.5, new THREE2.Vector3(0, 0, 0), 1.0);

    //UI
    let listInterface = new ListPopupCtrl(4);
    listInterface.SetPosition(10, 10);
    listInterface.AddListCtrl("cloud", 1, cloudEffects);
    listInterface.listCtrlArr[0].AddValueCtrl("rate", 0.1, 100, 0.01, 50);
    listInterface.listCtrlArr[0].AddValueCtrl("radius", 0.1, 50, 0.001, 0.5);
    listInterface.listCtrlArr[0].AddValueCtrl("maxLife", 0.1, 50, 0.001, 30);
    listInterface.listCtrlArr[0].AddValueCtrl("maxSize", 0.1, 200, 0.01, 100);
    listInterface.listCtrlArr[0].AddValueCtrl("maxVelocity", 0.1, 25, 0.01, 0.5);
    listInterface.listCtrlArr[0].AddPresetButton("preset1", [50, 0.5, 30, 100, 0.5]);
    listInterface.AddListCtrl("rain", 1, rainEffects);
    listInterface.listCtrlArr[1].AddValueCtrl("rate", 0.1, 100, 0.01, 50);
    listInterface.listCtrlArr[1].AddValueCtrl("radius", 10, 50, 0.001, 20);
    listInterface.listCtrlArr[1].AddValueCtrl("maxLife", 0.1, 100, 0.001, 50);
    listInterface.listCtrlArr[1].AddValueCtrl("maxSize", 0.1, 10, 0.01, 5);
    listInterface.listCtrlArr[1].AddValueCtrl("maxVelocity", -40, -10, 0.01, -20);
    listInterface.listCtrlArr[1].AddPresetButton("preset1", [50, 20, 50, 5, -20]);
    listInterface.AddListCtrl("snow", 1, snowEffects);
    listInterface.listCtrlArr[2].AddValueCtrl("rate", 0.1, 100, 0.01, 50);
    listInterface.listCtrlArr[2].AddValueCtrl("radius", 10, 50, 0.001, 20);
    listInterface.listCtrlArr[2].AddValueCtrl("maxLife", 0.1, 200, 0.001, 100);
    listInterface.listCtrlArr[2].AddValueCtrl("maxSize", 0.1, 10, 0.01, 5);
    listInterface.listCtrlArr[2].AddValueCtrl("maxVelocity", -10, -1, 0.01, -5);
    listInterface.listCtrlArr[2].AddPresetButton("preset1", [50, 20, 100, 5, -5]);
    listInterface.AddListCtrl("fire", 1, fireEffects);
    listInterface.listCtrlArr[3].AddValueCtrl("rate", 0.1, 100, 0.01, 50);
    listInterface.listCtrlArr[3].AddValueCtrl("radius", 0.1, 5, 0.001, 0.5);
    listInterface.listCtrlArr[3].AddValueCtrl("maxLife", 0.1, 10, 0.001, 3);
    listInterface.listCtrlArr[3].AddValueCtrl("maxSize", 0.1, 20, 0.01, 10);
    listInterface.listCtrlArr[3].AddValueCtrl("maxVelocity", 0.1, 10, 0.01, 1.5);
    listInterface.listCtrlArr[3].AddPresetButton("preset1", [50, 0.5, 3, 10, 1.5]);

    function animate() {
        requestAnimationFrame(animate);
    
        for (let c of cloudEffects)
        {
            c.update(0.016);
        }
        for (let s of snowEffects)
        {
            s.update(0.016);
        }
        for (let r of rainEffects)
        {
            r.update(0.016);
        }
        for (let f of fireEffects)
        {
            f.update(0.016);
        }
        
        // Updates for singular instances of particles for testing
        //fireEffect.update(0.016);
        //cloudEffect.update(0.016);
        //rainEffect.update(0.016);
        //snowEffect.update(0.016);
        //petalsEffect.update(0.016);
    }
    
    animate();
    
  }

  // Functions to generate clouds randomly around user along with snow or rain
  generateClouds(cloudEffects, snowEffects, rainEffects) {
    let camPosition = new THREE2.Vector3();
    camPosition.x = this._userCamera.position.x;
    camPosition.z = this._userCamera.position.z;
    for (let i = 0; i < 26; i++)
    {
        let randomX = Math.ceil(Math.random() * 2500) + 50;
        let randomZ = Math.ceil(Math.random() * 2500) + 50;
        randomX *= (Math.round(Math.random()) ? 1: -1)
        randomZ *= (Math.round(Math.random()) ? 1: -1)
        cloudEffects.push(new particleSystemCloud(this._userCamera, new THREE2.Vector3(camPosition.x + randomX, 600, camPosition.z + randomZ), this._graphics.Scene, 50.0, '../public/img/smoke.png', 0.5, 30, 100, 0.5, new THREE2.Vector3(0, 0, 0)));
        if (i < 13)
        {
            snowEffects.push(new particleSystemSnow(this._userCamera, new THREE2.Vector3(camPosition.x + randomX, 600, camPosition.z + randomZ), this._graphics.Scene, 50.0, '../public/img/circle.png', 20, 100, 5, -5, new THREE2.Vector3(0, 0, 0), 1.0));
        } else
        {
            rainEffects.push(new particleSystemRain(this._userCamera, new THREE2.Vector3(camPosition.x + randomX, 600, camPosition.z + randomZ), this._graphics.Scene, 50.0, '../public/img/circle.png', 20, 50, 3, -20, new THREE2.Vector3(0, 0, 0), 1.0));
        }
        //console.log(cloudEffects[i].emitter);
        //console.log(snowEffects[i].emitter);
    }
  }

  generateFire(fireEffects) {
    let camPosition = new THREE2.Vector3();
    camPosition.x = this._userCamera.position.x;
    camPosition.z = this._userCamera.position.z;
    for (let i = 0; i < 5; i++)
    {
        let randomX = (Math.random() + 1) * 500 - 500;
        let randomZ = (Math.random() + 1) * 500 - 500;
        fireEffects.push(new particleSystemFire(this._userCamera, new THREE2.Vector3(camPosition.x + randomX, 50, camPosition.z + randomZ), this._graphics.Scene, 50.0, '../public/img/fire.png', 0.5, 3, 10, 1.5, new THREE2.Vector3(0, 0, 0)));
    }
  }

  // Function to delete clouds that are too far away
  checkClouds(cloudEffects, snowEffects, rainEffects) {
    let camPosition = new THREE2.Vector3();
    camPosition.x = this._userCamera.position.x;
    camPosition.y = this._userCamera.position.y;
    camPosition.z = this._userCamera.position.z;
    for (let i = 0; i < cloudEffects.length; i++)
    {
        if (cloudEffects[i].emitter.distanceTo(camPosition) > 2500) {
            cloudEffects.splice(i, 1);
            console.log("deleted cloud");
            if (i < 13)
            {
                snowEffects.splice(i, 1);
                //console.log("deleted snow");
            } else {
                rainEffects.splice(i, 1);
                //console.log("deleted rain");
            }
            
        }
    }

    // for (let i = 0; i < cloudEffects.length; i++)
    // {
    //     if (cloudEffects[i].emitter.distanceTo(camPosition) > 1000) {
    //         cloudEffects[i].setZero();
    //         //console.log("deleted cloud");
    //         if (i < 10)
    //         {
    //             snowEffects[i].setZero();
    //             //console.log("deleted snow");
    //         } else {
    //             rainEffects[i].setZero();
    //             //console.log("deleted rain");
    //         }
            
    //     }
    // }
    
  }
*/
    }
  //placeholder GUI - REPLACE
  _CreateGUI() {
    this._guiParams = {
      general: {
      },
    };
    this._gui = new GUI();

    const generalRollup = this._gui.addFolder('General');
    this._gui.close();
  }
    
    

  _LoadBackground() {
    //this.graphics represents 
    this._graphics.Scene.background = new THREE.Color(0x000000);
  }

  _OnStep(_) {
    this._graphics._camera.position.copy(this._userCamera.position);
    this._graphics._camera.quaternion.copy(this._userCamera.quaternion);
  }
}

function _Main() {
  //app variable to represent application
  //procedural terrain demo class creates world
  _APP = new ProceduralTerrain_Demo();
}

_Main();
