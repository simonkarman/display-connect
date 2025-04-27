export const randomDigits = (len: number) => {
  const sequence = [];
  for (let i = 0; i < len; i++) {
    sequence.push(Math.floor(Math.random() * 10));
  }
  return sequence.join('');
}
