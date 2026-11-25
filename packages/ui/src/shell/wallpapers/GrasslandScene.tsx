import { useEffect, useId, useRef, type CSSProperties, type RefObject } from 'react';
import cowFarDay from './assets/grassland-cow-far-day.webp';
import cowFarNight from './assets/grassland-cow-far-night.webp';
import cowMainDay from './assets/grassland-cow-main-day.webp';
import cowMainNight from './assets/grassland-cow-main-night.webp';
import cowSmallDay from './assets/grassland-cow-small-day.webp';
import cowSmallNight from './assets/grassland-cow-small-night.webp';
import dayImage from './assets/grassland-day.webp';
import grass0Day from './assets/grassland-grass-0-day.webp';
import grass0Night from './assets/grassland-grass-0-night.webp';
import grass1Day from './assets/grassland-grass-1-day.webp';
import grass1Night from './assets/grassland-grass-1-night.webp';
import grass2Day from './assets/grassland-grass-2-day.webp';
import grass2Night from './assets/grassland-grass-2-night.webp';
import grass3Day from './assets/grassland-grass-3-day.webp';
import grass3Night from './assets/grassland-grass-3-night.webp';
import nightImage from './assets/grassland-night.webp';
import sheepCenterDay from './assets/grassland-sheep-center-day.webp';
import sheepCenterNight from './assets/grassland-sheep-center-night.webp';
import sheepLeftDay from './assets/grassland-sheep-left-day.webp';
import sheepLeftNight from './assets/grassland-sheep-left-night.webp';
import sheepRightDay from './assets/grassland-sheep-right-day.webp';
import sheepRightNight from './assets/grassland-sheep-right-night.webp';
import { grasslandFireflies, grasslandStars } from './sceneData';
import { coverFit, lcg, sceneHeight, sceneWidth, useSceneState } from './useSceneState';

/*
 * 草原「风的牧场」：清晨 / 星夜两张手绘画作，前景四块草丛抠图随风摆动，牛羊轻轻低头吃草，
 * 天上云带缓慢飘移、山谷薄雾流动，再由 Canvas 画一层独立摆动的草茎与穗子；深色主题切到星夜（星星、萤火虫）。
 * 移植自参考壁纸 grassland_wallpaper_no_water_animation.html（溪流保持静止，原作即无鼠标交互），去掉了工具栏，
 * 风力固定为「清风」，昼夜跟随桌面主题。
 */

type Vars = CSSProperties & Record<`--${string}`, string>;

const skyPath = 'M0 0H1672V275C1375 240 1206 272 1065 282C865 291 756 291 614 330C416 304 229 302 0 312Z';

/** 前景草丛：x、y、宽、高、动画延迟、周期（秒）。 */
const patches: readonly (readonly [number, number, number, number, number, number])[] = [
  [0, 460, 325, 295, 0, 6.2],
  [288, 525, 347, 337, -1.8, 8],
  [570, 565, 370, 375, -3.5, 9.8],
  [886, 615, 384, 326, -5.2, 11.6],
];
const patchImages = {
  day: [grass0Day, grass1Day, grass2Day, grass3Day],
  night: [grass0Night, grass1Night, grass2Night, grass3Night],
};

/** 牛羊：动作、x、y、宽、高，白天 / 夜晚各自的动画时长与延迟。 */
const animals: readonly {
  motion: 'graze' | 'far' | 'breath';
  box: readonly [number, number, number, number];
  day: readonly [string, number, number];
  night: readonly [string, number, number];
}[] = [
  { motion: 'graze', box: [1198, 398, 123, 89], day: [cowMainDay, 6.5, -1.9], night: [cowMainNight, 5.5, -1.5] },
  { motion: 'far', box: [1407, 371, 81, 45], day: [cowFarDay, 7, -3.1], night: [cowFarNight, 6.2, -2.3] },
  { motion: 'far', box: [758, 400, 66, 47], day: [cowSmallDay, 5.5, -1.1], night: [cowSmallNight, 7, -3.4] },
  { motion: 'breath', box: [817, 425, 57, 50], day: [sheepLeftDay, 6.5, -0.1], night: [sheepLeftNight, 6.2, -2.6] },
  { motion: 'graze', box: [872, 418, 90, 64], day: [sheepCenterDay, 5.3, -2.8], night: [sheepCenterNight, 8.3, -0.8] },
  { motion: 'breath', box: [951, 421, 86, 51], day: [sheepRightDay, 5.6, -1.8], night: [sheepRightNight, 5.5, -1.8] },
];

