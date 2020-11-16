// once everything is loaded, we run our Three.js stuff.
$(function () {
  var stats = initStats();

  // create a scene, that will hold all our elements such as objects, cameras and lights.
  var scene = new THREE.Scene();

  // create a camera, which defines where we're looking at.
  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );

  // create a render and set the size
  var webGLRenderer = new THREE.WebGLRenderer();
  webGLRenderer.setClearColor(new THREE.Color(0xeeeeee, 1.0));
  webGLRenderer.setSize(window.innerWidth, window.innerHeight);
  webGLRenderer.shadowMap.enabled = true;
  webGLRenderer.shadowMapSoft = true;
  // webGLRenderer.shadowMap.renderReverseSided = false;
  // webGLRenderer.shadowMap.renderSingleSided = false;

  // axes helper
  //var axes = new THREE.AxesHelper(300);
  //scene.add(axes);

  var shape = createShapeMesh(
    new THREE.ShapeGeometry(drawLeftShape()),
    new THREE.Vector3(-9, 3, 11)
  );
  shape.castShadow = true;
  // add the sphere to the scene
  scene.add(shape);

  var shapes = [shape];

  const planeW = 200;
  const planeD = 258;
  const zDistancePlanes = 0;
  const yDistancePlanes = 100;

  var planeGeometry = new THREE.PlaneGeometry(planeW, planeD);
  var planeMaterial = new THREE.MeshPhongMaterial({
    color: 0x999999,
    side: THREE.DoubleSide,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  plane.rotation.x = -0.5 * Math.PI;
  plane.position.z = planeD / 2;
  scene.add(plane);

  var planeMaterial = new THREE.MeshPhongMaterial({
    color: 0x888888,
    side: THREE.DoubleSide,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;

  plane.position.x = 100;
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.z = planeD / 2 - zDistancePlanes;
  plane.position.y = yDistancePlanes;
  scene.add(plane);

  // position and point the camera to the center of the scene
  camera.position.x = -100;
  camera.position.y = 200;
  camera.position.z = 400;
  camera.lookAt(scene.position);

  var ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.position.set(
    plane.position.x,
    plane.position.y,
    plane.position.z
  );
  ambientLight.intensity = 0.1;

  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-60, 150, 30);
  spotLight.castShadow = true;
  spotLight.receiveShadow = true;
  spotLight.shadowCameraVisible = true;

  spotLight.intensity = 3;
  spotLight.distance = 200;
  //spotLight.angle = Math.PI / 6;
  spotLight.shadow.camera.near = 20;
  spotLight.shadow.camera.fov = 30;
  // spotLight.penumbra = 0.8;
  // spotLight.decay = 1;
  // spotLight.shadowMapWidth = 512;
  // spotLight.shadowMapHeight = 512;
  // spotLight.shadow.bias = -0.01;

  // var d = 200;

  // spotLight.shadowCameraLeft = -d;
  // spotLight.shadowCameraRight = d;
  // spotLight.shadowCameraTop = d;
  // spotLight.shadowCameraBottom = -d;

  // spotLight.shadowCameraFar = 1000;
  // spotLight.shadowDarkness = 0.2;

  scene.add(spotLight);
  scene.add(ambientLight);

  // add the output of the renderer to the html element
  $("#WebGL-output").append(webGLRenderer.domElement);

  // setup the control gui
  var controls = new (function () {
    this.stairsCount = 20;
    this.relativePosition = 2 / 11;
    this.degree = 0;

    this.asGeom = function () {
      // remove the old plane
      shapes.forEach((value) => scene.remove(value));
      shapes = [];
      // create a new one

      var options = {
        stairsCount: controls.stairsCount,
        relativePosition: controls.relativePosition,
        degree: controls.degree,
      };

      const extrudeSettings = {
        depth: 1,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 1,
        bevelThickness: 1,
      };
      const startingZStairOffset = 50;
      const yOffset = yDistancePlanes / options.stairsCount;
      var shape;
      var tubesPoints = [];
      var supportPoints = [];
      for (var i = 1; i <= options.stairsCount; i++) {
        shapePos = new THREE.Vector3(
          -9 + Math.sin((((options.degree * Math.PI) / 180) * i) / 20) * 20,
          yOffset * i,
          startingZStairOffset +
            Math.cos((((options.degree * Math.PI) / 180) * i) / 20) * 20
        );
        rotationZ = i * (Math.PI * options.relativePosition);
        //var angleStep = (i * (Math.PI * 2)) / 11;
        if (i % 2) {
          shape = createShapeMesh(
            new THREE.ExtrudeGeometry(drawRightShape(), extrudeSettings),
            shapePos,
            rotationZ
          );
          const cylinderSupport = createCilinder(20, shape.position, 0.5);
          const newAngle =
            Math.atan2(shape.position.z, shape.position.x) + rotationZ;
          cylinderSupport.position.x =
            shape.position.x + Math.sin(newAngle) * 15;
          cylinderSupport.position.y = shape.position.y + 20 / 2;
          cylinderSupport.position.z =
            shape.position.z + Math.cos(newAngle) * 13;
          shapes.push(cylinderSupport);
          scene.add(cylinderSupport);
          tubesPoints.push(
            new THREE.Vector3(
              cylinderSupport.position.x,
              cylinderSupport.position.y + 10,
              cylinderSupport.position.z
            )
          );
        } else {
          shape = createShapeMesh(
            new THREE.ExtrudeGeometry(drawLeftShape(), extrudeSettings),
            shapePos,
            rotationZ
          );
        }
        const cylinder = createCilinder(yOffset, shape.position);
        // cylinder.position = cylinderPos;
        const newAngle =
          Math.atan2(shape.position.z, shape.position.x) + rotationZ;
        cylinder.position.x = shape.position.x + Math.sin(newAngle) * 30;
        cylinder.position.y = shape.position.y - yOffset / 2;
        cylinder.position.z = shape.position.z + Math.cos(newAngle) * 30;
        supportPoints.push(
          new THREE.Vector3(
            cylinder.position.x,
            cylinder.position.y,
            cylinder.position.z
          )
        );

        shapes.push(cylinder);
        if (yOffset * i + 2 < yDistancePlanes) {
          shapes.push(shape);
          scene.add(shape);
        }
        scene.add(cylinder);
        prevCylinder = cylinder;
      }
      tube = generatePoints(tubesPoints, 64, 1, 8, false);
      anotherTube = generatePoints(supportPoints, 64, 1.5, 8, false, 0x999999);
      shapes.push(tube);
      shapes.push(anotherTube);
      if (yDistancePlanes - shape.position.y > 0.01) {
        const distToPlane = yDistancePlanes - shape.position.y;
        const cylinder = createCilinder(distToPlane, shape.position);
        cylinder.position.set(
          shape.position.x + 25,
          shape.position.y + distToPlane / 2,
          startingZStairOffset + options.stairsCount - 2
        );
        shapes.push(cylinder);
        scene.add(cylinder);
      }
      // add it to the scene.
    };
  })();

  var gui = new dat.GUI();
  gui.add(controls, "stairsCount", 0, 30).onChange(controls.asGeom);
  gui.add(controls, "relativePosition", 0, 0.25).onChange(controls.asGeom);
  gui.add(controls, "degree", -360, 360).onChange(controls.asGeom);

  controls.asGeom();
  var camControls = new THREE.TrackballControls(
    camera,
    webGLRenderer.domElement
  );

  render();

  function generatePoints(
    points,
    segments,
    radius,
    radiusSegments,
    closed,
    color = 0x00ff00
  ) {
    // use the same points to create a convexgeometry
    var tubeGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      segments,
      radius,
      radiusSegments,
      closed
    );
    var material = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    tubeMesh = new THREE.Mesh(tubeGeometry, material);
    scene.add(tubeMesh);
    return tubeMesh;
  }

  function drawRightShape() {
    // create a basic shape
    var shape = new THREE.Shape();

    // startpoint
    shape.moveTo(10, 10);

    shape.lineTo(10, 0);

    //x  y   x   y   x   y
    shape.bezierCurveTo(10, 0, 17, 0.01, 40, 5);

    shape.lineTo(40, 10);

    return shape;
  }

  function drawLeftShape() {
    // create a basic shape
    var shape = new THREE.Shape();

    // startpoint
    shape.moveTo(10, 10);

    shape.lineTo(40, 10);

    shape.lineTo(40, 0);

    //x  y   x   y   x   y
    shape.bezierCurveTo(40, 0, 33, 0.01, 10, 5);

    return shape;
  }

  function createCilinder(height, pos, radius = 2) {
    const cylinderGeometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      40
    );
    const material = new THREE.MeshPhongMaterial({ color: 0x999999 });
    const cylinder = new THREE.Mesh(cylinderGeometry, material);
    if (pos !== undefined)
      cylinder.position.set(pos.x + 25, pos.y - height / 2, pos.z - 5);
    cylinder.castShadow = true;
    return cylinder;
  }
  function createShapeMesh(geom, translation, rotY) {
    var stairMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });

    var mesh = new THREE.Mesh(geom, stairMaterial);

    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rotY;
    mesh.position.set(translation.x, translation.y, translation.z);

    mesh.castShadow = true;

    return mesh;
  }

  function render() {
    stats.update();

    // render using requestAnimationFrame
    requestAnimationFrame(render);
    webGLRenderer.render(scene, camera);
    camControls.update();
  }

  function initStats() {
    var stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0px";
    stats.domElement.style.top = "0px";

    $("#Stats-output").append(stats.domElement);

    return stats;
  }
});
