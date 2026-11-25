import { useEffect, useId, useRef, type RefObject } from 'react';
import dayImage from './assets/aquarium-day.webp';
import anthiasPink from './assets/aquarium-fish-anthias-pink.webp';
import blueTang from './assets/aquarium-fish-blue-tang.webp';
import butterflyfish from './assets/aquarium-fish-butterflyfish-redrawn.png';
import cardinalfish from './assets/aquarium-fish-cardinalfish.webp';
import chromis from './assets/aquarium-fish-chromis.webp';
import clownfish from './assets/aquarium-fish-clownfish.webp';
import damselfish from './assets/aquarium-fish-damselfish.webp';
import wrasse from './assets/aquarium-fish-wrasse.webp';
import yellowGoby from './assets/aquarium-fish-yellow-goby.webp';
import yellowTang from './assets/aquarium-fish-yellow-tang.webp';
import nightImage from './assets/aquarium-night.webp';
import { onWallpaperBlank } from './pointerScope';
import { coverFit, lcg, sceneHeight as H, sceneWidth as W, useCoverFit, useSceneState } from './useSceneState';

/*
 * 水族馆「深海秘境」：白天 / 深夜两张手绘海底画作，叠加水面透下的光柱与辉光，Canvas 上画 18 条逐帧摆尾的鱼
 * （远景小、近景大，按深度排序）、两侧上升的气泡与悬浮微粒；鱼会躲开指针，点击空白处惊散附近的鱼并冒出一串气泡。
 * 移植自参考壁纸 aquarium_wallpaper_v9_perspective.html（默认 18 条鱼、自然速度），去掉了工具栏与快捷键，
 * 昼夜跟随桌面主题；点击气泡是本组件新增的交互。
 */

type Species =
  | 'cardinalfish'
  | 'chromis'
  | 'anthias_pink'
  | 'damselfish'
  | 'blue_tang'
  | 'yellow_tang'
  | 'wrasse'
  | 'butterflyfish'
  | 'yellow_goby'
  | 'clownfish';

/** 每种鱼一张 10 帧摆尾的横向图集；旧图集单帧为 290 × 268。 */
const atlas: Record<Species, string> = {
  cardinalfish,
  chromis,
  anthias_pink: anthiasPink,
  damselfish,
  blue_tang: blueTang,
  yellow_tang: yellowTang,
  wrasse,
  butterflyfish,
  yellow_goby: yellowGoby,
  clownfish,
};
const frames = 10;
const cellW = 290;
const cellH = 268;
/** 图集里蓝倒吊头朝左，其余都朝右。 */
const facing = (type: Species) => (type === 'blue_tang' ? -1 : 1);

interface Fish {
  type: Species;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  moveSpeed: number;
  goalX: number;
  goalY: number;
  flip: number;
  phase: number;
  freq: number;
  tailPhase: number;
  /** 0 远景、1 中景、2 近景。 */
  depth: 0 | 1 | 2;
  limitY: number;
  scared: number;
  pitch: number;
}

interface Bubble {
  lane: number;
  x: number;
  y: number;
  r: number;
  v: number;
  phase: number;
  drift: number;
  alpha: number;
}

/** 点击冒出的一次性气泡，升到 top 后淡出移除。 */
interface Burst extends Omit<Bubble, 'lane'> {
  top: number;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
}

interface World {
  fish: Fish[];
  /** 绘制顺序：先远后近，同层先小后大。 */
  order: Fish[];
  bubbles: Bubble[];
  bursts: Burst[];
  motes: Mote[];
  runtime: number;
}

