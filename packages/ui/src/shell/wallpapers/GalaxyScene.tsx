import { useEffect, useId, useRef, type RefObject } from 'react';
import dayImage from './assets/galaxy-day.webp';
import nightImage from './assets/galaxy-night.webp';
import { lcg, sceneHeight, sceneWidth, useCoverFit, useSceneState } from './useSceneState';

/*
 * 星空「星海之境」：晨光 / 深夜两张手绘宇宙画作，叠加缓慢漂移的星云层、呼吸的星云辉光、行星光环与月晕、
 * 沿行星轨道流动的光点和地平线薄雾，再由 Canvas 画闪烁的星星、漂浮的星尘与偶尔划过的流星；深色主题切到深夜。
 * 移植自参考壁纸 cosmos_starry_wallpaper.html（原作即无鼠标交互，湖面与山保持静止），去掉了工具栏与快捷键，
 * 昼夜跟随桌面主题。
 */

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  amp: number;
  base: number;
  cross: boolean;
  color: string;
}

interface Dust {
  x: number;
  y: number;
  phase: number;
  speed: number;
  r: number;
  opacity: number;
}

interface Meteor {
  x: number;
  y: number;
  start: number;
  speed: number;
  dy: number;
  duration: number;
  color: string;
}

let fieldCache: { stars: Star[]; dust: Dust[] } | undefined;

/** 与参考壁纸同一种子：星星只撒在天空里，地平线以下大多跳过。 */
function field() {
  if (fieldCache) return fieldCache;
  const rnd = lcg(19473);
  const stars: Star[] = [];
  const dust: Dust[] = [];
  for (let index = 0; index < 305; index++) {
    const x = rnd() * sceneWidth;
    const y = rnd() * 525;
    const horizon = 405 + Math.abs(x - 835) * 0.022;
    if (y > horizon && rnd() < 0.82) {
      index--;
      continue;
    }
    const r = rnd() * 0.9 + 0.3;
    const phase = rnd() * Math.PI * 2;
    const speed = 0.48 + rnd() * 2.6;
    const amp = 0.18 + rnd() * 0.75;
    const base = 0.12 + rnd() * 0.35;
    const cross = rnd() < 0.055;
    const color = rnd() < 0.22 ? '#e3b3ff' : rnd() < 0.2 ? '#bdeaff' : '#ffffff';
    stars.push({ x, y, r, phase, speed, amp, base, cross, color });
  }
  for (let index = 0; index < 110; index++) {
    const x = rnd() * 950;
    const y = rnd() * 380;
    dust.push({
      x,
      y,
      phase: rnd() * 6.28,
      speed: rnd() * 0.43 + 0.09,
      r: rnd() * 1.3 + 0.28,
      opacity: rnd() * 0.15 + 0.03,
    });
  }
  fieldCache = { stars, dust };
  return fieldCache;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

/** Canvas 星空层：约 32 帧；不播放时画一帧没有流星的静止星空。 */
function useStarField(canvasRef: RefObject<HTMLCanvasElement | null>, play: boolean, night: boolean, density: number) {
  const nightRef = useRef(night);
  useEffect(() => {
    nightRef.current = night;
  }, [night]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const view = canvas?.ownerDocument.defaultView;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !view || !context || !density) return;
    const { stars, dust } = field();
    // 画布按实际显示密度分配像素：大屏不发虚，小预览不浪费。
    canvas.width = Math.round(sceneWidth * density);
    canvas.height = Math.round(sceneHeight * density);
    let clock = 12;
    let last = 0;
    let lastPaint = 0;
    let frame = 0;
    let nextMeteor = clock + 1.4;
    const meteors: Meteor[] = [];

    const drawStars = (t: number) => {
      const level = nightRef.current ? 1 : 0.45;
      for (const star of stars) {
        const shimmer = Math.pow(0.5 + 0.5 * Math.sin(t * star.speed + star.phase), 2);
        const alpha = Math.min(0.92, (star.base + star.amp * shimmer) * level);
        context.globalAlpha = alpha;
        context.fillStyle = star.color;
        context.beginPath();
        context.arc(star.x, star.y, star.r * (0.8 + 0.45 * shimmer), 0, Math.PI * 2);
        context.fill();
        if (star.cross && shimmer > 0.5) {
          const size = 3.5 + 4.3 * shimmer;
          context.globalAlpha = alpha * 0.6;
          context.lineWidth = 0.65;
          context.strokeStyle = star.color;
          context.beginPath();
          context.moveTo(star.x - size, star.y);
          context.lineTo(star.x + size, star.y);
          context.moveTo(star.x, star.y - size);
          context.lineTo(star.x, star.y + size);
          context.stroke();
        }
      }
    };
    const drawDust = (t: number) => {
      const level = nightRef.current ? 1 : 0.62;
      for (const item of dust) {
        const x = item.x + Math.sin(t * 0.27 + item.phase) * 17;
        const y = item.y + Math.cos(t * 0.35 + item.phase) * 11;
        context.globalAlpha = item.opacity * level * (0.65 + 0.35 * Math.sin(t * item.speed + item.phase));
        context.fillStyle = item.phase > 3 ? '#d4b8ff' : '#9feeff';
        context.beginPath();
        context.arc(x, y, item.r, 0, Math.PI * 2);
        context.fill();
      }
    };
    const drawMeteors = (t: number) => {
      if (t > nextMeteor) {
        meteors.push({
          x: random(270, 1560),
          y: random(35, 265),
          start: t,
          speed: random(390, 565),
          dy: random(0.37, 0.52),
          duration: random(0.95, 1.35),
          color: Math.random() > 0.45 ? '192,224,255' : '234,174,255',
        });
        nextMeteor = t + random(5.5, 10.5);
      }
      for (let index = meteors.length - 1; index >= 0; index--) {
        const meteor = meteors[index]!;
        const age = t - meteor.start;
        if (age > meteor.duration) {
          meteors.splice(index, 1);
          continue;
        }
        const distance = meteor.speed * age;
        const px = meteor.x - distance;
        const py = meteor.y + distance * meteor.dy;
        const tailX = px + 190;
        const tailY = py - 190 * meteor.dy;
        const alpha = Math.pow(Math.sin((Math.PI * age) / meteor.duration), 0.55) * (nightRef.current ? 0.95 : 0.7);
        const gradient = context.createLinearGradient(px, py, tailX, tailY);
        gradient.addColorStop(0, `rgba(${meteor.color},${alpha})`);
        gradient.addColorStop(0.13, `rgba(${meteor.color},${alpha * 0.7})`);
        gradient.addColorStop(1, `rgba(${meteor.color},0)`);
        context.globalAlpha = 1;
        context.lineWidth = 2.5;
        context.strokeStyle = gradient;
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(tailX, tailY);
        context.stroke();
        context.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
        context.beginPath();
        context.arc(px, py, 2.15, 0, Math.PI * 2);
        context.fill();
      }
    };
    const paint = (withMeteors: boolean) => {
      context.setTransform(density, 0, 0, density, 0, 0);
      context.clearRect(0, 0, sceneWidth, sceneHeight);
      drawStars(clock);
      drawDust(clock);
      if (withMeteors) drawMeteors(clock);
      context.globalAlpha = 1;
    };
    const step = (now: number) => {
      frame = view.requestAnimationFrame(step);
      if (!last) last = now;
      clock += Math.min(0.08, (now - last) / 1000);
      last = now;
      if (now - lastPaint < 31) return;
      lastPaint = now;
      paint(true);
    };

    paint(false);
    if (play) frame = view.requestAnimationFrame(step);
    return () => {
      if (frame) view.cancelAnimationFrame(frame);
    };
  }, [canvasRef, play, night, density]);
}

