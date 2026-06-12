import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  DoubleSide,
  MathUtils,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  type Group,
  type Mesh,
  type PointLight,
} from 'three'

export const SHAKE_DURATION_SECONDS = 3
export const LID_OPEN_DURATION_SECONDS = 1.6

function readCssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function createBeeStripePatternTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) return null

  const dark = readCssVar('--bg-base-solid', '#0e0b07')
  const gold = readCssVar('--gold-mid', '#c9963c')
  const whisper = readCssVar('--gold-whisper', '#fff3c4')

  context.fillStyle = dark
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.save()
  context.translate(canvas.width / 2, canvas.height / 2)
  context.rotate(-Math.PI / 5)
  context.translate(-canvas.width / 2, -canvas.height / 2)

  const stripeWidth = 46
  for (let x = -canvas.height; x < canvas.width + canvas.height; x += stripeWidth * 2) {
    context.fillStyle = gold
    context.fillRect(x, 0, stripeWidth, canvas.height)
  }

  context.globalAlpha = 0.35
  context.fillStyle = whisper
  for (
    let x = -canvas.height + stripeWidth / 2;
    x < canvas.width + canvas.height;
    x += stripeWidth * 2
  ) {
    context.fillRect(x, 0, Math.max(4, stripeWidth * 0.12), canvas.height)
  }
  context.globalAlpha = 1
  context.restore()

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(1.3, 1.3)
  return texture
}

function createGroundShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  if (!context) return null

  const brightCenter = context.createRadialGradient(256, 256, 12, 256, 256, 210)
  brightCenter.addColorStop(0, 'rgba(255,242,196,0.72)')
  brightCenter.addColorStop(0.35, 'rgba(233,189,102,0.34)')
  brightCenter.addColorStop(1, 'rgba(233,189,102,0)')
  context.fillStyle = brightCenter
  context.fillRect(0, 0, canvas.width, canvas.height)

  const gradient = context.createRadialGradient(256, 256, 30, 256, 256, 246)
  gradient.addColorStop(0, 'rgba(0,0,0,0.34)')
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.2)')
  gradient.addColorStop(0.78, 'rgba(0,0,0,0.08)')
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new CanvasTexture(canvas)
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  return texture
}

function createLightBeamTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 1024
  const context = canvas.getContext('2d')
  if (!context) return null

  const horizontalFade = context.createLinearGradient(0, 0, canvas.width, 0)
  horizontalFade.addColorStop(0, 'rgba(255,243,196,0)')
  horizontalFade.addColorStop(0.2, 'rgba(255,243,196,0.24)')
  horizontalFade.addColorStop(0.5, 'rgba(255,243,196,0.9)')
  horizontalFade.addColorStop(0.8, 'rgba(255,243,196,0.24)')
  horizontalFade.addColorStop(1, 'rgba(255,243,196,0)')

  const verticalFade = context.createLinearGradient(0, 0, 0, canvas.height)
  verticalFade.addColorStop(0, 'rgba(255,243,196,0)')
  verticalFade.addColorStop(0.18, 'rgba(255,243,196,0.95)')
  verticalFade.addColorStop(0.65, 'rgba(255,243,196,0.4)')
  verticalFade.addColorStop(1, 'rgba(255,243,196,0)')

  context.fillStyle = horizontalFade
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.globalCompositeOperation = 'multiply'
  context.fillStyle = verticalFade
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.globalCompositeOperation = 'source-over'

  const texture = new CanvasTexture(canvas)
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  return texture
}

type RaffleGiftBoxSceneProps = {
  animationRunId: number
}

