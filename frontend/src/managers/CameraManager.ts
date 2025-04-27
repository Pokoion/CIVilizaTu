class CameraManager {
    private offset = { x: 0, y: 0 };
  
    getOffset() {
      return this.offset;
    }
  
    move(dx: number, dy: number) {
      this.offset.x += dx;
      this.offset.y += dy;
    }
  
    setOffset(x: number, y: number) {
      this.offset = { x, y };
    }
  }
  
  export default CameraManager;