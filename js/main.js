let renderer, scene, camera, door, doorWire;

function animate() {
    requestAnimationFrame(animate);
    door.rotation.z += 0.0005;
    door.rotation.y += 0.0005;

//    camera.position.z -= .001;
    renderer.render(scene, camera);
};

function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

function initHero() {
    let container = document.querySelector('.home-hero')
    scene = new THREE.Scene();
    const h = (window.innerHeight * 1)
    const w = (window.innerWidth * 1)
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / h, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setSize(window.innerWidth, h);
    container.appendChild(renderer.domElement);

    var loader = new THREE.GLTFLoader();

    loader.load('./assets/door.glb', function (gltf) {
        const root = gltf.scene;
        scene.add(root);
        console.log(dumpObject(root).join('\n'));
        door = root.getObjectByName('door');
        animate();
    }, undefined, function (error) {
        console.error(error);
    });

    camera.position.z = 5;
}



window.addEventListener('DOMContentLoaded', function () {
    initHero()
})