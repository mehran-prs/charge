let Force = (function () {
        function bindTabsToApp() {
            // set current render on select tab(to prevent other
            // tabs render from rendering when is not visible).

            let $appTabs = $('.app-tabs');

            $appTabs.find('a.tab').on('click', function () {
                renders.setCurrentRender(
                    renders[$(this).data('render')]
                );
            });

            let currentRender = $appTabs.find('a.tab.active').data('render');
            renders.setCurrentRender(renders[currentRender])
        }

        let cubeDim = 10;

        let renders = {
            // list of renderer objects:
            list: [],

            // num of current renderer
            current: null,
            setCurrentRender(renderNum) {
                this.current = renderNum;
            },

            // renders list
            sphere: 1,
            game: 2,
            chips: 3,
            chipsGame: 4,
        };

        let Util = {
            addNewCharge: function (scene, val, pos, materialProps) {
                pos = $.extend({
                    x: THREE.Math.randFloatSpread(cubeDim),
                    y: THREE.Math.randFloatSpread(cubeDim),
                    z: THREE.Math.randFloatSpread(cubeDim),
                }, pos);

                materialProps = $.extend({
                    color: val === 1 ? 0x2AE1B7 : 0xf7370b,
                }, materialProps);

                var chargeGeom = new THREE.SphereGeometry(0.25, 32, 32);
                var chargeMat = new THREE.MeshBasicMaterial(materialProps);
                var charge = new THREE.Mesh(chargeGeom, chargeMat);

                charge.position.set(pos.x, pos.y, pos.z);
                charge.userData.charge = val;

                scene.add(charge);

                return charge;
            },

            fillSceneWithArrows: function (scene, canInsert) {
                // arrows
                var arrows = [];

                for (let x = 0; x < cubeDim + 1; x++) {
                    for (let y = 0; y < cubeDim + 1; y++) {
                        for (let z = 0; z < cubeDim + 1; z++) {
                            let dir = new THREE.Vector3(
                                THREE.Math.randFloatSpread(2),
                                THREE.Math.randFloatSpread(2),
                                THREE.Math.randFloatSpread(2))
                                .normalize();

                            let origin = new THREE.Vector3(x - 5, y - 5, z - 5);
                            let arrow = new THREE.ArrowHelper(dir, origin, .5, 0xffffff, 0.35);

                            // Check can insert this arrow:
                            if (!canInsert || canInsert(arrow)) {
                                arrows.push(arrow);
                                scene.add(arrow);
                            }

                        }
                    }
                }

                return arrows;
            },

            arrangeArrows: function (charges, arrows) {
                let direction = new THREE.Vector3();
                let normal = new THREE.Vector3();
                let forceVector = new THREE.Vector3();
                let directions = [];
                let result = new THREE.Vector3();

                arrows.forEach((arrow) => {
                    directions = [];
                    charges.forEach((charge, index) => {
                        direction.subVectors(arrow.position, charge.position);
                        normal.copy(direction).normalize();
                        directions.push({
                            dir: (charge.userData.charge === -1 ? normal.negate() : normal).clone(),
                            force: 1 / Math.pow(forceVector.subVectors(arrow.position, charge.position).length(), 2)
                        });
                    });

                    result.set(0, 0, 0);

                    directions.forEach((dir) => {
                        result.addScaledVector(dir.dir, dir.force);
                    });

                    arrow.setDirection(result.normalize());
                });
            }
        };

        function Sphere() {
            let scene = new THREE.Scene();
            let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = 20;
            let renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            $('#sphere').append(renderer.domElement);

            let controls = new THREE.OrbitControls(camera, renderer.domElement);


            // var cubeGeom = new THREE.BoxGeometry(cubeDim, cubeDim, cubeDim);
            let geometry = new THREE.SphereGeometry(cubeDim / 2, 32, 32);
            let wireframe = new THREE.EdgesGeometry(geometry);
            let sphereWire = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({
                depthText: false,
                opacity: 0.5,
                transparent: true,
                color: "gray"
            }));

            scene.add(sphereWire);

            let zeroVector = new THREE.Vector3();
            let arrows = Util.fillSceneWithArrows(scene, function (arrow) {
                // return arrow.position.distanceTo(zeroVector) <= cubeDim / 2
                return true;
            });

            // Set new charge in center of sphere:
            let charges = [
                Util.addNewCharge(scene, 1, {x: 0, y: 0, z: 0}, {opacity: .1, transparent: true})
            ];

            Util.arrangeArrows(charges, arrows);

            renders.list.push({
                renderName: renders.sphere,
                renderer: renderer,
                scene: scene,
                camera: camera,
            });

        }

        function Game() {
            let $container = $('#game');
            let $setCharge = $container.find('.set-charge');

            let scene = new THREE.Scene();
            let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = 20;
            let renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            $container.append(renderer.domElement);

            let controls = new THREE.OrbitControls(camera, renderer.domElement);


            // var geometry = new THREE.BoxGeometry(cubeDim, cubeDim, cubeDim);
            let geometry = new THREE.SphereGeometry(cubeDim / 2, 32, 32);
            let wireframe = new THREE.EdgesGeometry(geometry);
            let sphereWire = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({
                depthText: false,
                opacity: 0.5,
                transparent: true,
                color: "green"
            }));

            scene.add(sphereWire);

            let zeroVector = new THREE.Vector3();
            let arrows = Util.fillSceneWithArrows(scene, function (arrow) {
                return arrow.position.distanceTo(zeroVector) <= cubeDim / 2;
            });

            // Set new charge in center of sphere:
            let charges = [];

            // Set listener on to add charges:
            $setCharge.on('click', function () {
                let val = parseInt($(this).data('charge'));

                charges.push(
                    Util.addNewCharge(scene, val)
                );

                Util.arrangeArrows(charges, arrows)
            });

            renders.list.push({
                renderName: renders.game,
                renderer: renderer,
                scene: scene,
                camera: camera,
            });

        }

        function Chips() {
            let scene = new THREE.Scene();
            let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = 20;
            let renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            $('#chips').append(renderer.domElement);

            let controls = new THREE.OrbitControls(camera, renderer.domElement);

            let arrows = Util.fillSceneWithArrows(scene, function (arrow) {
                return arrow.position.z === 0;
            });

            // Set new charge in center of sphere:
            let charges = [
                Util.addNewCharge(scene, 1, {x: -5, y: 0, z: 0}),
                Util.addNewCharge(scene, -1, {x: 5, y: 0, z: 0})
            ];

            Util.arrangeArrows(charges, arrows);

            renders.list.push({
                renderName: renders.chips,
                renderer: renderer,
                scene: scene,
                camera: camera,
            });
        }

        function ChipsGame() {
            let $container = $('#chips-game');
            let $setCharge = $container.find('.set-charge');
            let scene = new THREE.Scene();
            let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = 20;
            let renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            $container.append(renderer.domElement);


            let controls = new THREE.OrbitControls(camera, renderer.domElement);

            let arrows = Util.fillSceneWithArrows(scene, function (arrow) {
                return arrow.position.z === 0;
            });

            // Set new charge in center of sphere:
            let charges = [];
            // let charges = [
            //     Util.addNewCharge(scene, 1, {x: -5, y: 0, z: 0}),
            //     Util.addNewCharge(scene, -1, {x: 5, y: 0, z: 0})
            // ];
            //
            // Util.arrangeArrows(charges, arrows);

            // Set listener to add new charges:
            $setCharge.on('click', function () {
                let val = parseInt($(this).data('charge'));

                charges.push(
                    Util.addNewCharge(scene, val)
                );

                Util.arrangeArrows(charges, arrows)
            });

            renders.list.push({
                renderName: renders.chipsGame,
                renderer: renderer,
                scene: scene,
                camera: camera,
            });
        }

        function render() {
            requestAnimationFrame(render);
            // scene.rotation.y += clock.getDelta() * 0.1;

            renders.list.forEach((pack) => {
                // render just for active tab:
                if (pack.renderName === renders.current) {
                    pack.renderer.render(pack.scene, pack.camera);
                }
            });
        }

        function initSphereChart() {
            // calculate radius and e:
            let R = cubeDim / 2;
            let radius = [];
            let e = [];

            function calculateE() {

                let k = 9 * Math.pow(10, 9);
                let q = 5 * Math.pow(10, -19);

                function calculateInside(r) {
                    return (k * q / (Math.pow(R, 3))) * r;
                }

                function calculateOutside(r) {
                    return k * q / Math.pow(r, 2);
                }

                for (let r = .1; r < 10; r += .1) {
                    radius.push(r);
                    e.push(r <= R ? calculateInside(r) : calculateOutside(r))
                }
            }

            calculateE();

            let data = {
                labels: radius,
                datasets: [{
                    label: 'E ',
                    data: e,
                    backgroundColor: 'rgba(247, 55, 11, 0.5)',
                    borderColor: 'rgba(247, 55, 11, 1)',
                    borderWidth: 1
                }]
            };
            var ctx = document.getElementById("sphere-chart-canvas").getContext('2d');
            var myLineChart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            display: false, //this will remove all the x-axis grid lines
                        }]
                    },

                }
            });

        }


        return {
            init: function () {
                bindTabsToApp();

                // make apps:
                new Sphere();
                new Game();
                new Chips();
                new ChipsGame();

                render();

                // Set chart:
                initSphereChart();
            }
        }

    }
)();

Force.init();