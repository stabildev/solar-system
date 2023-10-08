import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'

// Import textures
import earthTexture from '../images/earth.jpg'
import jupiterTexture from '../images/jupiter.jpg'
import marsTexture from '../images/mars.jpg'
import mercuryTexture from '../images/mercury.jpg'
import neptuneTexture from '../images/neptune.jpg'
import plutoTexture from '../images/pluto.jpg'
import saturnRingTexture from '../images/saturn ring.png'
import saturnTexture from '../images/saturn.jpg'
import starsTexture from '../images/stars.jpg'
import sunTexture from '../images/sun.jpg'
import uranusRingTexture from '../images/uranus ring.png'
import uranusTexture from '../images/uranus.jpg'
import venusTexture from '../images/venus.jpg'

// Setup
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(-90, 140, 140)

const composer = new EffectComposer(renderer)

const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
)
bloomPass.threshold = 0.5
bloomPass.strength = 0.5
bloomPass.radius = 0.5
composer.addPass(bloomPass)

const smaaPass = new SMAAPass(
  window.innerWidth * renderer.getPixelRatio(),
  window.innerHeight * renderer.getPixelRatio()
)
composer.addPass(smaaPass)

const orbitControls = new OrbitControls(camera, renderer.domElement)

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const cubeTextureLoader = new THREE.CubeTextureLoader()
scene.background = cubeTextureLoader.load([
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
  starsTexture,
])

const textureLoader = new THREE.TextureLoader()
const loadWithSRGB = (url) =>
  textureLoader.load(
    url,
    (texture) => (texture.colorSpace = THREE.SRGBColorSpace)
  )

// Sun
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(16, 32, 32),
  new THREE.MeshBasicMaterial({ map: loadWithSRGB(sunTexture) })
)
scene.add(sun)

const sunLight = new THREE.PointLight(0xffffff, 5000, 5000, 1.75)
sun.add(sunLight)

// Planets
const planetaryData = [
  {
    name: 'mercury',
    radius: 3.2,
    texture: mercuryTexture,
    distanceFromSun: 28,
    rotationSpeed: 0.004,
    orbitSpeed: 0.04,
  },
  {
    name: 'venus',
    radius: 5.8,
    texture: venusTexture,
    distanceFromSun: 44,
    rotationSpeed: 0.002,
    orbitSpeed: 0.015,
  },
  {
    name: 'earth',
    radius: 6,
    texture: earthTexture,
    distanceFromSun: 62,
    rotationSpeed: 0.02,
    orbitSpeed: 0.01,
  },
  {
    name: 'mars',
    radius: 4,
    texture: marsTexture,
    distanceFromSun: 78,
    rotationSpeed: 0.018,
    orbitSpeed: 0.008,
  },
  {
    name: 'jupiter',
    radius: 12,
    texture: jupiterTexture,
    distanceFromSun: 100,
    rotationSpeed: 0.04,
    orbitSpeed: 0.002,
  },
  {
    name: 'saturn',
    radius: 10,
    texture: saturnTexture,
    distanceFromSun: 138,
    rotationSpeed: 0.009,
    orbitSpeed: 0.003,
    ring: {
      innerRadius: 10,
      outerRadius: 20,
      tiltDegrees: 27,
      texture: saturnRingTexture,
    },
  },
  {
    name: 'uranus',
    radius: 7,
    texture: uranusTexture,
    distanceFromSun: 176,
    rotationSpeed: 0.03,
    orbitSpeed: 0.004,
    ring: {
      innerRadius: 7,
      outerRadius: 12,
      tiltDegrees: 98,
      texture: uranusRingTexture,
    },
  },
  {
    name: 'neptune',
    radius: 7,
    texture: neptuneTexture,
    distanceFromSun: 200,
    rotationSpeed: 0.032,
    orbitSpeed: 0.001,
  },
  {
    name: 'pluto',
    radius: 2.8,
    texture: plutoTexture,
    distanceFromSun: 216,
    rotationSpeed: 0.008,
    orbitSpeed: 0.0007,
  },
]

const createPlanet = (radius, texture, distanceFromSun, ring) => {
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshStandardMaterial({ map: loadWithSRGB(texture) })
  )
  planet.position.set(distanceFromSun, 0, 0)
  const pivot = new THREE.Group()
  pivot.add(planet)
  scene.add(pivot)

  if (ring) {
    const ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32),
      new THREE.MeshStandardMaterial({
        map: loadWithSRGB(ring.texture),
        side: THREE.DoubleSide,
      })
    )

    ringMesh.rotation.x = Math.PI / 2
    planet.add(ringMesh)
    planet.rotation.x = THREE.MathUtils.degToRad(ring.tiltDegrees)
  }

  return { planet, pivot }
}

const planets = planetaryData.map((data) => ({
  ...data,
  ...createPlanet(data.radius, data.texture, data.distanceFromSun, data.ring), // Randomizing the initial angle between 0 and 2*PI
}))

const animate = () => {
  sun.rotateY(0.004)

  planets.forEach((p) => {
    p.planet.rotateY(p.rotationSpeed)
    p.pivot.rotateY(p.orbitSpeed)
  })

  composer.render()
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  composer.setSize(newWidth, newHeight)
  smaaPass.setSize(
    newWidth * renderer.getPixelRatio(),
    newHeight * renderer.getPixelRatio()
  )
})
