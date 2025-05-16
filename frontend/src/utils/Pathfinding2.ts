import { TILE_TYPES } from "../utils/Constants";
import { TerrainType } from "../types";

interface Position {
  row: number;
  col: number;
}

export default class Pathfinding2 {
  static findPath(
    map: (TerrainType | string)[][],
    start: Position,
    end: Position,
    movementPoints: number,
    discoveredTiles: boolean[][]
  ): Position[] {
    const height = map.length;
    const width = map[0]?.length || 0;
    const visited = Array.from({ length: height }, () =>
      Array(width).fill(false)
    );
    const queue: { row: number; col: number; path: Position[]; cost: number }[] = [
      { row: start.row, col: start.col, path: [], cost: 0 }
    ];

    let bestPath: Position[] = [];

    while (queue.length > 0) {
      queue.sort(
        (a, b) =>
          a.cost +
          Pathfinding2.heuristic(a, end) -
          (b.cost + Pathfinding2.heuristic(b, end))
      );
      const current = queue.shift()!;
      const { row, col, path, cost } = current;

      if (
        row === end.row &&
        col === end.col &&
        cost <= movementPoints
      ) {
        return [...path, { row, col }];
      }

      if (cost > movementPoints) continue;

      if (cost > bestPath.length && cost <= movementPoints) {
        bestPath = [...path, { row, col }];
      }

      visited[row][col] = true;

      for (const [dr, dc] of [
        [0, 1], [1, 0], [0, -1], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1],
      ]) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (
          newRow >= 0 &&
          newRow < height &&
          newCol >= 0 &&
          newCol < width &&
          !visited[newRow][newCol] &&
          discoveredTiles[newRow][newCol]
        ) {
          const terrain = map[newRow][newCol];
          if (!terrain) {
            continue;
          }
          const tileType = TILE_TYPES[terrain];
          if (!tileType) {
            continue;
          }
          const moveCost = tileType.movementCost ?? Infinity;
          if (moveCost === Infinity) {
            continue;
          }
          queue.push({
            row: newRow,
            col: newCol,
            path: [...path, { row, col }],
            cost: cost + moveCost
          });
        }
      }
    }
    return bestPath;
  }

  private static heuristic(a: Position, b: Position): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }
}