
// lib/puzzle-generator.ts

export function generatePuzzle(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i + 1);
}

export function shuffle(array: number[]): number[] {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
