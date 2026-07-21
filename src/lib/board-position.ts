/**
 * Calcule la `board_position` d'une carte déposée à `targetIndex` parmi les
 * positions (triées, en ordre visuel) des AUTRES cartes déjà présentes dans
 * la colonne cible (la carte déplacée elle-même est exclue de ce tableau).
 * Pattern de fractional indexing : moyenne entre les deux voisins.
 */
export function computeDropPosition(orderedPositions: number[], targetIndex: number): number {
  const before = orderedPositions[targetIndex - 1];
  const after = orderedPositions[targetIndex];
  if (before !== undefined && after !== undefined) return (before + after) / 2;
  if (before !== undefined) return before + 1;
  if (after !== undefined) return after - 1;
  return 1;
}
