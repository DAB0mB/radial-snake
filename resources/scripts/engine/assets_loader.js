Engine.AssetsLoader = class AssetsLoader {
  constructor(next) {
    this.next = next;
  }

  // Load texture
  texture(path) {
    let image = new Image();
    image.onload = this.next();
    image.src = `${path}.png`;
    return image;
  }

  // Load font
  font(path) {
    let font = new Engine.Font();
    font.onload = this.next();
    font.src = path;
    return font;
  }
};