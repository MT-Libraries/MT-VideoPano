/**
 *
 * videoPano.
 *
 * @project     videoPano
 * @datetime    21:25 - 15/11/5
 * @author      Thonatos.Yang <thonatos.yang@gmail.com>
 * @copyright   Thonatos.Yang <https://www.thonatos.com>
 *
 */

(function (window, document, exportName) {

    var THREE = require('./vendors/three');
    var HAMMER = require('./vendors/hammer');

    var extend = require('./utils/extend').extend;
    var detector = require('./utils/detector').detector;

    var VideoPano = function (option) {

        var obj = {};
        var _protected = {};

        // Config
        var defaultOptions = {
            src: '../assets/video/demo.mp4',
            fov: 105,
            loop: true,
            container: 'container',
            width: 2048,
            height: 1024,
            autoplay: true
        };

        var currentOptions = extend(defaultOptions, option);

        // Protected

        _protected.log = function (logs) {
            console.log(logs);
        };

        _protected.prepare = function () {

            window.THREE = THREE;
            window.Hammer = HAMMER;

            return detector.webgl && detector.canvas;
        };

        _protected.create = function () {

            var camera,
                scene,
                renderer,
                video,
                videoCanvas,
                controls,
                texture,
                videoContext,
                clock;


            // var trackControls = require('../threejs/trackControls').trackControls;
            // var orbitControls = require('../threejs/orbitControls').orbitControls;
            var moveControls = require('./plugins/moveControls').moveControls;

            function initPano() {

                var container, mesh;

                container = document.getElementById(currentOptions.container);

                // video
                video = document.createElement('video');

                video.width = currentOptions.width;
                video.height = currentOptions.height;
                video.autoplay = currentOptions.autoplay;

                video.setAttribute('loop', currentOptions.loop);
                video.setAttribute("playsinline", "");
                video.setAttribute("webkit-playsinline", "");
                video.setAttribute("preload", "auto");
                video.setAttribute("crossorigin", "anonymous");
                video.src = currentOptions.src;

                // canvas
                videoCanvas = document.createElement('canvas');
                videoCanvas.width = video.width;
                videoCanvas.height = video.height;
                videoContext = videoCanvas.getContext('2d');


                // WebGl
                texture = new THREE.Texture(videoCanvas);
                texture.minFilter = THREE.LinearFilter;

                camera = new THREE.PerspectiveCamera(currentOptions.fov, window.innerWidth / window.innerHeight, 1, 10000);

                scene = new THREE.Scene();

                mesh = new THREE.Mesh(new THREE.SphereGeometry(1000, 96, 48), new THREE.MeshBasicMaterial({
                    map: texture
                }));

                mesh.scale.x = -1;
                scene.add(mesh);

                renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth, window.innerHeight);

                container.appendChild(renderer.domElement);

                clock = new THREE.Clock();
                controls = new moveControls(camera, container);

                registerEvent();

            }

            function updateSize() {

                var _videoWidth = video.videoWidth;
                var _videoHeight = video.videoHeight;

                _protected.log('updateSize: ' + _videoWidth + ' ' + _videoHeight);

                if ((_videoWidth > 0) && (_videoHeight > 0)) {
                    videoCanvas.width = _videoWidth;
                    videoCanvas.height = _videoHeight;

                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);

                } else {
                    setTimeout(updateSize, 1000);
                }
            }

            function registerEvent() {

                window.onresize = function () {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                };

                video.onerror = function () {

                    var err = "unknown error";
                    switch (video.error.code) {
                        case 1:
                            err = "video loading aborted";
                            break;
                        case 2:
                            err = "network loading error";
                            break;
                        case 3:
                            err = "video decoding failed / corrupted data or unsupported codec";
                            break;
                        case 4:
                            err = "video not supported";
                            break;
                    }

                    _protected.log("Error: " + err + ",errorcode=" + video.error.code);
                };

                video.addEventListener('play', function () {
                    _protected.log({play: video.currentTime});

                    updateSize();
                }, false);

                video.addEventListener('canplay', function () {
                    _protected.log({canplay: video.currentTime});
                }, false);
            }


            function animate() {

                requestAnimationFrame(animate);
                controls.update();
                render();

            }

            function render() {

                videoContext.drawImage(video, 0, 0);

                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    texture.needsUpdate = true;
                }

                renderer.render(scene, camera);

                // for update
                var delta = clock.getDelta();
                controls.update(delta);
            }

            initPano();
            animate();

        };

        obj.init = function () {
            _protected.prepare();
            _protected.create();
        };

        return obj;

    };

    window[exportName] = VideoPano;

})(window, document, 'VideoPano');


