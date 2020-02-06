let renderer, scene, camera, door, doorWire, cursorCtx, thumbImage, thumbEl;
let cursorRadius = 8;
let CurrentCursorRadius = 8;
let last_known_scroll_position = 0;
let ticking = false;
let currentBlur = 0;
let container = null;

function handleScroll(scroll_pos) {
    currentValue = 1 - (scroll_pos * .0035);
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
    if (door){

        door.rotation.z += 0.0001;
        //doorWire.rotation.z += 0.0001;
        door.rotation.y -= 0.0001;
        //doorWire.rotation.y -= 0.0001;
        door.material.map.offset.x += .00000001;
        door.material.map.offset.y += .0001;
        
        camera.position.z += .00001;
        renderer.render(scene, camera);
    }
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
    CurrentCursorRadius += (cursorRadius - CurrentCursorRadius) * .2;
    cursorCtx.clearRect(0, 0, cursorCtx.canvas.width, cursorCtx.canvas.height)
    cursorCtx.beginPath();
    cursorCtx.arc(mouse.x, mouse.y, CurrentCursorRadius, 0, 2 * Math.PI);
    cursorCtx.fillStyle = 'white';
    cursorCtx.fill();
}

function moveThumbnail(mousePos) {
    thumbEl.style.left = (mousePos.x - 10) + 'px';
    thumbEl.style.top = (mousePos.y - 5) + 'px';

    if (mousePos.y < thumbEl.getBoundingClientRect().height + 50) {
        thumbEl.style.top = `${thumbEl.getBoundingClientRect().height + 50}px`;
    }
}

function initCursor() {
    cursorCanvas = document.querySelector('#cursor')
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;

    cursorCtx = cursorCanvas.getContext('2d')
    cursorCtx.fillStyle = 'white'

    let links = document.querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('mouseover', function () {
            cursorRadius = 16;
        })
        links[i].addEventListener('mouseout', function () {
            cursorRadius = 8;
        })
    }
}

function initHero() {
    container = document.querySelector('.home-hero')
    container.innerHTML = ''
    
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
        camera.position.z = 2.5;
        //doorWire = root.getObjectByName('doorWire');
    }, undefined, function (error) {
        console.error(error);
    });

}



window.addEventListener('DOMContentLoaded', function () {
    initHero()
    initCursor()
    animate();

    thumbEl = document.querySelector('.thumbnail')
    thumbImage = document.querySelector('.thumbnail img')
    let allPeople = document.querySelectorAll('.person')

    for (let i = 0; i < allPeople.length; i++) {
        let p = allPeople[i];
        p.addEventListener('mouseover', function (e) {
            document.body.classList.add('hovering-name')
            let name = this.innerText.replace(' ', '-');
            let filename = this.getAttribute('data-thumb')
            if (filename) {
                thumbImage.setAttribute('src', `./assets/thumbs/${filename}`)
            } else {
                thumbImage.setAttribute('src', ``)
            }

        })
        p.addEventListener('mouseout', function () {
            document.body.classList.remove('hovering-name')
        })
    }
    window.addEventListener('mousemove', e => {
        let mousePos = {
            x: e.clientX,
            y: e.clientY,
        }
        if (!ticking) {
            window.requestAnimationFrame(function () {
                drawCursor(mousePos);
                moveThumbnail(mousePos);
                ticking = false;
            });
            ticking = true;
        }
    })

    window.addEventListener('resize', e => {
        initHero()
        initCursor()
    })

})