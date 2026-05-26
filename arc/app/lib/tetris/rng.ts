import type { PieceId } from "./pieces";

const ORDER: PieceId[] = ["I", "O", "T", "S", "Z", "J", "L"];

// Deterministic 7-bag: shuffle the 7 unique pieces, deal them, repeat.
export function makeBag(rand: () => number = Math.random): () => PieceId {
  let bag: PieceId[] = [];
  const refill = () => {
    bag = [...ORDER];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  };
  refill();
  return () => {
    if (bag.length === 0) refill();
    return bag.shift() as PieceId;
  };
}