export default function RaffleGiftBoxScene({ animationRunId }: RaffleGiftBoxSceneProps) {
  const boxGroupRef = useRef<Group>(null)
  const backFlapRef = useRef<Group>(null)
  const frontFlapRef = useRef<Group>(null)
  const leftFlapRef = useRef<Group>(null)
  const rightFlapRef = useRef<Group>(null)
  const innerLightRef = useRef<PointLight>(null)
  const centerBeamRef = useRef<Mesh>(null)
  const leftBeamRef = useRef<Mesh>(null)
  const rightBeamRef = useRef<Mesh>(null)
  const animationStartTimeRef = useRef<number | null>(null)

  const stripePatternTexture = useMemo(() => createBeeStripePatternTexture(), [])
  const groundShadowTexture = useMemo(() => createGroundShadowTexture(), [])
  const beamGradientTexture = useMemo(() => createLightBeamTexture(), [])

  const closedInnerWallColor = useMemo(() => new Color('#2a1d11'), [])
  const closedInnerFloorColor = useMemo(() => new Color('#22180e'), [])
  const openInnerColor = useMemo(() => new Color('#000000'), [])
  const closedInnerEmissive = useMemo(() => new Color('#0f0904'), [])
  const openInnerEmissive = useMemo(() => new Color('#000000'), [])

  const boxShellMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        map: stripePatternTexture ?? null,
        roughness: 0.28,
        metalness: 0.34,
        clearcoat: 0.45,
        clearcoatRoughness: 0.22,
        emissive: new Color(readCssVar('--gold-dark', '#7a5c1e')),
        emissiveIntensity: 0.08,
      }),
    [stripePatternTexture]
  )

  const flapMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: readCssVar('--gold-mid', '#c9963c'),
        roughness: 0.32,
        metalness: 0.38,
        clearcoat: 0.55,
        clearcoatRoughness: 0.18,
      }),
    []
  )

  const innerWallMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: closedInnerWallColor.clone(),
        roughness: 0.9,
        metalness: 0,
        emissive: closedInnerEmissive.clone(),
        emissiveIntensity: 0.16,
      }),
    [closedInnerEmissive, closedInnerWallColor]
  )

  const innerFloorMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: closedInnerFloorColor.clone(),
        roughness: 0.95,
        metalness: 0,
        emissive: closedInnerEmissive.clone(),
        emissiveIntensity: 0.12,
      }),
    [closedInnerEmissive, closedInnerFloorColor]
  )

  useEffect(() => {
    animationStartTimeRef.current = null
  }, [animationRunId])

  useFrame((state) => {
    if (animationStartTimeRef.current === null) {
      animationStartTimeRef.current = state.clock.elapsedTime
    }

    const elapsedSeconds = state.clock.elapsedTime - animationStartTimeRef.current
    const shakeProgress = Math.min(elapsedSeconds / SHAKE_DURATION_SECONDS, 1)

    if (boxGroupRef.current) {
      if (shakeProgress < 1) {
        const damping = 1 - shakeProgress * 0.75
        boxGroupRef.current.position.x = Math.sin(state.clock.elapsedTime * 27) * 0.14 * damping
        boxGroupRef.current.position.z = Math.cos(state.clock.elapsedTime * 21) * 0.12 * damping
        boxGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 16) * 0.08 * damping
        boxGroupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 19) * 0.05 * damping
      } else {
        boxGroupRef.current.position.x = 0
        boxGroupRef.current.position.z = 0
        boxGroupRef.current.rotation.y *= 0.9
        boxGroupRef.current.rotation.z *= 0.85
      }
    }

    const openProgress = MathUtils.clamp(
      (elapsedSeconds - SHAKE_DURATION_SECONDS) / LID_OPEN_DURATION_SECONDS,
      0,
      1
    )
    const easedOpenProgress = MathUtils.smoothstep(openProgress, 0, 1)

    innerWallMaterial.color.lerpColors(closedInnerWallColor, openInnerColor, easedOpenProgress)
    innerFloorMaterial.color.lerpColors(closedInnerFloorColor, openInnerColor, easedOpenProgress)
    innerWallMaterial.emissive.lerpColors(closedInnerEmissive, openInnerEmissive, easedOpenProgress)
    innerFloorMaterial.emissive.lerpColors(
      closedInnerEmissive,
      openInnerEmissive,
      easedOpenProgress
    )
    innerWallMaterial.roughness = 0.86 + easedOpenProgress * 0.12
    innerFloorMaterial.roughness = 0.9 + easedOpenProgress * 0.08

    if (backFlapRef.current) backFlapRef.current.rotation.x = -easedOpenProgress * Math.PI * 0.92
    if (frontFlapRef.current) frontFlapRef.current.rotation.x = easedOpenProgress * Math.PI * 0.92
    if (leftFlapRef.current) leftFlapRef.current.rotation.z = easedOpenProgress * Math.PI * 0.92
    if (rightFlapRef.current) rightFlapRef.current.rotation.z = -easedOpenProgress * Math.PI * 0.92

    if (innerLightRef.current) {
      innerLightRef.current.intensity = 0.25 + easedOpenProgress * 42
      innerLightRef.current.distance = 1.8 + easedOpenProgress * 8.5
      innerLightRef.current.color.set(readCssVar('--gold-whisper', '#fff3c4'))
    }

    const animateBeam = (beamMesh: Mesh | null, baseX: number) => {
      if (!beamMesh) return
      const beamMaterial = beamMesh.material as MeshBasicMaterial
      beamMesh.position.set(baseX, 2 + easedOpenProgress * 0.9, 0)
      beamMesh.scale.set(1 + easedOpenProgress * 0.9, 1 + easedOpenProgress * 2.2, 1)
      beamMaterial.opacity = 0.01 + easedOpenProgress * 0.18
    }

    animateBeam(centerBeamRef.current, 0)
    animateBeam(leftBeamRef.current, 0)
    animateBeam(rightBeamRef.current, 0)
  })

  return (
    <>
      <ambientLight intensity={0.82} />
      <spotLight
        castShadow
        position={[4.8, 8, 4.2]}
        angle={0.5}
        intensity={2.8}
        penumbra={0.45}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight
        position={[-3.2, 3.4, 2.8]}
        intensity={1.15}
        color={readCssVar('--gold-mid', '#c9963c')}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color={readCssVar('--bg-base-solid', '#0e0b07')} roughness={0.95} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.148, 0.55]}>
        <planeGeometry args={[10.5, 7.4]} />
        <meshBasicMaterial
          map={groundShadowTexture ?? null}
          transparent
          opacity={0.72}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <group ref={boxGroupRef} position={[0, -0.32, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.2, 2.1, 3.2]} />
          <primitive object={boxShellMaterial} attach="material" />
        </mesh>

        <mesh position={[0, -0.94, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2.98, 2.98]} />
          <primitive object={innerFloorMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.055, -1.49]} receiveShadow>
          <planeGeometry args={[2.98, 1.99]} />
          <primitive object={innerWallMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0.055, 1.49]} rotation={[0, Math.PI, 0]} receiveShadow>
          <planeGeometry args={[2.98, 1.99]} />
          <primitive object={innerWallMaterial} attach="material" />
        </mesh>
        <mesh position={[-1.49, 0.055, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[2.98, 1.99]} />
          <primitive object={innerWallMaterial} attach="material" />
        </mesh>
        <mesh position={[1.49, 0.055, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[2.98, 1.99]} />
          <primitive object={innerWallMaterial} attach="material" />
        </mesh>

        <mesh ref={centerBeamRef} position={[0, 2, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[2.2, 5.2]} />
          <meshBasicMaterial
            map={beamGradientTexture ?? null}
            transparent
            opacity={0.01}
            side={DoubleSide}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
        <mesh ref={leftBeamRef} position={[0, 2, 0]} rotation={[0, Math.PI / 3.4, 0]}>
          <planeGeometry args={[2.2, 5.2]} />
          <meshBasicMaterial
            map={beamGradientTexture ?? null}
            transparent
            opacity={0.01}
            side={DoubleSide}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
        <mesh ref={rightBeamRef} position={[0, 2, 0]} rotation={[0, -Math.PI / 3.4, 0]}>
          <planeGeometry args={[2.2, 5.2]} />
          <meshBasicMaterial
            map={beamGradientTexture ?? null}
            transparent
            opacity={0.01}
            side={DoubleSide}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>

        <group ref={backFlapRef} position={[0, 1.2, -1.62]}>
          <mesh castShadow position={[0, 0, 0.8]}>
            <boxGeometry args={[3.28, 0.13, 1.62]} />
            <primitive object={flapMaterial} attach="material" />
          </mesh>
        </group>

        <group ref={frontFlapRef} position={[0, 1.2, 1.62]}>
          <mesh castShadow position={[0, 0, -0.8]}>
            <boxGeometry args={[3.28, 0.13, 1.62]} />
            <primitive object={flapMaterial} attach="material" />
          </mesh>
        </group>

        <group ref={leftFlapRef} position={[-1.62, 1.2, 0]}>
          <mesh castShadow position={[0.8, 0, 0]}>
            <boxGeometry args={[1.62, 0.13, 3.28]} />
            <primitive object={flapMaterial} attach="material" />
          </mesh>
        </group>

        <group ref={rightFlapRef} position={[1.62, 1.2, 0]}>
          <mesh castShadow position={[-0.8, 0, 0]}>
            <boxGeometry args={[1.62, 0.13, 3.28]} />
            <primitive object={flapMaterial} attach="material" />
          </mesh>
        </group>
      </group>
    </>
  )
}
