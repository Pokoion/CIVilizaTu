export const findShortestPath = (
    map: string[][],
    start: { row: number; col: number },
    end: { row: number; col: number },
    discoveredTiles: boolean[][]
  ): { row: number; col: number }[] => {
    const directions = [
      { row: -1, col: 0 }, // Arriba
      { row: 1, col: 0 },  // Abajo
      { row: 0, col: -1 }, // Izquierda
      { row: 0, col: 1 },  // Derecha
      { row: -1, col: -1 }, // Diagonal arriba-izquierda
      { row: -1, col: 1 },  // Diagonal arriba-derecha
      { row: 1, col: -1 },  // Diagonal abajo-izquierda
      { row: 1, col: 1 },   // Diagonal abajo-derecha
    ];
  
    const queue: { row: number; col: number; path: { row: number; col: number }[] }[] = [
      { row: start.row, col: start.col, path: [] },
    ];
    const visited = new Set<string>();
  
    while (queue.length > 0) {
      const current = queue.shift()!;
      const { row, col, path } = current;
  
      // Si llegamos al destino, devolvemos el camino
      if (row === end.row && col === end.col) {
        return [...path, { row, col }];
      }
  
      // Marcar como visitado
      visited.add(`${row},${col}`);
  
      // Explorar vecinos
      for (const direction of directions) {
        const newRow = row + direction.row;
        const newCol = col + direction.col;
  
        // Verificar límites, si ya fue visitado y si el tile está descubierto
        if (
          newRow >= 0 &&
          newRow < map.length &&
          newCol >= 0 &&
          newCol < map[0].length &&
          !visited.has(`${newRow},${newCol}`) &&
          discoveredTiles[newRow][newCol] // Solo considerar tiles descubiertos
        ) {
          queue.push({
            row: newRow,
            col: newCol,
            path: [...path, { row, col }],
          });
        }
      }
    }
  
    return []; // No se encontró un camino
  };