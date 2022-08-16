import { Point, CircleInfo, tanInscribedAngle } from "./concyclic";

interface BoardViewInfo { bound: number, dots: number };

type Orientation = 'vertical' | 'horizontal';
type LinesProps = { orientation: Orientation } & BoardViewInfo;

function Lines({ orientation, bound, dots }: LinesProps) {
  let lines: JSX.Element[] = [];
  for (let i = 0; i < bound; i++) {
    const shift = dots * (i + 0.5) / bound;
    if (orientation === 'vertical')
      lines.push(
        <line key={i} className='vertical-line' x1={shift} y1={0} x2={shift} y2={dots} />
      );
    if (orientation === 'horizontal')
      lines.push(
        <line key={i} className='horizontal-line' x1={0} y1={shift} x2={dots} y2={shift} />
      );
  }
  return (
    <g id={orientation + '_lines'}>{lines}</g>
  );
}

type PointwiseHandler = (x: number, y: number) => () => void;
type StonesProps = { points: Point[], handleClick: PointwiseHandler, current_circle: CircleInfo | void } & BoardViewInfo;

function Stones({ points, handleClick, current_circle, bound, dots }: StonesProps) {
  let stones: JSX.Element[] = [];
  for (let x = 0; x < bound; x++) {
    for (let y = 0; y > -bound; y--) {
      let class_name = 'stone';
      if (current_circle != null && (
        (current_circle.p1.x === x && current_circle.p1.y === y) ||
        (current_circle.p2.x === x && current_circle.p2.y === y) ||
        tanInscribedAngle(current_circle.p1, current_circle.p2, { x, y }) === current_circle.tangent
      )) class_name = 'highlighted';
      stones.push(
        <circle key={`(${x},${y})`}
          className={class_name}
          cx={(x + 0.5) * dots / bound}
          cy={(-y + 0.5) * dots / bound}
          r={dots / bound / 2.5}
          opacity={points.some(point => point.x === x && point.y === y) ? 1 : 0}
          onClick={handleClick(x, y)}
        />);
    }
  }
  return (
    <g id='stones'>{stones}</g>
  );
}

type ProlongedLineProps = { x1: number, y1: number, x2: number, y2: number, dots: number } & React.SVGProps<SVGLineElement>;

function ProlongedLine({ x1, y1, x2, y2, dots, ...rest }: ProlongedLineProps) {
  const left_intercept = (x1 * y2 - x2 * y1) / (x1 - x2);
  const right_intercept = (y1 * (dots - x2) - y2 * (dots - x1)) / (x1 - x2);
  if (!isFinite(left_intercept)) return (
    <line x1={x1} y1={0} x2={x2} y2={dots} {...rest} />
  );
  return (
    <line x1={0} y1={left_intercept} x2={dots} y2={right_intercept} {...rest} />
  );
}

type MarkerProps = { current_circle: CircleInfo | void } & BoardViewInfo;

function Marker({ current_circle, bound, dots }: MarkerProps) {
  if (!current_circle) return null;
  const { p1, p2, tangent } = current_circle;
  const strokeWidth = Math.max(dots / bound / 15, 3);
  if (tangent === 0) return (
    <ProlongedLine
      className='marker'
      x1={(p1.x + 0.5) * dots / bound}
      y1={(-p1.y + 0.5) * dots / bound}
      x2={(p2.x + 0.5) * dots / bound}
      y2={(-p2.y + 0.5) * dots / bound}
      dots={dots}
      strokeWidth={strokeWidth}
    />
  );
  const direction = { x: p2.x - p1.x, y: p2.y - p1.y };
  const bisector = { x: direction.y / 2 / tangent, y: -direction.x / 2 / tangent };
  const circumcenter = { x: p1.x + direction.x / 2 + bisector.x, y: p1.y + direction.y / 2 + bisector.y };
  const radius = Math.sqrt((circumcenter.x - p1.x) ** 2 + (circumcenter.y - p1.y) ** 2);
  return (
    <circle
      className='marker'
      cx={(circumcenter.x + 0.5) * dots / bound}
      cy={(-circumcenter.y + 0.5) * dots / bound}
      r={radius * dots / bound}
      strokeWidth={strokeWidth}
    />
  );
}

type BoardProps = {
  points: Point[],
  bound: number,
  handlePointChange: (new_points: Point[]) => void,
  current_circle: CircleInfo | void,
};

export default function Board({ points, bound, handlePointChange, current_circle }: BoardProps) {
  const dots = 640;
  const togglePoint: PointwiseHandler = (x: number, y: number) => {
    return () => {
      const new_points = points.some(point => point.x === x && point.y === y)
        ? points.filter(point => point.x !== x || point.y !== y)
        : points.concat([{ x, y }]);
      handlePointChange(new_points);
    };
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" id='board' viewBox={`0 0 ${dots} ${dots}`}>
      <Lines orientation='vertical' bound={bound} dots={dots} />
      <Lines orientation='horizontal' bound={bound} dots={dots} />
      <Marker {...{ current_circle, bound, dots }} />
      <Stones {...{ points, bound, dots, current_circle }} handleClick={togglePoint} />
    </svg>
  );
}
