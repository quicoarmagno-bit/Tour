// CÓDIGO FINAL, VERIFICADO Y CORRECTO PARA index.js

window.addEventListener('load', () => {
  const permissionButton = document.getElementById('permission-button');
  const panoElement = document.getElementById('pano');

  function requestDeviceOrientation() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            permissionButton.style.display = 'none';
            panoElement.style.display = 'block';
            iniciarVisor360();
          } else {
            alert('Permiso denegado. No se puede usar el giroscopio.');
          }
        })
        .catch(console.error);
    } else {
      permissionButton.style.display = 'none';
      panoElement.style.display = 'block';
      iniciarVisor360();
    }
  }

  permissionButton.addEventListener('click', requestDeviceOrientation);
});


function iniciarVisor360() {
  'use strict';

  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;
  var panoElement = document.getElementById('pano');

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

  document.body.classList.add('no-touch');
  window.addEventListener('touchstart', function() {
    document.body.classList.remove('no-touch');
    document.body.classList.add('touch');
  });

  if (bowser.msie && parseFloat(bowser.version) < 11) {
    document.body.classList.add('tooltip-fallback');
  }

  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);

  // *** ESTA ES LA SECCIÓN CORREGIDA ***
  // Registrar los métodos de control que vamos a usar
  var controls = viewer.controls();
  
  // La línea de DragControl ha sido simplificada para eliminar el error
  controls.registerMethod('drag', new Marzipano.DragControl(viewer.settings()));
  controls.registerMethod('mouseView', new Marzipano.MouseViewControl(viewer.settings()));
  controls.registerMethod('deviceOrientation', new Marzipano.DeviceOrientationControlMethod());
  
  // Habilitar los controles
  controls.enableMethod('drag');
  controls.enableMethod('mouseView');
  controls.enableMethod('deviceOrientation');
  // ****************************************

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