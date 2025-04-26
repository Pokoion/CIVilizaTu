export const findShortestPath = (
    map: number[][],
    start: { row: number; col: number },
    end: { row: number; col: number },
    discoveredTiles: boolean[][]
  ): { row: number; col: number }[] => {
    const directions = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];
  
    const queue: { row: number; col: number; path: { row: number; col: number }[] }[] = [
      { row: start.row, col: start.col, path: [] },
    ];
    const visited = new Set<string>();
  
    while (queue.length > 0) {
      const current = queue.shift()!;
      const { row, col, path } = current;
  
      if (row === end.row && col === end.col) {
        return [...path, { row, col }];
      }
  
      visited.add(`${row},${col}`);
  
      for (const direction of directions) {
        const newRow = row + direction.row;
        const newCol = col + direction.col;
  
        if (
          newRow >= 0 &&
          newRow < map.length &&
          newCol >= 0 &&
          newCol < map[0].length &&
          !visited.has(`${newRow},${newCol}`) &&
          discoveredTiles[newRow][newCol]
        ) {
          queue.push({
            row: newRow,
            col: newCol,
            path: [...path, { row, col }],
          });
        }
      }
    }
  
    return [];
  };