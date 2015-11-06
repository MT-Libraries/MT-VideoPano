
/**
 *
 * orbitControls.
 *
 * @project     localhost_panoplayer
 * @datetime    14:55 - 28/07/2015
 * @author      Thonatos.Yang <thonatos.yang@gmail.com>
 * @copyright   Thonatos.Yang <https://www.thonatos.com>
 *
 */

exports.moveControls = function (object, domElement) {

    // Event
    var scope = this;
    
    this.object = object;
    this.domElement = (domElement !== undefined) ? domElement : document;
    this.object.target = new THREE.Vector3(0, 0, 0);

    // API
    
    this.enabled = true;

    // Params 
    
    var lon = 0,
        lat = 0,
        phi = 0,
        theta = 0,
        distance = 600;
        
    // Offset
    scope.prop = {};
    scope.prop.mousePositionRelative = [0, 0];
        
    function getContainerDimensions() {

        if (this.domElement != document) {

            return {
                size: [scope.domElement.offsetWidth, scope.domElement.offsetHeight],
                offset: [scope.domElement.offsetLeft, scope.domElement.offsetTop]
            };

        } else {

            return {
                size: [window.innerWidth, window.innerHeight],
                offset: [0, 0]
            };

        }

    }
     
    
    function onMouseMove(event) {
        
        event.preventDefault();
        
        if (scope.enabled === false) return;

        // absolute axis
        var aX = event.pageX || 0;
        var aY = event.pageY || 0;

        scope.prop.mousePosition = [aX, aY];

        // relative axix 
        var dims = scope.prop.dims;
        
         
        var mousePosition = scope.prop.mousePosition;
        var containerOffset = dims.offset;
        var containerSize = dims.size;
        
        var rX = mousePosition[0] - containerOffset[0];
        var rY = mousePosition[1] - containerOffset[1];

        // change axis to container center(x/2,y/2)
        scope.prop.mousePositionRelative = [rX-containerSize[0]/2, rY-containerSize[1]/2];    

    }    
    
    this.connect = function () {
        scope.prop.dims = getContainerDimensions();
        document.addEventListener('mousemove', onMouseMove, false);
    };

    this.disconnect = function () {
        document.removeEventListener('mousemove', onMouseMove, false);
        scope.enabled = false;
    };

    this.update = function () {

        if (!scope.enabled) return;

        lon = scope.prop.mousePositionRelative[0] * 0.2;
        lat = -scope.prop.mousePositionRelative[1] * 0.1;
        
        lat = Math.max(-30, Math.min(30, lat));
        phi = THREE.Math.degToRad(lat);
        theta = THREE.Math.degToRad(lon) + Math.PI;

        scope.object.position.x = distance * Math.sin(theta) * Math.cos(phi);
        scope.object.position.y = distance * Math.sin(phi + Math.PI/6);
        scope.object.position.z = distance * Math.cos(phi) * Math.cos(theta);

        scope.object.lookAt(scope.object.target);
    };

    this.connect();

};

