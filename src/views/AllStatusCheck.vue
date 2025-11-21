<template>
  <div class="three-wrapper">
    <canvas id="three-canvas"></canvas>

    <!-- 압력기준 / 콤프실 / 공장 상태 -->
    <div class="top-left-row">
      <StandardTable />
      <CompressorStatus />
      <FactoryStatus />
    </div>

    <!-- 딤드 배경 + 슬라이드 패널 -->
    <div v-if="showPanel" class="overlay" @click.self="closePanel" >
      <transition name="slide">
        <div class="slide-panel" @click.stop>
          <v-card flat class="panel-card">
            <!-- 상단 제목 -->
            <v-card-title class="panel-title d-flex justify-space-between align-center">
              <div class="text-h6 d-flex align-center font-weight-bold">
                <v-icon class="me-2">mdi-cursor-default-click-outline</v-icon>
                컨트롤 밸브 제어
              </div>
              <v-btn icon @click="closePanel" size="small" variant="text">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-divider />

            <!-- 밸브 제어 -->
            <v-card-text class="pt-5">
              <v-card elevation="3" class="" style="background-color: #454675;">
                <v-card-text>
                  <ValveControlPanel :factory-id="selectedFactoryId" />
                </v-card-text>
              </v-card>
            </v-card-text>

          </v-card>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { watch } from 'vue'
import { useSSEStore } from '@/stores/sseStore'
import { storeToRefs } from 'pinia'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import StandardTable from "@/components/StandardTable.vue";
import CompressorStatus from '@/components/CompressorStatus.vue'
import FactoryStatus from '@/components/FactoryStatus.vue'
import ValveControlPanel from "@/components/ValveControlPanel.vue";

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let drawerFlag = true;

