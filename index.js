// CÓDIGO PARA index.js

window.addEventListener('load', () => {
  const permissionButton = document.getElementById('permission-button');
  const panoElement = document.getElementById('pano');

  function requestAndInitialize() {
    // Primero pedimos permiso si es necesario (iOS)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            initializeViewer(true); // Iniciar con giroscopio
          } else {
            alert('Permiso denegado. Se activará el modo táctil.');
            initializeViewer(false); // Iniciar sin giroscopio
          }
        })
        .catch(console.error);
    } else {
      // Para Android y otros, no se pide permiso explícito
      initializeViewer(true);
    }
  }

  function initializeViewer(useGyro) {
    // Ocultar botón y mostrar el lienzo del panorama
    permissionButton.style.display = 'none';
    
    // Inicializar Marzipano
    var Marzipano = window.Marzipano;
    var data = window.APP_DATA;
    var viewer = new Marzipano.Viewer(panoElement);

    // Registrar y habilitar controles
    var controls = viewer.controls();
    if (useGyro) {
      var deviceOrientationControlMethod = new Marzipano.DeviceOrientationControlMethod();
      controls.registerMethod('deviceOrientation', deviceOrientationControlMethod);
      controls.enableMethod('deviceOrientation');
    }
    controls.enableMethod('drag'); // Habilitar control táctil/arrastre
    
    // Crear y mostrar la escena
    var sceneData = data.scenes[0];
    var source = Marzipano.ImageUrlSource.fromString(
      "tiles/" + sceneData.id + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: "tiles/" + sceneData.id + "/preview.jpg" });
    var geometry = new Marzipano.CubeGeometry(sceneData.levels);
    var limiter = Marzipano.RectilinearView.limit.traditional(sceneData.faceSize, 100*Math.PI/180, 120*Math.PI/180);
    var view = new Marzipano.RectilinearView(sceneData.initialViewParameters, limiter);
    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });
    scene.switchTo();
  }

  permissionButton.addEventListener('click', requestAndInitialize);
});