import { AtpAgent } from '@atproto/api'
import { CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas'
import { useRuntimeConfig } from '#imports'
import { SVGPathData } from 'svg-pathdata'
import { join, resolve } from 'pathe'
import sharp from 'sharp'
import { readFile } from 'fs/promises'
import SHAPES from '~/assets/types/shapes.enum'
import { existsSync } from 'fs'

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { background = '#000', shape, eyes, mouth, color, rotation } = body

  if ( !shape || !eyes || !mouth || !color || typeof rotation !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'Missing or invalid avatar parameters' })
  }

  function drawSvgPath(ctx: CanvasRenderingContext2D, pathData: string) {
    const commands = new SVGPathData(pathData).toAbs().commands
  
    ctx.beginPath()

    let currentX = 0;
    let currentY = 0;
  
    for (const cmd of commands) {
      switch (cmd.type) {
        case SVGPathData.MOVE_TO:
          currentX = cmd.x;
          currentY = cmd.y;
          ctx.moveTo(cmd.x, cmd.y);
          break;
        case SVGPathData.LINE_TO:
          currentX = cmd.x;
          currentY = cmd.y;
          ctx.lineTo(cmd.x, cmd.y);
          break;
        case SVGPathData.VERT_LINE_TO:
          currentY = cmd.y;
          ctx.lineTo(currentX, currentY);
          break;
        case SVGPathData.HORIZ_LINE_TO:
          currentX = cmd.x;
          ctx.lineTo(currentX, currentY);
          break;
        case SVGPathData.CURVE_TO:
          currentX = cmd.x!;
          currentY = cmd.y!;
          ctx.bezierCurveTo(cmd.x1!, cmd.y1!, cmd.x2!, cmd.y2!, cmd.x!, cmd.y!);
          break;
        case SVGPathData.QUAD_TO:
          currentX = cmd.x!;
          currentY = cmd.y!;
          ctx.quadraticCurveTo(cmd.x1!, cmd.y1!, cmd.x!, cmd.y!);
          break;
        case SVGPathData.CLOSE_PATH:
          ctx.closePath();
          break;
        default:
          console.warn(`Unsupported command type ${cmd.type}`, cmd);
      }
    }
  
    ctx.fill()
  }

  // 0. Params validation
  if (
    !(background == '#000' || background == '#ccc') ||
    typeof shape !== 'string' ||
    typeof eyes !== 'string' ||
    typeof mouth !== 'string' ||
    typeof color !== 'string' ||
    !/^#[0-9A-Fa-f]{6}$/.test(color) || // hex color
    typeof rotation !== 'number' ||
    rotation < 0 || rotation >= 360
  ) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input format' })
  }

  if (!Object.values(SHAPES).includes(shape as SHAPES)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid shape' })
  }

  // Eyes
  const eyesPath = join(resolve('assets/images/eyes'), `${eyes}.svg`)
  if (!existsSync(eyesPath)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid eyes' })
  }
  // Mouth
  const mouthPath = join(resolve('assets/images/mouth'), `${mouth}.svg`)
  if (!existsSync(mouthPath)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mouth' })
  }

  // 1. Bluesky Connect 
  const config = useRuntimeConfig()

  const agent = new AtpAgent({ service: 'https://bsky.social' })
  await agent.login({
    identifier: config.BSKY_IDENTIFIER!,
    password: config.BSKY_PASSWORD!,
  })

  // 1.1 Cooldown check
  const profileRes = await agent.app.bsky.actor.getProfile({ actor: config.BSKY_IDENTIFIER });
  const indexedAt = profileRes.data.indexedAt;

  if (indexedAt) {
    const lastUpdate = new Date(indexedAt).getTime();
    const now = Date.now();

    if (now - lastUpdate < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - lastUpdate)) / 1000);
      throw createError({
        statusCode: 429,
        statusMessage: `Please wait ${remaining} seconds before updating your avatar again.`,
        data: { secondsRemaining: remaining }
      });
    }
  }

  

  // 2. Canvas creation
  const canvas = createCanvas(512, 512)
  const ctx = canvas.getContext('2d')

  // Black background
  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.translate(256, 256)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-256, -256)

  ctx.fillStyle = color
  drawSvgPath(ctx, shape)

  ctx.translate(256, 256)
  ctx.rotate((-rotation * Math.PI) / 180)
  ctx.translate(-256, -256)

  // Face offset
  const intensity = 20
  const angleRad = (rotation * Math.PI) / 180
  const offsetX = -Math.sin(angleRad) * intensity
  const offsetY = Math.cos(angleRad) * intensity
  ctx.translate(offsetX, offsetY)

  // Eyes
  if (eyes) {
    const svgEyesBuffer = await readFile(resolve('assets/images/eyes', `${eyes}.svg`))
    const pngEyesBuffer = await sharp(svgEyesBuffer).png().toBuffer()
    const eyesImage = await loadImage(pngEyesBuffer)
    const scale = 1.2
    const x = 0
    const y = 0
    const w = 512
    const h = 512

    ctx.save()
    ctx.translate(x + w / 2, y + h / 2) // centre
    ctx.scale(scale, scale)
    ctx.drawImage(eyesImage, -w / 2, -h / 2, w, h)
    ctx.restore()
  }

  // Mouth
  if (mouth) {
    const svgMouthBuffer = await readFile(resolve('assets/images/mouth', `${mouth}.svg`))
    const pngMouthBuffer = await sharp(svgMouthBuffer).png().toBuffer()
    const mouthImage = await loadImage(pngMouthBuffer)
    
    const scale = 1.2
    const x = 0
    const y = 0
    const w = 512
    const h = 512

    ctx.save()
    ctx.translate(x + w / 2, y + h / 2) // centre
    ctx.scale(scale, scale)
    ctx.drawImage(mouthImage, -w / 2, -h / 2, w, h)
    ctx.restore()
  }

  ctx.translate(-offsetX, -offsetY)

  ctx.restore()

  // 3. PNG conversion
  const buffer = canvas.toBuffer('image/png')


  // 4. Image upload
  const { data: blob } = await agent.uploadBlob(buffer, {
    encoding: 'image/png',
  })

  // 5. Profile update
  await agent.upsertProfile(existing => {
    const profile = existing ?? {
      avatar: undefined,
    }
    profile.avatar = blob.blob
    return profile
  })

  // 6. Add in archive
  await agent.com.atproto.repo.createRecord({
    repo: agent.did ?? '',
    collection: 'net.nornoe.avatarArchive',
    record: {
      createdAt: new Date().toISOString(),
      blob: {
        mimeType: 'image/png',
        ref: blob.blob,
      },
      meta: {
        background,
        shape,
        eyes,
        mouth,
        color,
        rotation,
      }
    }
  })
  

  // 7. Return image
  event.node.res.setHeader('Content-Type', 'image/png')
  event.node.res.end(buffer)
})
