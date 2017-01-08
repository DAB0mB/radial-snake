Engine.Font = class Font extends Engine.Restorable {
  // The src property acts just line native image's src property.
  // Once finished loading, the onload() callback will be invoked
  get src() {
    return this._src;
  }

  set src(src) {
    this._src = src;

    // The font is actually an image, therefore we have 2 onload callbacks.
    // The first one is the native one which will always be run,
    // and the second one is a user defined one
    if (this.onload) var done = _.after(2, this.onload);

    this.atlas = new Image();
    this.atlas.onload = done;
    this.atlas.src = `${src}.png`;

    // Get json based on the given src property
    $.getJSON(`${src}.json`, data => {
      this.data = data;
      if (done) done();
    });

    return this._src;
  }

  constructor() {
    // The color property is the only restorable property
    super("color");
    this.charSpritesCache = {};
  }

  // Creates a texture out of the font with the given text
  createTexture(text, options = {}) {
    let { noOffsets, noSpaces } = options;
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    let height = canvas.height = this.data.height;

    // Calculates the width of the canvas based on the text and the font
    let width = canvas.width = _.reduce(text, (width, c) => {
      // No-space option means that the characters will be
      // drawn with no any space between them
      if (noSpaces) {
        return width + this.getCharSprite(c).width;
      }

      return width + this.data.chars[c].width;
    }, 0);

    // A custom size can be specified for a font as well
    if (this.size) {
      let ratio = this.size / this.data.size;
      canvas.height *= ratio;
      canvas.width *= ratio;
      context.scale(ratio, ratio);
    }

    // No we are going to draw each char on the canvas individually,
    // naturally, there should be an offset after we draw each character.
    // This variable will be used to calculate the offset
    let offset = 0;

    // Get for each char
    _.map(text, (char) => {
      return this.getCharSprite(char);
    })
    // Start drawing each char on the canvas
    .forEach((charSprite, index) => {
      let charData = this.data.chars[text.charAt(index)];

      // Each char in the font xml has a native offset in addition to its rectangle.
      // This option will disable the calculation of the native offset
      if (noOffsets) {
        charSprite.draw(context, offset);
      }
      else {
        charSprite.draw(context, offset + charData.offset.x, charData.offset.y);
      }

      if (noSpaces) {
        offset += charSprite.width;
      }
      else {
        offset += charData.width;
      }

      // A color for the font can be specified as well
      if (this.color) {
        let overlayCanvas = document.createElement("canvas");
        let overlayContext = overlayCanvas.getContext("2d");
        overlayCanvas.width = width;
        overlayCanvas.height = height;
        overlayContext.beginPath();
        overlayContext.rect(0, 0, width, height);
        overlayContext.fillStyle = this.color;
        overlayContext.fill();

        context.save();
        context.globalCompositeOperation = "source-in";
        context.drawImage(overlayCanvas, 0, 0);
        context.restore();
      }
    });

    // The canvas will be treated like an image
    return canvas;
  }

  // Gets a sprite of the given char, using the current font
  getCharSprite(char) {
    // If char is already stored in cache, abort calculation and return it
    if (this.charSpritesCache[char]) return this.charSpritesCache[char];

    // This data is fetched by the given json
    let { x, y, width, height } = this.data.chars[char].rect;
    // Creating a canvas which we will use to draw on,
    // but it is used exactly like an image afterwards
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");

    // The canvas will have the same dimensions as the font
    canvas.width = width;
    canvas.height = height;
    // Draw a cropped image from the atlas, this image contains the char font
    context.drawImage(this.atlas, x, y, width, height, 0, 0, width, height);

    // Store in cache and return it
    return this.charSpritesCache[char] = new Engine.Sprite(canvas);
  }
};