import { useEffect, useId, useMemo, useRef, type CSSProperties, type RefObject } from 'react';
import forestImage from './assets/forest.webp';
import { onWallpaperBlank } from './pointerScope';
import {
  forestFallingLeaves,
  forestFireflies,
  forestLeavesLeft,
  forestLeavesRight,
  forestStars,
  forestWaves,
} from './sceneData';
import { sceneHeight, sceneWidth, useSceneState } from './useSceneState';

/*
 * 森林「晨雾秘境」：一张手绘画作，上面叠加 SVG 动画层——呼吸的天光、多层流动薄雾、瀑布水线、湖面波纹、
 * 摇曳的叶片与飘落的叶子；深色主题切到夜景（压暗画作、月亮、星星、萤火虫、月光倒影）。
 * 交互（开启动态壁纸时）：画面随指针轻微视差，指针处有柔光并散出光点；划过湖面泛起涟漪，点击空白处迸出一簇光点。
 * 移植自参考壁纸 forest_svg_interactive_wallpaper.html，去掉了独立页面的工具栏、标题与快捷键。
 */

type Vars = CSSProperties & Record<`--${string}`, string>;

const ns = 'http://www.w3.org/2000/svg';
const basePainting = 'translate(-18 -10) scale(1.022)';
const lakePath =
  'M 750 782 C 827 728 940 704 1038 697 C 1199 682 1435 690 1672 616 L 1672 829 ' +
  'C 1608 790 1520 792 1445 829 C 1358 864 1343 911 1308 941 L 819 941 C 814 889 783 823 750 782 Z';
const skyPath = 'M 595 0 H 1415 L 1395 155 L 1220 225 L 1123 150 L 1048 205 L 950 215 L 795 178 L 646 185 Z';
const moonStreaks =
  'M 1085 752 q 30 -2 57 1 M 1100 768 h 95 M 1054 799 h 142 M 1098 825 h 120 M 1068 853 h 177 M 1040 888 h 198';

/** 湖面的大致范围（画面坐标），只在这里泛起涟漪。 */
const inPond = (x: number, y: number) =>
  x > 820 && x < 1650 && y > 690 && y < 930 && y > 720 - (x - 850) * 0.1 && (x < 1320 || y < 860);

const random = (min: number, max: number) => min + Math.random() * (max - min);

interface PointerRefs {
  svg: RefObject<SVGSVGElement | null>;
  painting: RefObject<SVGGElement | null>;
  glow: RefObject<SVGCircleElement | null>;
  sparks: RefObject<SVGGElement | null>;
  ripples: RefObject<SVGGElement | null>;
}

