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
};