export function GalaxyScene({ animated }: { animated: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { night, play } = useSceneState(root, animated);
  const fit = useCoverFit(root);
  const id = `ds-gx-${useId().replace(/[^\w-]/g, '')}`;
  useStarField(canvas, play, night, fit.density);

  return (
    <div
      ref={root}
      className="ds-galaxy"
      data-night={night || undefined}
      data-play={play || undefined}
      aria-hidden="true"
    >
      <div className="ds-gx-stage" style={{ transform: `translate(-50%, -50%) scale(${fit.scale || 1})` }}>
        <img className="ds-gx-painting" data-kind="day" src={dayImage} alt="" draggable={false} />
        <img className="ds-gx-painting" data-kind="night" src={nightImage} alt="" draggable={false} />
        <div className="ds-gx-nebula-drift">
          <img className="ds-gx-painting" data-kind="day" src={dayImage} alt="" draggable={false} />
          <img className="ds-gx-painting" data-kind="night" src={nightImage} alt="" draggable={false} />
        </div>
        <div className="ds-gx-nebula-glow" />
        <div className="ds-gx-orbital-glow" />
        <div className="ds-gx-moon">
          <div className="ds-gx-moon-halo" />
        </div>
        <div className="ds-gx-horizon-haze" />
        <svg className="ds-gx-orbit" viewBox={`0 0 ${sceneWidth} ${sceneHeight}`} focusable="false">
          <defs>
            <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
          </defs>
          <ellipse
            className="ds-gx-orbit-spark"
            cx="1362"
            cy="218"
            rx="269"
            ry="31"
            transform="rotate(-25 1362 218)"
            pathLength="1474"
            filter={`url(#${id}-glow)`}
          />
          <ellipse
            className="ds-gx-orbit-spark"
            data-secondary=""
            cx="1362"
            cy="218"
            rx="264"
            ry="28"
            transform="rotate(-25 1362 218)"
            pathLength="1474"
            filter={`url(#${id}-glow)`}
          />
        </svg>
        <canvas ref={canvas} className="ds-gx-stars" />
      </div>
    </div>
  );
}