function useForestPointer(refs: PointerRefs, enabled: boolean, night: boolean) {
  const nightRef = useRef(night);
  useEffect(() => {
    nightRef.current = night;
  }, [night]);

  useEffect(() => {
    const svg = refs.svg.current;
    const painting = refs.painting.current;
    const glow = refs.glow.current;
    const sparks = refs.sparks.current;
    const ripples = refs.ripples.current;
    const view = svg?.ownerDocument.defaultView;
    if (!enabled || !svg || !painting || !glow || !sparks || !ripples || !view) return;
    const doc = svg.ownerDocument;
    const state = { targetX: 0, targetY: 0, dx: 0, dy: 0, lastSpark: 0, lastRipple: 0 };
    const timers = new Set<number>();
    let frame = 0;

    const later = (callback: () => void, delay: number) => {
      const timer = view.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
    };
    const point = (event: PointerEvent) => {
      const matrix = typeof svg.getScreenCTM === 'function' ? svg.getScreenCTM() : null;
      if (!matrix) return null;
      const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      return { x: p.x, y: p.y };
    };
    // 指针落在界面元素（窗口、图标、菜单、Dock、登录卡片等）上时不散光点、不起涟漪，只保留视差。
    const onBlank = (event: PointerEvent) => onWallpaperBlank(svg, event.target);
    const ring = (x: number, y: number) => {
      const node = doc.createElementNS(ns, 'circle');
      node.setAttribute('class', 'ds-fs-ripple');
      node.setAttribute('cx', x.toFixed(1));
      node.setAttribute('cy', y.toFixed(1));
      node.setAttribute('r', '14');
      ripples.appendChild(node);
      later(() => node.remove(), 1530);
    };
    const spark = (x: number, y: number, burst = false) => {
      if (sparks.childElementCount > 75) return;
      const node = doc.createElementNS(ns, 'circle');
      node.setAttribute('class', 'ds-fs-spark');
      node.setAttribute('cx', (x + random(-8, 8)).toFixed(1));
      node.setAttribute('cy', (y + random(-8, 8)).toFixed(1));
      node.setAttribute('r', random(burst ? 2 : 1, burst ? 4.3 : 2.7).toFixed(2));
      node.toggleAttribute('data-night', nightRef.current);
      node.style.setProperty('--dx', `${random(-42, 42).toFixed(1)}px`);
      node.style.setProperty('--dy', `${random(-42, 28).toFixed(1)}px`);
      node.style.animationDuration = `${random(0.65, 1.2).toFixed(2)}s`;
      sparks.appendChild(node);
      later(() => node.remove(), 1300);
    };
    const render = () => {
      frame = 0;
      state.dx += (state.targetX - state.dx) * 0.035;
      state.dy += (state.targetY - state.dy) * 0.035;
      painting.setAttribute('transform', `translate(${state.dx.toFixed(2)} ${state.dy.toFixed(2)}) ${basePainting}`);
      // 视差缓动落定后停止逐帧更新，指针再动时重新开始。
      if (Math.abs(state.targetX - state.dx) + Math.abs(state.targetY - state.dy) > 0.02) schedule();
    };
    const schedule = () => {
      if (!frame) frame = view.requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      const p = point(event);
      if (!p) return;
      state.targetX = (p.x / sceneWidth - 0.5) * 14;
      state.targetY = (p.y / sceneHeight - 0.5) * 10;
      glow.setAttribute('cx', p.x.toFixed(1));
      glow.setAttribute('cy', p.y.toFixed(1));
      schedule();
      if (!onBlank(event)) return;
      const now = view.performance.now();
      if (now - state.lastSpark > 80) {
        spark(p.x, p.y);
        state.lastSpark = now;
      }
      if (inPond(p.x, p.y) && now - state.lastRipple > 350) {
        ring(p.x, p.y);
        state.lastRipple = now;
      }
    };
    const press = (event: PointerEvent) => {
      if (event.button !== 0 || event.isPrimary === false || !onBlank(event)) return;
      const p = point(event);
      if (!p) return;
      for (let index = 0; index < 13; index++) spark(p.x, p.y, true);
      if (inPond(p.x, p.y)) {
        ring(p.x, p.y);
        later(() => ring(p.x + random(-15, 15), p.y + random(-8, 8)), 160);
      }
    };

    view.addEventListener('pointermove', move, { passive: true });
    view.addEventListener('pointerdown', press, { passive: true });
    return () => {
      view.removeEventListener('pointermove', move);
      view.removeEventListener('pointerdown', press);
      if (frame) view.cancelAnimationFrame(frame);
      for (const timer of timers) view.clearTimeout(timer);
      sparks.replaceChildren();
      ripples.replaceChildren();
      painting.setAttribute('transform', basePainting);
    };
  }, [enabled, refs]);
}

