// 보라 물방울 캐릭터 — Zdog(의사 3D) 일러스트
const TAU = Zdog.TAU
const sceneSize = 40 // 화면의 짧은 변에 들어가는 장면 크기(단위)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const COLOR = {
  body: '#8b5cf6',
  bodyDark: '#7444e6',
  cheek: '#d7a6ff',
  face: '#2b1055',
  shine: '#efe6ff',
  cloud: '#ffffff',
}

const illo = new Zdog.Illustration({
  element: '.illo',
  resize: 'fullscreen',
  dragRotate: false,
  onResize(width, height) {
    this.zoom = Math.min(width, height) / sceneSize
  },
})

// 장면 전체를 살짝 위로 올려 아래쪽에 이름이 들어갈 자리를 만든다
const stage = new Zdog.Anchor({ addTo: illo, translate: { y: -5 } })

// ───────── 물방울 캐릭터 ─────────
const drop = new Zdog.Anchor({ addTo: stage })
const R = 5 // 몸통 반지름

// 몸통(구)
new Zdog.Shape({ addTo: drop, stroke: R * 2, color: COLOR.body })

// 뾰족한 머리(원뿔)
new Zdog.Cone({
  addTo: drop,
  diameter: R * 1.7,
  length: R * 1.37,
  stroke: false,
  color: COLOR.body,
  backface: COLOR.bodyDark,
  translate: { y: -R * 0.526 },
  rotate: { x: TAU / 4 },
})

// 머리 끝을 둥글게
new Zdog.Shape({
  addTo: drop,
  stroke: R * 0.2,
  color: COLOR.body,
  translate: { y: -R * 1.8 },
})

// 반짝임
new Zdog.Shape({
  addTo: drop,
  stroke: R * 0.36,
  color: COLOR.shine,
  translate: { x: -R * 0.4, y: -R * 0.5, z: R * 0.72 },
})

// 볼
;[-1, 1].forEach((side) => {
  new Zdog.Shape({
    addTo: drop,
    stroke: R * 0.4,
    color: COLOR.cheek,
    translate: { x: side * R * 0.5, y: R * 0.24, z: R * 0.8 },
  })
})

// 눈
;[-1, 1].forEach((side) => {
  new Zdog.Shape({
    addTo: drop,
    stroke: R * 0.26,
    color: COLOR.face,
    translate: { x: side * R * 0.34, y: -R * 0.08, z: R * 0.93 },
  })
})

// 입
new Zdog.Shape({
  addTo: drop,
  path: [
    { x: -R * 0.2, y: 0 },
    {
      bezier: [
        { x: -R * 0.12, y: R * 0.2 },
        { x: R * 0.12, y: R * 0.2 },
        { x: R * 0.2, y: 0 },
      ],
    },
  ],
  closed: false,
  stroke: R * 0.13,
  color: COLOR.face,
  translate: { y: R * 0.2, z: R * 0.96 },
})

// ───────── 구름 ─────────
function makeCloud(puffs) {
  const group = new Zdog.Group({ addTo: stage })
  const parts = puffs.map(
    ([x, y, size]) =>
      new Zdog.Shape({
        addTo: group,
        stroke: size,
        color: COLOR.cloud,
        translate: { x, y },
      })
  )
  return { group, parts, baseY: puffs.map((p) => p[1]) }
}

const cloudBack = makeCloud([
  [0, 0, 4.2],
  [2.6, -0.9, 5],
  [5.4, -0.2, 4.4],
  [7.8, 0.5, 3],
  [3.2, 0.9, 4],
])

const cloudFront = makeCloud([
  [0, 0, 3.4],
  [2.4, -0.8, 4.6],
  [5, -0.4, 5],
  [7.6, 0.3, 3.6],
  [4, 0.9, 3.8],
  [9.4, 0.8, 2.4],
])

// ───────── 드래그로 돌려 보기 ─────────
let dragY = 0
let dragStart = 0
new Zdog.Dragger({
  startElement: illo.element,
  onDragStart() {
    dragStart = dragY
  },
  onDragMove(pointer, moveX) {
    const turn = (moveX / Math.min(illo.width, illo.height)) * TAU
    dragY = Math.max(-0.9, Math.min(0.9, dragStart + turn))
  },
  onDragEnd() {
    dragStart = dragY
  },
})

// ───────── 애니메이션 ─────────
const start = Date.now()

function pose(t) {
  // 드래그한 각도는 놓으면 천천히 제자리로 돌아온다
  if (!illo.element.matches(':active')) dragY *= 0.94

  drop.rotate.set({
    y: Math.sin(t / 520) / 2.6 + dragY,
    z: Math.sin(t / 520) / 9,
  })
  drop.translate.y = Math.sin(t / 260) * 0.55

  cloudBack.group.translate.set({
    x: Math.sin(t / 2600) * 2 - 15,
    y: -5.5,
    z: -8,
  })
  cloudFront.group.translate.set({
    x: Math.sin(t / 3400) * 3 + 5,
    y: 6,
    z: 8,
  })
  ;[cloudBack, cloudFront].forEach((cloud) => {
    cloud.parts.forEach((part, i) => {
      part.translate.y = cloud.baseY[i] + Math.sin(t / 700 + i * 1.3) * 0.18
    })
  })
}

function animate() {
  pose(Date.now() - start)
  illo.updateRenderGraph()
  requestAnimationFrame(animate)
}

if (reduceMotion) {
  // 움직임 줄이기 설정이면 정지 화면으로 보여 준다
  pose(0)
  illo.updateRenderGraph()
  window.addEventListener('resize', () => illo.updateRenderGraph())
} else {
  animate()
}
