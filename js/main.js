let renderer, scene, camera, door, doorWire, cursorCtx, thumbImage, thumbEl;

let cursor = {
    width: {
        target: 18,
        current: 18
    },
    height: {
        target: 18,
        current: 18
    },
    textOpacity: {
        target: 0,
        current: 0
    }
}

let last_known_scroll_position = 0;
let ticking = false;
let currentBlur = 0;
let container, locationContainer, datesContainer;
let mousePos = {
    x: 0,
    y: 0,
}
let cursorText = '';


function handleScroll(scroll_pos) {
    currentValue = .9 - (scroll_pos * .0025);
    const min = 0;
    if (currentValue < min) {
        currentValue = min;
    }
    container.style.opacity = `${currentValue}`
    // locationContainer.style.opacity = `${1 - scroll_pos * .005}`
    // datesContainer.style.opacity = `${1 - scroll_pos * .005}`
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
    drawCursor(mousePos)
    moveThumbnail(mousePos)
    if (door) {

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
    cursor.width.current += (cursor.width.target - cursor.width.current) * .2;
    cursor.height.current += (cursor.height.target - cursor.height.current) * .2;
    cursor.textOpacity.current += (cursor.textOpacity.target - cursor.textOpacity.current) * .15;

    cursorCtx.clearRect(0, 0, cursorCtx.canvas.width, cursorCtx.canvas.height)

    let x = mouse.x - cursor.width.current / 2;
    let y = mouse.y - cursor.height.current / 2;
    cursorCtx.fillStyle = 'white';
    cursorCtx.roundRect(x, y, cursor.width.current, cursor.height.current, 6)
    cursorCtx.fill()

    cursorCtx.fillStyle = `rgba(0,0,0,${cursor.textOpacity.current})`;
    cursorCtx.fillText(cursorText, x + 5, y + 5 + cursor.height.current / 2)
}

function moveThumbnail(mousePos) {
    thumbEl.style.left = (mousePos.x - 10) + 'px';
    thumbEl.style.top = (mousePos.y + 20) + 'px';

    if (mousePos.y < thumbEl.getBoundingClientRect().height + 50) {
        thumbEl.style.top = `${thumbEl.getBoundingClientRect().height + 50}px`;
    }
    if (mousePos.x > window.innerWidth - (thumbEl.getBoundingClientRect().width + 32)) {
        thumbEl.style.left = `${window.innerWidth - (thumbEl.getBoundingClientRect().width + 32)}px`;
    }
}

function initCursor() {
    cursorCanvas = document.querySelector('#cursor')
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;

    cursorCtx = cursorCanvas.getContext('2d')
    cursorCtx.font = '500 14px Untitled Sans, sans-serif'
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    }

    let links = document.querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
        links[i].addEventListener('mouseover', function () {
            cursor.height.target = 18;
            let href = this.getAttribute('href');
            if (href.includes('instagram')) {
                cursorText = 'Instagram'
            } else if (href.includes('twitter')){
                cursorText = 'Twitter'
            } else if (href.includes('maps')){
                cursorText = 'Google Maps'
            } else if (href.includes('rca.ac.uk')){
                cursorText = 'rca.ac.uk'
            } else {
                cursorText = href.replace(/(https?:\/\/|www\.|\/$)/g, '')
            }
            cursor.width.target = cursorCtx.measureText(cursorText).width + 10;
            window.setTimeout(function(){
                cursor.textOpacity.target = 1;
            }, 70)
            
        })
        links[i].addEventListener('mouseout', function () {
            cursor.width.target = 18;
            cursor.height.target = 18;
            cursor.textOpacity.target = 0;
            cursorText = ''
        })
    }
}

function initHero() {
    container = document.querySelector('.home-hero')
    locationContainer = document.querySelector('.location')
    datesContainer = document.querySelector('.dates')
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

    thumbEl = document.querySelector('.thumbnail')
    thumbImage = document.querySelector('.thumbnail img')
    let allPeople = document.querySelectorAll('.person')
    animate();


    for (let i = 0; i < allPeople.length; i++) {
        let p = allPeople[i];
        p.addEventListener('mouseover', function (e) {
            document.body.classList.add('hovering-name')
            let name = this.innerText.replace(' ', '-');
            let filename = this.getAttribute('data-thumb')
            if (filename) {
                thumbImage.setAttribute('src', `./assets/dist/${filename}`)
            } else {
                thumbImage.setAttribute('src', ``)
            }

        })
        p.addEventListener('mouseout', function () {
            document.body.classList.remove('hovering-name')
        })
    }
    window.addEventListener('mousemove', e => {
        mousePos = {
            x: e.clientX,
            y: e.clientY,
        }
    })

    window.addEventListener('resize', e => {
        initHero()
        initCursor()
    })

})