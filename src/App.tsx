import React, { useState } from 'react';
import './App.css';

import { Point, CircleInfo, countCircles, enumerateCircles } from "./concyclic";
import Board from "./Board";

type ConfigurationProps = {
  setBound: React.Dispatch<React.SetStateAction<number>>,
  display_computation: boolean,
  setDisplayComputation: (value: React.SetStateAction<boolean>) => void,
};

function Configuration({ setBound, display_computation, setDisplayComputation }: ConfigurationProps) {
  const [input_bound, setInputBound] = useState(10);
  const handleBoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const element = e.target;
    const new_input_bound = parseInt(element.value);
    setInputBound(new_input_bound);
    if (element.reportValidity()) setBound(new_input_bound);
  };
  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => setDisplayComputation(e.target.checked);
  return (
    <div id='configuration'>
      <label>
        格子の数
        <input type='number' required={true} min='4' max='19' value={input_bound} onChange={handleBoundChange} />
      </label>
      <label style={{ marginLeft: '1em' }}>
        <input type='checkbox' checked={display_computation} onChange={handleDisplayChange} />
        計算結果を表示
      </label>
    </div>
  );
}

type ManipulatorProps = { points: Point[], bound: number, handlePointChange: (new_points: Point[]) => void };

function Manipulator({ points, bound, handlePointChange }: ManipulatorProps) {
  const [amount, setAmount] = useState(1);
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const element = e.target;
    if (element.reportValidity()) setAmount(parseInt(element.value));
  };
  function randomPoints(howmany: number) {
    let pool: Point[] = [];
    for (let x = 0; x < bound; x++)
      for (let y = 0; y > -bound; y--)
        if (!points.some(point => point.x === x && point.y === y))
          pool.push({ x, y });
    while (pool.length > howmany)
      pool.splice(Math.floor(Math.random() * pool.length), 1);
    return pool;
  }
  return (
    <div>
      <div>
        <label>点をランダムに<input type='number' value={amount} min='1' max={bound * bound} onChange={handleAmountChange} />個</label>
        <button onClick={() => handlePointChange(points.concat(randomPoints(amount)))}>追加</button>
      </div>
      <button onClick={() => handlePointChange([])}>盤面をクリア</button>
    </div>
  );
}

type GuidanceProps = {
  display_computation: boolean,
  visible_points: Point[],
  circle_count: number,
  circle_generator: Generator<CircleInfo, void, unknown>,
  setCircleGenerator: React.Dispatch<React.SetStateAction<Generator<CircleInfo, void, unknown>>>,
  setCurrentCircle: React.Dispatch<React.SetStateAction<void | CircleInfo>>,
};

function Guidance({ display_computation, visible_points, circle_count, circle_generator, setCircleGenerator, setCurrentCircle }: GuidanceProps) {
  if (!display_computation) return null;
  if (circle_count < 0) return (
    <div id='guidance'>
      <span>共円の個数を計算中です・・・</span>
    </div>
  );
  if (circle_count === 0) return (
    <div id='guidance'>
      <span>共円は存在しません</span>
    </div>
  );
  return (
    <div id='guidance'>
      <span>共円が{circle_count}個あります</span>
      <button onClick={() => {
        let yielded = circle_generator.next();
        if (yielded.done) {
          const new_circle_generator = enumerateCircles(visible_points);
          setCircleGenerator(new_circle_generator);
          yielded = new_circle_generator.next();
        }
        setCurrentCircle(yielded.value);
      }}>次を表示</button>
    </div>
  );
}

function App() {
  const [points, setPoints] = useState([] as Point[]);
  const [circle_count, setCircleCount] = useState(0);
  const [circle_generator, setCircleGenerator] = useState(enumerateCircles([] as Point[]));
  const [current_circle, setCurrentCircle] = useState(enumerateCircles([] as Point[]).next().value);
  const restrictRange = (points: Point[], bound: number) => points.filter(point => point.x < bound && point.y > -bound);
  const handlePointChange = (new_points: Point[]) => {
    const new_visible_points = restrictRange(new_points, bound);
    const new_circle_count_promise: Promise<number> = new Promise(resolve => resolve(countCircles(new_visible_points)));
    const new_circle_generator = enumerateCircles(new_visible_points);
    const new_current_circle = new_circle_generator.next().value;
    setPoints(new_points);
    setCircleCount(-1);
    new_circle_count_promise.then(new_circle_count => setCircleCount(new_circle_count));
    setCircleGenerator(new_circle_generator);
    setCurrentCircle(new_current_circle);
  };
  const [bound, setBound] = useState(10);
  const [display_computation, setDisplayComputation] = useState(true);
  return (
    <div>
      <Configuration {...{ setBound, display_computation, setDisplayComputation }} />
      <div id='principal'>
        <Board
          points={points}
          handlePointChange={handlePointChange}
          current_circle={display_computation ? current_circle : undefined}
          bound={bound}
        />
        <div style={{ lineHeight: '1.8em' }}>
          <Guidance
            display_computation={display_computation}
            visible_points={restrictRange(points, bound)}
            circle_count={circle_count}
            circle_generator={circle_generator}
            setCircleGenerator={setCircleGenerator}
            setCurrentCircle={setCurrentCircle}
          />
          <Manipulator {...{ points, bound, handlePointChange }} />
        </div>
      </div>
    </div>
  );
}

export default App;
