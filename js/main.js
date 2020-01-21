let renderer, scene, camera, door, doorWire, cursorCtx;
let cursorRadius = 10;
let last_known_scroll_position = 0;
let ticking = false;
let currentBlur = 0;
let container = null;

function handleScroll(scroll_pos) {
    currentValue = 1 - (scroll_pos * .0015);
    const min = 0;
    if (currentValue < min) {
        currentValue = min;
    }
    container.style.opacity = `${currentValue}`
}

window.addEventListener('scroll', function (e) {
    last_known_scroll_position = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(function () {
            handleScroll(last_known_scroll_position);
            ticking = false;
        });
        ticking = true;
    }
});

function animate() {
    requestAnimationFrame(animate);
    door.rotation.z += 0.0001;
    doorWire.rotation.z += 0.0001;
    door.rotation.y -= 0.0001;
    doorWire.rotation.y -= 0.0001;
    door.material.map.offset.x += .00000001;
    door.material.map.offset.y += .0001;

    camera.position.z += .00001;
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

function drawCursor(mouse) {
    cursorCtx.clearRect(0, 0, cursorCtx.canvas.width, cursorCtx.canvas.height)
    cursorCtx.beginPath();
    cursorCtx.arc(mouse.x, mouse.y, cursorRadius, 0, 2 * Math.PI);
    cursorCtx.fillStyle = 'white';
    cursorCtx.fill();
}

function initHero() {
    container = document.querySelector('.home-hero')
    cursorCanvas = document.querySelector('#cursor')
    cursorCanvas.width =  window.innerWidth;
    cursorCanvas.height = window.innerHeight;
    
    cursorCtx = cursorCanvas.getContext('2d')
    cursorCtx.fillStyle = 'white'

    window.addEventListener('mousemove', e => {
        let mousePos = {
            x: e.clientX,
            y: e.clientY,
        }
        console.log(mousePos)
        if (!ticking) {
            window.requestAnimationFrame(function () {
                drawCursor(mousePos);
                ticking = false;
            });
            ticking = true;
        }
    })

    scene = new THREE.Scene();
    const scale = 1;
    const h = (window.innerHeight * scale)
    const w = (window.innerWidth * scale)
    camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    var loader = new THREE.GLTFLoader();
    loader.load('./assets/door.glb', function (gltf) {
        const root = gltf.scene;
        scene.add(root);
        console.log(dumpObject(root).join('\n'));
        door = root.getObjectByName('door');
        doorWire = root.getObjectByName('doorWire');
        animate();
    }, undefined, function (error) {
        console.error(error);
    });

    camera.position.z = 2.5;
}



window.addEventListener('DOMContentLoaded', function () {
    initHero()
})