interface Blade {
  x: number;
  base: number;
  len: number;
  phase: number;
  lean: number;
  side: number;
  width: number;
  seedHead: boolean;
  seedLen: number;
  alpha: number;
  day: string;
  night: string;
}

const bladeDay = ['#cad476', '#d8e184', '#8dc24b', '#9ac75b', '#3e752c', '#d8d08a', '#70a842'];
const bladeNight = ['#78ada5', '#709e9f', '#417c69', '#5c9c81', '#235b54', '#a1c4b7', '#3e7767'];
let bladeCache: Blade[] | undefined;

/** 与参考壁纸同一种子、同一调用顺序生成的草茎，画面每次一致。 */
function blades() {
  if (bladeCache) return bladeCache;
  const rnd = lcg(6812026);
  const list: Blade[] = [];
  const group = (count: number, x0: number, x1: number, y0: number, y1: number, min: number, max: number) => {
    for (let index = 0; index < count; index++) {
      const x = x0 + rnd() * (x1 - x0);
      const base = y0 + rnd() * (y1 - y0);
      const len = min + rnd() * (max - min);
      // 不画在右下的土路上，左下的石头保持清楚。
      if (x > 1200 && x < 1550 && base < 875) continue;
      if (x < 250 && base > 735 && base < 890 && rnd() < 0.6) continue;
      const tone = (rnd() * bladeDay.length) | 0;
      const phase = rnd() * 6.28;
      rnd();
      const lean = -0.09 - rnd() * 0.26;
      const side = (rnd() - 0.5) * 0.36;
      const width = 0.6 + rnd() * 1.8;
      const seedHead = rnd() < 0.19 && len > 74;
      const seedLen = 7 + rnd() * 14;
      const alpha = 0.16 + rnd() * 0.27;
      list.push({
        x,
        base,
        len,
        phase,
        lean,
        side,
        width,
        seedHead,
        seedLen,
        alpha,
        day: bladeDay[tone]!,
        night: bladeNight[tone]!,
      });
    }
  };
  group(108, 0, 430, 685, 1050, 45, 175);
  group(117, 280, 860, 760, 1080, 38, 180);
  group(75, 780, 1190, 837, 1055, 40, 150);
  group(27, 1190, 1672, 920, 1065, 25, 98);
  list.sort((a, b) => a.base - b.base);
  bladeCache = list;
  return list;
}

