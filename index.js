// CÓDIGO FINAL PARA index.js

window.addEventListener('load', () => {
  const permissionButton = document.getElementById('permission-button');
  const panoElement = document.getElementById('pano');

  function requestDeviceOrientation() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            permissionButton.style.display = 'none';
            panoElement.style.display = 'block'; // Mostramos el visor
            iniciarVisor360();
          } else {
            alert('Permiso denegado. No se puede usar el giroscopio.');
          }
        })
        .catch(console.error);
    } else {
      permissionButton.style.display = 'none';
      panoElement.style.display = 'block'; // Mostramos el visor
      iniciarVisor360();
    }
  }

  permissionButton.addEventListener('click', requestDeviceOrientation);
});


function iniciarVisor360() {
  'use strict';

  // Este es tu código original, ahora funcionará porque se llama en el momento correcto

  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;

  // Grab DOM elements from project.
  var panoElement = document.getElementById('pano');

  // Detect desktop or mobile mode.
  if (window.matchMedia) {
    var setMode = function() {
      if (mql.matches) {
        document.body.classList.remove('desktop');
        document.body.classList.add('mobile');
      } else {
        document.body.classList.remove('mobile');
        document.body.classList.add('desktop');
      }
    };
    var mql = matchMedia("(max-width: 500px), (max-height: 500px)");
    setMode();
    mql.addListener(setMode);
  } else {
    document.body.classList.add('desktop');
  }

  // Detect whether we are on a touch device.
  document.body.classList.add('no-touch');
  window.addEventListener('touchstart', function() {
    document.body.classList.remove('no-touch');
    document.body.classList.add('touch');
  });

  // Use tooltip fallback mode on IE < 11.
  if (bowser.msie && parseFloat(bowser.version) < 11) {
    document.body.classList.add('tooltip-fallback');
  }

  // Viewer options.
  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  // Initialize viewer.
  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);

// *** NUEVO BLOQUE DE CÓDIGO CORRECTO ***

// Registrar los métodos de control
var controls = viewer.controls();

controls.registerMethod('mouseView', new Marzipano.MouseViewControl(viewer.settings()));
controls.registerMethod('drag', new Marzipano.DragControl(viewer.settings(), Marzipano.Stage.-1));
controls.registerMethod('deviceOrientation', new Marzipano.DeviceOrientationControlMethod());

// Habilitar los controles
controls.enableMethod('drag');
controls.enableMethod('mouseView');
controls.enableMethod('deviceOrientation');

// ****************************************

  // Create scenes.
  var scenes = data.scenes.map(function(data) {
    var urlPrefix = "tiles";
    var source = Marzipano.ImageUrlSource.fromString(
      urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" });
    var geometry = new Marzipano.CubeGeometry(data.levels);

    var limiter = Marzipano.RectilinearView.limit.traditional(data.faceSize, 100*Math.PI/180, 120*Math.PI/180);
    var view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);

    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });

    return {
      data: data,
      scene: scene,
      view: view
    };
  });
  
  scenes[0].scene.switchTo();
}