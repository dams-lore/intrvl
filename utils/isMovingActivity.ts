const MOVING_RE = /\b(run|running|course|footing|jog|jogging|sprint|velo|bike|cycling)\b/i;
const FIXED_RE  = /erg|assault|echo|air[\s-]?bike|airbike|stationnaire/i;

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function isMovingActivity(movement: string): boolean {
  const s = normalize(movement);
  return MOVING_RE.test(s) && !FIXED_RE.test(s);
}