/** Canvas 草茎层：约 30 帧；不播放时按当前昼夜画一帧静止画面。 */
function useGrassField(canvasRef: RefObject<HTMLCanvasElement | null>, play: boolean, night: boolean) {
  const blend = useRef(night ? 1 : 0);
  const clock = useRef(0);
  const nightRef = useRef(night);

  useEffect(() => {
    nightRef.current = night;
  }, [night]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const view = canvas?.ownerDocument.defaultView;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !view || !context) return;
    const list = blades();
    let width = 0;
    let height = 0;
    let ratio = 1;
    let frame = 0;
    let previous = 0;
    let pending = 0;

    const paint = () => {
      if (!width || !height) return;
      const fit = coverFit(width, height);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(ratio * fit.scale, 0, 0, ratio * fit.scale, ratio * fit.x, ratio * fit.y);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      const t = clock.current;
      const dark = blend.current;
      list.forEach((blade, index) => {
        const gust =
          Math.sin(t * 0.00106 + blade.x * 0.007 + blade.phase) * 0.68 +
          Math.sin(t * 0.00167 + blade.x * 0.014 - blade.phase) * 0.32;
        const bending = gust * 0.9 * blade.len * 0.18;
        const xt = blade.x + blade.lean * blade.len + bending;
        const yt = blade.base - blade.len;
        const xc = blade.x - 0.01 * blade.len + bending * 0.18;
        context.globalAlpha = blade.alpha;
        context.strokeStyle = dark < 0.03 ? blade.day : dark > 0.98 ? blade.night : index % 2 ? blade.night : blade.day;
        context.lineWidth = blade.width;
        context.beginPath();
        context.moveTo(blade.x, blade.base);
        context.bezierCurveTo(
          blade.x + blade.side * blade.len,
          blade.base - blade.len * 0.3,
          xc,
          yt + blade.len * 0.18,
          xt,
          yt,
        );
        context.stroke();
        if (!blade.seedHead) return;
        context.globalAlpha = blade.alpha * 0.6;
        context.strokeStyle = dark > 0.55 ? '#8bbaa9' : '#ded29c';
        context.lineWidth = 0.75 + 0.42 * blade.width;
        context.beginPath();
        context.moveTo(xt, yt);
        context.quadraticCurveTo(xt - 5, yt - blade.seedLen * 0.4, xt - 8, yt - blade.seedLen);
        context.stroke();
        for (let awn = 0; awn < 3; awn++) {
          const ox = xt - awn * 2.2;
          const oy = yt - blade.seedLen * 0.23 * awn;
          context.beginPath();
          context.moveTo(ox, oy);
          context.lineTo(ox + 5 + awn, oy - 4);
          context.stroke();
        }
      });
      context.globalAlpha = 1;
    };

    const measure = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      ratio = Math.min(view.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      paint();
    };

    const step = (now: number) => {
      frame = view.requestAnimationFrame(step);
      const elapsed = previous ? Math.min(now - previous, 80) : 0;
      previous = now;
      pending += elapsed;
      if (pending < 30) return;
      clock.current += pending;
      pending = 0;
      blend.current += ((nightRef.current ? 1 : 0) - blend.current) * 0.055;
      paint();
    };

    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    resize?.observe(canvas);
    if (!play) blend.current = nightRef.current ? 1 : 0;
    measure();
    if (play) frame = view.requestAnimationFrame(step);
    return () => {
      resize?.disconnect();
      if (frame) view.cancelAnimationFrame(frame);
    };
  }, [canvasRef, play, night]);
}