interface Pointer {
  inside: boolean;
  x: number;
  y: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const random = (min: number, max: number) => min + Math.random() * (max - min);
const bubbleLanes = [170, 285, 424, 1272, 1410, 1505];

/** 初始布局用固定种子，静止画面每次相同；之后的游动目标才用 Math.random。 */
function createWorld(): World {
  const rnd = lcg(52091);
  const rand = (min: number, max: number) => min + rnd() * (max - min);
  const fish: Fish[] = [];
  const add = (type: Species, depth: 0 | 1 | 2, size: number, x: number, y: number, speed: number) => {
    const sign = rnd() > 0.5 ? 1 : -1;
    const far = depth === 0;
    const limitY = far ? 520 : depth === 2 ? 800 : 700;
    fish.push({
      type,
      size,
      x,
      y,
      vx: sign * speed,
      vy: rand(-5, 5),
      moveSpeed: speed,
      goalX: clamp(x + sign * rand(far ? 220 : 300, far ? 520 : 760), 80, W - 80),
      goalY: clamp(y + rand(far ? -90 : -140, far ? 90 : 140), 95, limitY),
      flip: sign * facing(type),
      phase: rand(0, 10),
      freq: rand(0.75, 1.35),
      tailPhase: rand(0, 10),
      depth,
      limitY,
      scared: 0,
      pitch: 0,
    });
  };
  // 远景：数量多、体型明显更小，游在上半部。
  for (const type of ['cardinalfish', 'chromis', 'anthias_pink', 'damselfish'] as const) {
    for (let i = 0; i < 2; i++) {
      const n = fish.length;
      const x = clamp(180 + (n % 6) * 230 + rand(-120, 120), 95, W - 95);
      const y = clamp(165 + (Math.floor(n / 3) % 3) * 95 + rand(-35, 35), 110, 430);
      add(type, 0, rand(0.22, 0.4), x, y, rand(24, 42));
    }
  }
  // 中景。
  for (const type of ['blue_tang', 'yellow_tang', 'wrasse', 'butterflyfish', 'yellow_goby'] as const) {
    for (let i = 0; i < (type === 'wrasse' ? 1 : 2); i++) {
      const n = fish.length;
      const x = clamp(160 + (n % 5) * 300 + rand(-110, 110), 105, W - 105);
      const y = clamp(300 + (Math.floor(n / 4) % 3) * 115 + rand(-45, 45), 240, 610);
      add(type, 1, rand(0.4, 0.66), x, y, rand(24, 40));
    }
  }
  // 近景：一条大个的小丑鱼游在下半部。
  const near = fish.length;
  const nearX = clamp(220 + (near % 4) * 340 + rand(-120, 120), 120, W - 120);
  const nearY = clamp(500 + (Math.floor(near / 2) % 2) * 135 + rand(-35, 35), 480, 780);
  add('clownfish', 2, rand(0.68, 0.96), nearX, nearY, rand(20, 34));
  const bubbles: Bubble[] = Array.from({ length: 55 }, (_, i) => {
    const lane = bubbleLanes[i % bubbleLanes.length]!;
    return {
      lane,
      x: lane + rand(-45, 45),
      y: rand(-60, H + 70),
      r: rand(2, 9),
      v: rand(19, 53),
      phase: rand(0, 6.28),
      drift: rand(4, 17),
      alpha: rand(0.2, 0.57),
    };
  });
  const motes: Mote[] = Array.from({ length: 72 }, () => ({
    x: rand(0, W),
    y: rand(0, H),
    r: rand(0.4, 1.6),
    a: rand(0.08, 0.3),
    phase: rand(0, 7),
  }));
  const order = [...fish].sort((a, b) => a.depth - b.depth || a.size - b.size);
  return { fish, order, bubbles, bursts: [], motes, runtime: 0 };
}

function newGoal(f: Fish, forced?: number) {
  const dir = forced || (Math.random() > 0.5 ? 1 : -1);
  const minDist = f.depth === 0 ? 180 : f.depth === 2 ? 320 : 260;
  const maxDist = f.depth === 0 ? 460 : f.depth === 2 ? 760 : 620;
  f.goalX = clamp(f.x + dir * random(minDist, maxDist), 80, W - 80);
  if (Math.abs(f.goalX - f.x) < 140) f.goalX = clamp(f.x - dir * random(minDist * 0.8, maxDist * 0.92), 80, W - 80);
  const yShift = f.depth === 0 ? 90 : f.depth === 2 ? 170 : 130;
  f.goalY = clamp(f.y + random(-yShift, yShift), 95, f.limitY);
}

/** 指针附近的避让半径：近景鱼更早察觉。 */
const reach = (f: Fish) => (f.depth === 0 ? 120 : f.depth === 2 ? 185 : 155) + f.size * 90;

function moveFish(f: Fish, dt: number, pointer: Pointer) {
  const dx = f.goalX - f.x;
  const dy = f.goalY - f.y;
  const dist = Math.hypot(dx, dy) || 1;
  if (dist < 95) newGoal(f);
  let wishX = (dx / dist) * f.moveSpeed;
  let wishY = (dy / dist) * f.moveSpeed;
  if (pointer.inside) {
    const px = f.x - pointer.x;
    const py = f.y - pointer.y;
    const d = Math.hypot(px, py) || 1;
    const radius = reach(f);
    if (d < radius) {
      const strength = Math.pow(1 - d / radius, 1.15) * f.moveSpeed * 3.8;
      wishX += (px / d) * strength;
      wishY += (py / d) * strength;
      f.scared = Math.min(1, f.scared + dt * 3.3);
      if (d < 85) newGoal(f, px >= 0 ? 1 : -1);
    }
  }
  f.scared = Math.max(0, f.scared - dt * 0.45);
  // 速度向量同时决定位移与朝向，逐渐转向。
  const steer = Math.min(1, dt * (f.scared ? 4.4 : 1.6));
  f.vx += (wishX - f.vx) * steer;
  f.vy += (wishY - f.vy) * steer;
  if (f.x < 90 && f.vx < 0) f.vx += (90 - f.x) * dt * 5;
  if (f.x > W - 90 && f.vx > 0) f.vx -= (f.x - (W - 90)) * dt * 5;
  if (f.y < 105 && f.vy < 0) f.vy += (105 - f.y) * dt * 4;
  if (f.y > f.limitY && f.vy > 0) f.vy -= (f.y - f.limitY) * dt * 4;
  const prevX = f.x;
  const prevY = f.y;
  f.x = clamp(f.x + f.vx * dt, 32, W - 32);
  f.y = clamp(f.y + f.vy * dt, 50, H - 50);
  if (f.x < 55 || f.x > W - 55 || f.y < 70 || f.y > f.limitY + 30) newGoal(f);
  // 只有横向速度真正反向时才翻转图集。
  let sign = Math.sign(f.vx);
  if (Math.abs(f.vx) < 6) sign = Math.sign(f.flip * facing(f.type)) || 1;
  const required = sign * facing(f.type);
  f.flip += (required - f.flip) * Math.min(1, dt * 7.5);
  // 掉头时原地转身，转完再游，不会倒着游。
  if (Math.sign(f.flip) !== required && Math.abs(f.vx) > 6) {
    f.x = prevX;
    f.y = prevY;
  }
  // 抬头 / 低头跟随行进方向。
  f.pitch = clamp(Math.atan2(f.vy, Math.abs(f.vx) + 10) * (sign === 1 ? 1 : -1), -0.24, 0.24);
}

let spriteCache: Map<Species, HTMLImageElement> | undefined;

function sprites(doc: Document) {
  if (spriteCache) return spriteCache;
  spriteCache = new Map();
  for (const [type, src] of Object.entries(atlas) as [Species, string][]) {
    const image = doc.createElement('img');
    image.decoding = 'async';
    image.src = src;
    spriteCache.set(type, image);
  }
  return spriteCache;
}

/** Canvas 层：鱼、气泡与微粒，约 45 帧；不播放时画一帧静止画面。 */
function useAquarium(
  root: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  play: boolean,
  night: boolean,
  density: number,
) {
  const worldRef = useRef<World | null>(null);

  useEffect(() => {
    const scene = root.current;
    const canvas = canvasRef.current;
    const view = canvas?.ownerDocument.defaultView;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!scene || !canvas || !view || !context || !density) return;
    const world = (worldRef.current ??= createWorld());
    const images = sprites(canvas.ownerDocument);
    const pointer: Pointer = { inside: false, x: W / 2, y: H / 2 };
    canvas.width = Math.round(W * density);
    canvas.height = Math.round(H * density);
    let frame = 0;
    let lastTime = 0;
    let lastRendered = 0;

    const drawFish = (f: Fish) => {
      const image = images.get(f.type);
      if (!image?.complete || !image.naturalWidth) return;
      const cell = Math.floor(((world.runtime * f.freq + f.tailPhase) % 1) * frames) % frames;
      const bob = Math.sin(world.runtime * 1.8 + f.phase) * 2.2;
      const isRedrawnButterflyfish = f.type === 'butterflyfish';
      const sourceCellW = isRedrawnButterflyfish ? image.naturalWidth / frames : cellW;
      // 新图集留有上下透明留白，按鱼体所在区域裁切，避免压扁主体。
      const sourceY = isRedrawnButterflyfish ? image.naturalHeight * 0.4 : 0;
      const sourceH = isRedrawnButterflyfish ? image.naturalHeight * 0.21 : cellH;
      const drawW = isRedrawnButterflyfish ? 250 : cellW;
      const drawH = isRedrawnButterflyfish ? 210 : cellH;
      context.save();
      context.translate(f.x, f.y + bob);
      context.rotate(f.pitch);
      context.scale(f.size * f.flip, f.size);
      context.drawImage(image, cell * sourceCellW, sourceY, sourceCellW, sourceH, -drawW / 2, -drawH / 2, drawW, drawH);
      context.restore();
    };
    const drawBubble = (x: number, y: number, r: number, alpha: number) => {
      const gradient = context.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.1, x, y, r * 1.12);
      gradient.addColorStop(0, 'rgba(255,255,255,.48)');
      gradient.addColorStop(0.55, night ? 'rgba(125,169,255,.08)' : 'rgba(193,246,255,.07)');
      gradient.addColorStop(0.9, night ? `rgba(153,199,255,${alpha * 0.7})` : `rgba(215,254,255,${alpha * 0.7})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = `rgba(243,255,255,${alpha * 0.52})`;
      context.lineWidth = 0.9;
      context.beginPath();
      context.arc(x - r * 0.2, y - r * 0.3, r * 0.5, 3.35, 5.0);
      context.stroke();
    };
    const drawAtmosphere = (dt: number) => {
      const t = world.runtime;
      for (const b of world.bubbles) {
        b.y -= b.v * dt;
        if (b.y < -20) {
          b.y = H + random(10, 95);
          b.x = b.lane + random(-60, 60);
        }
        drawBubble(b.x + Math.sin(t * 0.8 + b.phase + b.y * 0.009) * b.drift, b.y, b.r, b.alpha);
      }
      for (let i = world.bursts.length - 1; i >= 0; i--) {
        const b = world.bursts[i]!;
        b.y -= b.v * dt;
        const fade = clamp((b.y - b.top) / 70, 0, 1);
        if (!fade) {
          world.bursts.splice(i, 1);
          continue;
        }
        drawBubble(b.x + Math.sin(t * 2.2 + b.phase) * b.drift, b.y, b.r, b.alpha * fade);
      }
      for (const p of world.motes) {
        const x = p.x + Math.sin(t * 0.4 + p.phase) * 12;
        const y = p.y + Math.cos(t * 0.26 + p.phase) * 9;
        context.fillStyle = night ? `rgba(151,214,255,${p.a * 0.68})` : `rgba(231,251,246,${p.a * 0.75})`;
        context.fillRect(x, y, p.r, p.r);
      }
    };
    const paint = (dt: number) => {
      context.setTransform(density, 0, 0, density, 0, 0);
      context.clearRect(0, 0, W, H);
      if (dt) {
        world.runtime += dt;
        for (const f of world.fish) moveFish(f, dt, pointer);
      }
      // 夜里鱼略微压暗，与深夜画作的亮度一致。
      context.filter = night ? 'brightness(.88) saturate(1.06)' : 'none';
      for (const f of world.order) drawFish(f);
      context.filter = 'none';
      drawAtmosphere(dt);
    };
    const step = (now: number) => {
      frame = view.requestAnimationFrame(step);
      if (now - lastRendered < 1000 / 45) return;
      const dt = Math.min(0.05, (now - (lastTime || now)) / 1000);
      lastTime = now;
      lastRendered = now;
      paint(dt);
    };

    // 图集加载完成前先画出气泡与微粒；静止时每张图集到位后补画一帧。
    const loaded = () => {
      if (!play) paint(0);
    };
    for (const image of images.values()) image.addEventListener('load', loaded);
    paint(0);

    const toStage = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      const fit = coverFit(rect.width, rect.height);
      if (!fit.scale) return null;
      return {
        x: clamp((event.clientX - rect.left - fit.x) / fit.scale, 0, W),
        y: clamp((event.clientY - rect.top - fit.y) / fit.scale, 0, H),
      };
    };
    // 指针在界面元素（窗口、图标、菜单、Dock、登录卡片等）上时鱼不躲避。
    const move = (event: PointerEvent) => {
      const p = onWallpaperBlank(scene, event.target) ? toStage(event) : null;
      pointer.inside = !!p;
      if (p) Object.assign(pointer, p);
    };
    const leave = () => {
      pointer.inside = false;
    };
    const out = (event: PointerEvent) => {
      if (!event.relatedTarget) leave();
    };
    const press = (event: PointerEvent) => {
      if (event.button !== 0 || event.isPrimary === false || !onWallpaperBlank(scene, event.target)) return;
      const p = toStage(event);
      if (!p) return;
      Object.assign(pointer, p, { inside: true });
      for (const f of world.fish) {
        const px = f.x - p.x;
        const d = Math.hypot(px, f.y - p.y);
        if (d > reach(f) * 1.4) continue;
        f.scared = 1;
        newGoal(f, px >= 0 ? 1 : -1);
      }
      for (let i = 0; i < 7 && world.bursts.length < 42; i++) {
        world.bursts.push({
          x: p.x + random(-14, 14),
          y: p.y + random(-6, 6),
          r: random(2, 6.5),
          v: random(70, 125),
          phase: random(0, 6.28),
          drift: random(2, 7),
          alpha: random(0.35, 0.6),
          top: p.y - random(150, 290),
        });
      }
    };

    if (play) {
      frame = view.requestAnimationFrame(step);
      view.addEventListener('pointermove', move, { passive: true });
      view.addEventListener('pointerdown', press, { passive: true });
      view.addEventListener('pointerout', out, { passive: true });
      view.addEventListener('blur', leave);
    }
    return () => {
      if (frame) view.cancelAnimationFrame(frame);
      for (const image of images.values()) image.removeEventListener('load', loaded);
      view.removeEventListener('pointermove', move);
      view.removeEventListener('pointerdown', press);
      view.removeEventListener('pointerout', out);
      view.removeEventListener('blur', leave);
    };
  }, [root, canvasRef, play, night, density]);
}

export function AquariumScene({ animated }: { animated: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { night, play } = useSceneState(root, animated);
  const fit = useCoverFit(root);
  const id = `ds-aq-${useId().replace(/[^\w-]/g, '')}`;
  useAquarium(root, canvas, play, night, fit.density);

  return (
    <div
      ref={root}
      className="ds-aquarium"
      data-night={night || undefined}
      data-play={play || undefined}
      aria-hidden="true"
    >
      <div className="ds-aq-stage" style={{ transform: `translate(-50%, -50%) scale(${fit.scale || 1})` }}>
        <img className="ds-aq-backdrop" data-kind="day" src={dayImage} alt="" draggable={false} />
        <img className="ds-aq-backdrop" data-kind="night" src={nightImage} alt="" draggable={false} />
        <div className="ds-aq-sun-glow" />
        <div className="ds-aq-night-glow" />
        <svg className="ds-aq-rays" viewBox={`0 0 ${W} ${H}`} focusable="false">
          <defs>
            <linearGradient id={`${id}-ray`} x1="0" x2="0.3" y1="0" y2="1">
              <stop stopColor="#edffff" stopOpacity=".80" />
              <stop offset=".4" stopColor="#ccfdff" stopOpacity=".12" />
              <stop offset="1" stopColor="#ccfdff" stopOpacity="0" />
            </linearGradient>
            <filter id={`${id}-blur`}>
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>
          <g filter={`url(#${id}-blur)`} fill={`url(#${id}-ray)`}>
            <path d="M700,-30 754,-30 990,775 900,775Z" opacity=".30" />
            <path d="M850,-30 888,-30 1100,700 1025,700Z" opacity=".22" />
            <path d="M475,-30 516,-30 680,710 615,710Z" opacity=".18" />
          </g>
        </svg>
        <canvas ref={canvas} className="ds-aq-canvas" />
        <div className="ds-aq-vignette" />
      </div>
    </div>
  );
}