export function ForestScene({ animated }: { animated: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const painting = useRef<SVGGElement>(null);
  const glow = useRef<SVGCircleElement>(null);
  const sparks = useRef<SVGGElement>(null);
  const ripples = useRef<SVGGElement>(null);
  const refs = useMemo<PointerRefs>(() => ({ svg, painting, glow, sparks, ripples }), []);
  const { night, play } = useSceneState(root, animated);
  useForestPointer(refs, play, night);
  const id = `ds-fs-${useId().replace(/[^\w-]/g, '')}`;
  const url = (name: string) => `url(#${id}-${name})`;

  return (
    <div
      ref={root}
      className="ds-forest"
      data-night={night || undefined}
      data-play={play || undefined}
      aria-hidden="true"
    >
      <svg
        ref={svg}
        viewBox={`0 0 ${sceneWidth} ${sceneHeight}`}
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <clipPath id={`${id}-lake`}>
            <path d={lakePath} />
          </clipPath>
          <clipPath id={`${id}-sky`}>
            <path d={skyPath} />
          </clipPath>
          <linearGradient id={`${id}-night-tint`} x1="0" y1="0" x2=".5" y2="1">
            <stop stopColor="#061b46" stopOpacity=".66" />
            <stop offset=".48" stopColor="#051b40" stopOpacity=".48" />
            <stop offset="1" stopColor="#0b2b4c" stopOpacity=".72" />
          </linearGradient>
          <radialGradient id={`${id}-day-aura`}>
            <stop stopColor="#fff6bb" stopOpacity=".36" />
            <stop offset=".3" stopColor="#fbe78a" stopOpacity=".15" />
            <stop offset="1" stopColor="#fcedaa" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-moon-light`}>
            <stop stopColor="#d1e8ff" stopOpacity=".27" />
            <stop offset=".4" stopColor="#90c7fa" stopOpacity=".12" />
            <stop offset="1" stopColor="#4a82c9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-cursor`}>
            <stop stopColor="#e4fdcf" stopOpacity=".36" />
            <stop offset=".22" stopColor="#d0faff" stopOpacity=".11" />
            <stop offset="1" stopColor="#e3ffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-firefly`}>
            <stop stopColor="#e8ffaf" stopOpacity=".83" />
            <stop offset=".35" stopColor="#fcffd0" stopOpacity=".48" />
            <stop offset="1" stopColor="#d4ffb1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-glitter`}>
            <stop stopColor="#faeab1" stopOpacity=".3" />
            <stop offset=".6" stopColor="#fff8d1" stopOpacity=".06" />
            <stop offset="1" stopColor="#fff8d1" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-moon-water`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#aecbff" stopOpacity="0" />
            <stop offset=".6" stopColor="#a5d7ff" stopOpacity=".4" />
            <stop offset="1" stopColor="#c4e6ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-vignette`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#071d15" stopOpacity=".17" />
            <stop offset=".47" stopColor="#000000" stopOpacity="0" />
            <stop offset="1" stopColor="#000e17" stopOpacity=".20" />
          </linearGradient>
          <filter id={`${id}-mist`} x="-25%" y="-100%" width="150%" height="300%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <filter id={`${id}-moon-halo`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g ref={painting} className="ds-fs-painting" transform={basePainting}>
          <image href={forestImage} x="0" y="0" width={sceneWidth} height={sceneHeight} preserveAspectRatio="none" />
        </g>

        <g className="ds-fs-day-light">
          <ellipse cx="530" cy="145" rx="435" ry="360" fill={url('day-aura')} />
        </g>
        <g className="ds-fs-night-wash">
          <rect width={sceneWidth} height={sceneHeight} fill={url('night-tint')} />
        </g>
        <g className="ds-fs-night ds-fs-night-sky" clipPath={url('sky')}>
          <circle cx="964" cy="88" r="213" fill={url('moon-light')} />
          <circle cx="964" cy="88" r="26" fill="#e5f1ff" opacity=".91" filter={url('moon-halo')} />
          <circle cx="956" cy="82" r="4" fill="#bed3e7" opacity=".34" />
          <circle cx="973" cy="97" r="6" fill="#b6cce3" opacity=".27" />
          {forestStars.map(([cx, cy, r, opacity, delay, duration], index) => (
            <circle
              key={index}
              className="ds-fs-star"
              cx={cx}
              cy={cy}
              r={r}
              fill="#e7f4ff"
              opacity={opacity}
              style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
            />
          ))}
        </g>
        <g className="ds-fs-sun-pulse">
          <ellipse cx="500" cy="156" rx="335" ry="340" fill={url('day-aura')} />
        </g>

        <g className="ds-fs-fog-back">
          <ellipse
            className="ds-fs-fog"
            cx="949"
            cy="395"
            rx="442"
            ry="56"
            fill="#f3fff2"
            opacity=".25"
            filter={url('mist')}
          />
          <ellipse
            className="ds-fs-fog"
            cx="1134"
            cy="493"
            rx="393"
            ry="44"
            fill="#d8eff2"
            opacity=".28"
            filter={url('mist')}
          />
          <ellipse
            className="ds-fs-fog"
            cx="707"
            cy="560"
            rx="397"
            ry="47"
            fill="#f2ffed"
            opacity=".18"
            filter={url('mist')}
          />
        </g>
        <g className="ds-fs-night ds-fs-night-lights">
          {forestFireflies.map(([dx, dy, delay, duration, cx, cy, halo, core], index) => (
            <g
              key={index}
              className="ds-fs-firefly"
              style={
                {
                  '--ffdx': `${dx}px`,
                  '--ffdy': `${dy}px`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                } as Vars
              }
            >
              <circle cx={cx} cy={cy} r={halo} fill={url('firefly')} />
              <circle cx={cx} cy={cy} r={core} fill="#f8f6ac" />
            </g>
          ))}
        </g>

        <g className="ds-fs-waterfall" opacity=".72">
          <g opacity=".65">
            <path className="ds-fs-fall-line" d="M 1223 618 Q 1216 635 1206 651 Q 1198 664 1188 671" />
            <path className="ds-fs-fall-line" d="M 1244 610 Q 1235 633 1228 649 Q 1217 665 1213 675" />
            <path className="ds-fs-fall-line" d="M 1270 611 Q 1264 625 1258 646 Q 1252 660 1248 670" />
            <path className="ds-fs-fall-line" d="M 1351 557 Q 1342 572 1333 587" />
          </g>
          <path d="M 1184 676 q 31 -5 56 0 q 20 3 52 -1" stroke="#e3ffff" strokeWidth="2.6" opacity=".46" fill="none" />
        </g>

        <g clipPath={url('lake')} className="ds-fs-water">
          <ellipse className="ds-fs-water-glow" cx="1223" cy="797" rx="339" ry="130" fill={url('glitter')} />
          <g>
            {forestWaves.map(([x, y, half, rise, length, stroke, width, opacity, drift, duration, delay], index) => (
              <path
                key={index}
                className="ds-fs-wave"
                d={`M ${x} ${y} q ${half} -${rise} ${length} 0 t ${length} 0`}
                stroke={stroke}
                strokeWidth={width}
                opacity={opacity}
                style={
                  { '--drift': `${drift}px`, animationDuration: `${duration}s`, animationDelay: `${delay}s` } as Vars
                }
              />
            ))}
          </g>
          <g className="ds-fs-night">
            <ellipse
              className="ds-fs-moon-reflection"
              cx="1138"
              cy="854"
              rx="165"
              ry="103"
              fill={url('moon-water')}
              opacity=".28"
            />
            <path
              d={moonStreaks}
              stroke="#8cc8ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity=".23"
              fill="none"
            />
          </g>
          <g ref={ripples} />
        </g>

        <g className="ds-fs-leaves" data-side="left">
          {forestLeavesLeft.map(renderLeaf)}
        </g>
        <g className="ds-fs-leaves" data-side="right">
          {forestLeavesRight.map(renderLeaf)}
        </g>
        <g>
          {forestFallingLeaves.map(([fall, fallX, duration, delay, x, y, a, b, c, d, fill], index) => (
            <g
              key={index}
              className="ds-fs-falling-leaf"
              style={
                {
                  '--fall': `${fall}px`,
                  '--fallx': `${fallX}px`,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                  transformOrigin: `${x}px ${y}px`,
                } as Vars
              }
            >
              <path d={`M${x},${y} q -${a},-${a} -${b},${c} q ${d},${a} ${b},-${c}`} fill={fill} opacity=".67" />
            </g>
          ))}
        </g>
        <g opacity=".43">
          <ellipse
            className="ds-fs-fog"
            cx="1160"
            cy="594"
            rx="310"
            ry="21"
            fill="#e4ffec"
            opacity=".21"
            filter={url('mist')}
          />
          <ellipse
            className="ds-fs-fog"
            cx="702"
            cy="620"
            rx="209"
            ry="23"
            fill="#dff7f2"
            opacity=".17"
            filter={url('mist')}
          />
        </g>

        <circle ref={glow} className="ds-fs-pointer-glow" cx="870" cy="470" r="130" fill={url('cursor')} />
        <g ref={sparks} />
        <rect className="ds-fs-vignette" width={sceneWidth} height={sceneHeight} fill={url('vignette')} />
      </svg>
    </div>
  );
}

function renderLeaf([cx, cy, rx, ry, fill, opacity, angle]: (typeof forestLeavesLeft)[number], index: number) {
  return (
    <ellipse
      key={index}
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={fill}
      opacity={opacity}
      transform={`rotate(${angle} ${cx} ${cy})`}
    />
  );
}