export function GrasslandScene({ animated }: { animated: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { night, play } = useSceneState(root, animated);
  useGrassField(canvas, play, night);
  const id = `ds-gl-${useId().replace(/[^\w-]/g, '')}`;
  const url = (name: string) => `url(#${id}-${name})`;

  const layer = (kind: 'day' | 'night') => (
    <g className="ds-gl-layer" data-kind={kind}>
      <image
        href={kind === 'day' ? dayImage : nightImage}
        x="0"
        y="0"
        width={sceneWidth}
        height={sceneHeight}
        preserveAspectRatio="none"
      />
      <g>
        {patches.map(([x, y, width, height, delay, period], index) => (
          <image
            key={index}
            className="ds-gl-patch"
            data-index={index}
            href={patchImages[kind][index]}
            x={x}
            y={y}
            width={width}
            height={height}
            preserveAspectRatio="none"
            style={{ '--delay': `${delay}s`, '--period': `${period}s` } as Vars}
          />
        ))}
      </g>
      <g>
        {animals.map(({ motion, box: [x, y, width, height], ...variants }, index) => {
          const [href, duration, delay] = variants[kind];
          return (
            <image
              key={index}
              className="ds-gl-animal"
              data-motion={motion}
              href={href}
              x={x}
              y={y}
              width={width}
              height={height}
              preserveAspectRatio="none"
              style={{ '--duration': `${duration}s`, animationDelay: `${delay}s` } as Vars}
            />
          );
        })}
      </g>
    </g>
  );

  return (
    <div
      ref={root}
      className="ds-grassland"
      data-night={night || undefined}
      data-play={play || undefined}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${sceneWidth} ${sceneHeight}`} preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <clipPath id={`${id}-sky`}>
            <path d={skyPath} />
          </clipPath>
          <filter id={`${id}-mist`} x="-50%" y="-110%" width="200%" height="320%">
            <feGaussianBlur stdDeviation="19" />
          </filter>
          <filter id={`${id}-cloud`} x="-25%" y="-50%" width="150%" height="200%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
          <radialGradient id={`${id}-firefly`}>
            <stop stopColor="#fff8b2" stopOpacity=".8" />
            <stop offset=".35" stopColor="#fff3a4" stopOpacity=".27" />
            <stop offset="1" stopColor="#fff6d2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-sun`}>
            <stop stopColor="#fff7c7" stopOpacity=".24" />
            <stop offset=".5" stopColor="#fff7c7" stopOpacity=".08" />
            <stop offset="1" stopColor="#fff7c7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-vignette`}>
            <stop offset=".5" stopColor="#071d21" stopOpacity="0" />
            <stop offset="1" stopColor="#061a27" stopOpacity=".2" />
          </radialGradient>
        </defs>
        {layer('day')}
        {layer('night')}
        <g className="ds-gl-glare">
          <ellipse className="ds-gl-sun-beams" cx="335" cy="285" rx="380" ry="300" fill={url('sun')} />
        </g>
        <g clipPath={url('sky')}>
          <path
            className="ds-gl-cloud"
            d="M-180 144Q18 68 203 122T625 110Q699 126 820 143"
            fill="none"
            stroke="#ffffff"
            strokeWidth="29"
            opacity=".075"
            filter={url('cloud')}
          />
          <path
            className="ds-gl-cloud"
            data-second=""
            d="M780 86Q1040 37 1320 83T1840 70"
            fill="none"
            stroke="#ffffff"
            strokeWidth="34"
            opacity=".07"
            filter={url('cloud')}
          />
        </g>
        <g>
          <ellipse
            className="ds-gl-fog"
            cx="665"
            cy="369"
            rx="322"
            ry="19"
            fill="#f7fff2"
            opacity=".24"
            filter={url('mist')}
          />
          <ellipse
            className="ds-gl-fog"
            data-order="2"
            cx="1066"
            cy="359"
            rx="322"
            ry="18"
            fill="#e6f7f9"
            opacity=".20"
            filter={url('mist')}
          />
          <ellipse
            className="ds-gl-fog"
            data-order="3"
            cx="314"
            cy="397"
            rx="230"
            ry="15"
            fill="#fffdf0"
            opacity=".15"
            filter={url('mist')}
          />
        </g>
        <g className="ds-gl-night">
          <g clipPath={url('sky')}>
            {grasslandStars.map(([cx, cy, r, duration, delay, opacity], index) => (
              <circle
                key={index}
                className="ds-gl-star"
                cx={cx}
                cy={cy}
                r={r}
                fill="#ffffff"
                style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s`, opacity }}
              />
            ))}
          </g>
          {grasslandFireflies.map(([dx, dy, duration, delay, cx, cy, halo], index) => (
            <g
              key={index}
              className="ds-gl-firefly"
              style={
                {
                  '--x': `${dx}px`,
                  '--y': `${dy}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                } as Vars
              }
            >
              <circle cx={cx} cy={cy} r={halo} fill={url('firefly')} />
              <circle cx={cx} cy={cy} r="1.6" fill="#ffec98" />
            </g>
          ))}
        </g>
        <rect width={sceneWidth} height={sceneHeight} fill={url('vignette')} />
      </svg>
      <canvas ref={canvas} className="ds-gl-canvas" />
    </div>
  );
}
