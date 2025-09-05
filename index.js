// CÓDIGO FINAL Y DEFINITIVO para index.js

window.addEventListener('load', () => {
  const permissionButton = document.getElementById('permission-button');
  
  // Ocultamos el visor al principio
  document.getElementById('pano').style.display = 'none';

  function requestDeviceOrientation() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            permissionButton.style.display = 'none';
            document.getElementById('pano').style.display = 'block';
            iniciarVisor360(true); // Iniciar con giroscopio
          } else {
            alert('Permiso denegado. Se activará el modo táctil.');
            permissionButton.style.display = 'none';
            document.getElementById('pano').style.display = 'block';
            iniciarVisor360(false); // Iniciar sin giroscopio
          }
        })
        .catch(console.error);
    } else {
      // Para Android y otros, el clic es suficiente
      permissionButton.style.display = 'none';
      document.getElementById('pano').style.display = 'block';
      iniciarVisor360(true); // Iniciar con giroscopio
    }
  }

  permissionButton.addEventListener('click', requestDeviceOrientation);
});

// La función ahora acepta un parámetro para saber si debe activar el giroscopio
function iniciarVisor360(activarGiroscopio) {
  'use strict';

  var Marzipano = window.Marzipano;
  var data = window.APP_DATA;
  var panoElement = document.getElementById('pano');

  // Opciones del visor
  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };

  // Inicializar visor
  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);
  
  // ESTA ES LA PARTE CLAVE Y CORREGIDA
  // Creamos el método de control del giroscopio
  var deviceOrientationControlMethod = new Marzipano.DeviceOrientationControlMethod();
  
  // Registramos el método de control del giroscopio
  var controls = viewer.controls();
  controls.registerMethod('deviceOrientation', deviceOrientationControlMethod);

  // Si el permiso fue concedido, lo habilitamos
  if (activarGiroscopio) {
    controls.enableMethod('deviceOrientation');
  }
  // Los controles de arrastre y ratón ya están habilitados por defecto

  // Crear escenas (tu código original, sin cambios)
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