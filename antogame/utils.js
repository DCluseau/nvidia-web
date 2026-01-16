

export function random_num(min, max) {
  const r = Math.random() * (max - min) + min;
  return Math.floor(r);
}