export default {
  name: 'AllStatusCheck',
  components: {
    StandardTable,
    CompressorStatus,
    FactoryStatus,
    ValveControlPanel,
  },
  props: {
    drawerOpen: {
      type: Boolean,
      default: true,
    },
  },
  watch: {
    drawerOpen(newVal) {
      //console.log('🔄 부모에서 drawer 상태 변경됨:', newVal)

      // 1) Fullscreen API 제어
      if (!newVal) {
        // drawer 닫힘 → 전체화면 진입
        document.documentElement.requestFullscreen?.().catch(() => {})
      } else {
        // drawer 열림 → 전체화면 종료
        document.exitFullscreen?.().catch(() => {})
      }

      // 2) 캔버스 크기 재조정
      drawerFlag = newVal
      this.handleResize()
    }
  },
  data() {
    return {
      renderer: null,
      scene: null,
      camera: null,
      originalMaterials: new Map(),
      clickableObjects: [],

      showPanel: false,
      selectedFactoryId: '',
    }
  },
  mounted() {

    this.init()

    // 압력 변화 감지 후 AirPipe 색상 변경
    const { compPressure } = storeToRefs(useSSEStore())

    watch(compPressure, (val) => {
      const pressure1C = parseFloat(val['1C'] ?? '0')
      const pressure3C = parseFloat(val['3C'] ?? '0')

      if (pressure1C <= 7.5 || pressure3C <= 7.5) {
        this.updateAirPipeColor('#0000ff') // 파란색
      } else {
        this.updateAirPipeColor('#aaaaaa') // 기본 회색 등 원래 색
      }
    }, { deep: true })
  },
  methods: {
    updateAirPipeColor(colorHex) {
      const airPipeObj = this.clickableObjects.find(obj => obj.name === 'AirPipe')
      if (!airPipeObj) return

      airPipeObj.traverse(child => {
        if (child.isMesh && child.material) {
          const newMat = child.material.clone()
          newMat.color.set(colorHex)
          child.material = newMat
        }
      })
    },
    init() {

      const canvas = document.querySelector('#three-canvas')
      const renderer = new THREE.WebGLRenderer({canvas, antialias: true})
      renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.92)
      renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1)

      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#FFFFFF')

      // 배경 이미지
      const loader = new THREE.TextureLoader()
      loader.load('/images/blue-sky.jpg', texture => {
        scene.background = texture
      })

      // 카메라
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.set(0, 25, 76)
      camera.aspect = (window.innerWidth * 0.9) / window.innerHeight
      scene.add(camera)

      // 조명
      scene.add(new THREE.AmbientLight('white', 1))
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(1, 0, 2)
      scene.add(directionalLight)

      // 모델링
      const gltfLoader = new GLTFLoader()
      gltfLoader.load('/models/HD-factory.glb', gltf => {
        const root = gltf.scene
        const names = ['etc-factory', '1B-factory', '2B-factory', 'AirPipe']

        // label-* : 21개 담기
        root.traverse(child => {
          if (child.name.startsWith('label-')) {
            names.push(child.name)
          }
        })

        // 최종 리스트로 씬에 추가 및 클릭 가능 오브젝트 등록
        names.forEach(name => {
          const obj = root.getObjectByName(name)
          if (!obj) return;

          scene.add(obj)
          if (name !== 'etc-factory') {
            this.clickableObjects.push(obj)
          }
        })

        // 라벨 카메라 기준 회전하기
        this.labelObjects = this.clickableObjects.filter(o => o.name.startsWith('label-'))
      })

      // GridHelper 바닥
      const grid = new THREE.GridHelper(1500, 150, '#222242', '#7F80A8')
      grid.rotation.x = THREE.MathUtils.degToRad(-180);
      grid.position.y = -1
      scene.add(grid)

      // 바닥 생성
      const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(1500, 1500),
          new THREE.MeshBasicMaterial({
            map: this.createPeachyFloorTexture()
          })
      )
      floor.rotation.x = -Math.PI / 2
      floor.receiveShadow = true
      floor.position.y = -1.1;
      scene.add(floor)


      // 마우스 컨트롤
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.maxDistance = 82
      controls.minDistance = 40
      controls.minPolarAngle = THREE.MathUtils.degToRad(20)
      controls.maxPolarAngle = THREE.MathUtils.degToRad(70)

      controls.rotateSpeed = 0.1; // 마우스 회전 속도 조절
      controls.autoRotate = false; // 회전 여부
      controls.enableDamping = false;

      // 1. 왕복 회전 값 정의
      const minAz = THREE.MathUtils.degToRad(-20);
      const maxAz = THREE.MathUtils.degToRad( 20);
      const speed = 0.0005; // 조절: 클수록 빨라짐
      let dir = 1; // 1: 시계, -1: 반시계

      // 2. 자동 재시작 로직을 위한 플래그 & 타이머
      let autoEnabled = true // 자동 왕복 실행 여부
      let idleTimer   = null
      const idleDelay = 10000 // 10초

      // 3. 마우스 조작 시작 시 : 자동 왕복 중지
      controls.addEventListener('start', () => {
        autoEnabled = false
        if (idleTimer) {
          clearTimeout(idleTimer)
          idleTimer = null
        }
      })

      // 4. 마우스 조작 끝난 후 : 10초 후에 자동 왕복 재시작
      controls.addEventListener('end', () => {
        if (idleTimer) clearTimeout(idleTimer)
        idleTimer = setTimeout(() => {
          autoEnabled = true
        }, idleDelay)
      })

      // 애니메이션 루프 등록
      renderer.setAnimationLoop((time) => {

        controls.update();

        // 바닥의 중심을 항상 카메라 바로 아래(XZ 평면)로 이동
        // floor.position.x = camera.position.x;
        // floor.position.z = camera.position.z;

        // 자동 좌우 회전 여부
        if (autoEnabled) {
          const offset = new THREE.Vector3().copy(camera.position).sub(controls.target); // 카메라⇆타겟 오프셋 벡터
          const sph = new THREE.Spherical().setFromVector3(offset); // 구면좌표 변환
          const nextTheta = THREE.MathUtils.clamp( sph.theta + speed * dir, minAz, maxAz ); // θ 업데이트 + 클램프

          // 경계에 닿으면 방향 전환
          if (nextTheta === maxAz || nextTheta === minAz) dir *= -1;
          sph.theta = nextTheta;

          offset.setFromSpherical(sph); // 다시 Cartesian 좌표로
          camera.position.copy(controls.target).add(offset); // 카메라 위치 적용
        }

        renderer.render(scene, camera);
      });


      this.renderer = renderer
      this.scene = scene
      this.camera = camera

      canvas.addEventListener('click', this.handleClick)

      // resize 핸들러 등록
      // window.addEventListener('resize', this.handleResize)
      // this.handleResize()
    },
    // 바닥 생성
    createPeachyFloorTexture() {
      const canvas = document.createElement('canvas')
      canvas.width = 1028
      canvas.height = 1028
      const ctx = canvas.getContext('2d')

      // 부드러운 라디얼 그라디언트 (중심이 밝고 가장자리가 약간 어두운 톤)
      const gradient = ctx.createRadialGradient(
          canvas.width * 0.5, canvas.height * 0.5, 300,
          canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.8
      )
      gradient.addColorStop(0, '#d0d0d0')   // 중심: 밝은 시멘트 느낌
      gradient.addColorStop(0.5, '#a0a0a0') // 중간: 도시 회색 바닥
      gradient.addColorStop(1, '#555555')   // 외곽: 어두운 아스팔트

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const texture = new THREE.CanvasTexture(canvas)
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter

      return texture
    },
    // 슬라이드: 1B, 2B 공장 컨트롤
    handleClick(event) {
      const canvas = this.renderer.domElement
      const rect = canvas.getBoundingClientRect()

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, this.camera)
      const intersects = raycaster.intersectObjects(this.clickableObjects, true)

      if (intersects.length === 0) return

      const clickedMesh = intersects[0].object
      const parentObject = this.clickableObjects.find(obj => obj === clickedMesh || obj.getObjectById(clickedMesh.id))

      if (!parentObject) return

      parentObject.traverse(child => {
        if (child.isMesh && child.material) {
          const newMat = child.material.clone()
          if (parentObject.name === '1B-factory') {
            newMat.color.set('#ff0000')
            this.selectedFactoryId = '1B'
            this.showPanel = true
          }
          else if (parentObject.name === '2B-factory') {
            newMat.color.set('#ff0000')
            this.selectedFactoryId = '2B'
            this.showPanel = true
          }
          /*else if (parentObject.name === 'AirPipe') {
            newMat.color.set('#0000ff')
          }*/
          child.material = newMat
        }
      })

      if (['1B-factory', '2B-factory'].includes(parentObject.name)) {
        this.selectedFactoryId = parentObject.name.replace('-factory', '')
        this.showPanel = true
      }

    },
    // 슬라이드 닫기
    closePanel() {
      this.showPanel = false
      const targets = ['1B-factory', '2B-factory']
      this.clickableObjects.forEach(obj => {
        if (targets.includes(obj.name)) {
          obj.traverse(child => {
            if (child.isMesh && child.material) {
              child.material.color.set('#ffffff')
            }
          })
        }
      })
    },
    handleResize() {
      let width, height

      if (drawerFlag) {
        // drawer 열림: 일반화면
        width  = window.innerWidth * 0.9
        height = window.innerHeight * 0.92
        // width  = 1672
        // height = 882
      } else {
        // drawer 닫힘: 전체화면
        width  = window.innerWidth * 1.05
        height = window.innerHeight * 1.12
        // width  = 1905
        // height = 1080
      }

      // console.log(`🖥 resize → ${drawerFlag ? '일반' : '전체'}화면`, width, height)

      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    }
  },
}
</script>

<style scoped>
.three-wrapper {
  position: relative;
  width: 100%;
  height: 90vh; /* ✅ v-main과 동일한 높이로 유지 */
}

#three-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  cursor: -webkit-grab;
}

#three-canvas:active {
  cursor: grabbing;
  cursor: -webkit-grabbing;
}
.top-left-row {
  position: absolute;
  top: 16px;
  left: 10px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  z-index: 10;
}

/* ✅ 패널 등장 시 디버 배경 (v-main 위에 고정) */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 102%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 20;
  display: flex;
  justify-content: flex-end;
}

.slide-panel {
  width: 360px;
  height: 100%;
  background-color: #222242;
  color: white;
  padding: 0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.4);
  z-index: 21;
}

.panel-card {
  height: 100%;
  background-color: #37385F;
  color: white;
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 18px;
  font-weight: bold;
  background-color: #222242;
  color: white;
  padding: 16px;
}

.custom-table td {
  border-bottom: 1px solid #ccc;
  padding: 5px 5px !important;
  vertical-align: middle;
}

.custom-table tr:last-child td {
  border-bottom: none;
}

</style>

