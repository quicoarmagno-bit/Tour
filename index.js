// CÓDIGO FINAL, CORREGIDO Y PROBADO.

// Esta función se ejecutará solo cuando TODA la página esté cargada.
window.addEventListener('load', () => {

  const permissionButton = document.getElementById('permission-button');
  const panoElement = document.getElementById('pano');

  // EL ERROR ESTABA AQUÍ. ESTA LÍNEA AHORA ESTÁ DENTRO DEL 'LOAD' Y FUNCIONARÁ.
  panoElement.style.display = 'none';

  function requestDeviceOrientation() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            permissionButton.style.display = 'none';
            panoElement.style.display = 'block';
            iniciarVisor360(true); // Iniciar con giroscopio
          } else {
            alert('Permiso denegado. Se activará el modo táctil.');
            permissionButton.style.display = 'none';
            panoElement.style.display = 'block';
            iniciarVisor360(false); // Iniciar sin giroscopio
          }
        })
        .catch(console.error);
    } else {
      // Para Android y otros
      permissionButton.style.display = 'none';
      panoElement.style.display = 'block';
      iniciarVisor360(true); // Iniciar con giroscopio
    }
  }

  permissionButton.addEventListener('click', requestDeviceOrientation);
});

function iniciarVisor360(activarGiroscopio) {
  'use strict';

  var Marzipano = window.Marzipano;
  var data = window.APP_DATA;
  var panoElement = document.getElementById('pano');

  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);

  var controls = viewer.controls();
  var deviceOrientationControlMethod = new Marzipano.DeviceOrientationControlMethod();
  
  controls.registerMethod('deviceOrientation', deviceOrientationControlMethod);

  if (activarGiroscopio) {
    controls.enableMethod('deviceOrientation');
  }

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