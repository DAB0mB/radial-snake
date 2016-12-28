Engine.Animations.Keyframe = class Keyframe {
  constructor(sprite, keyframes) {
    this.sprite = sprite;
    // The key-frames array contains objects with the properties of the
    // sprite at the current time-point, e.g. width of 100 and height of 200
    this.keyframes = keyframes;
    this.age = 0;
    this.frame = 0;
    // This flag determines what's gonna happen to the animation once
    // it's finished playing
    this.repetitionMode = "none";
    this.lastKeyframe = _.last(keyframes);
    this.lastFrame = this.lastKeyframe.frame;

    // These are the properties which we can animate
    this.animables = [
      "x", "y", "width", "height", "opacity"
    ];

    // Set a map whose keys represent animatable properties and values represent an array
    // with relevant key-frames to its belonging property
    this.trimmedKeyframes = this.animables.reduce((trimmedKeyframes, key) => {
      trimmedKeyframes[key] = keyframes.filter(keyframe => keyframe[key] != null);
      return trimmedKeyframes;
    }, {});

    // Set initial properties on sprite based on initial key-frame
    _.each(keyframes[0], (value, key) => {
      if (this.animables.includes(key)) sprite[key] = value;
    });
  }

  draw(context, offsetX, offsetY) {
    this.sprite.draw(context, offsetX, offsetY);
  }

  update(span) {
    if (!this.playing) return;

    this.age += span;

    switch (this.repetitionMode) {
      // After one cycle animation would stop
      case "none":
        this.frame += span;

        if (this.frame > this.lastFrame) {
          this.frame = this.lastFrame;
          this.playing = false;
        }

        break;

      // Once finished, replay from the beginning
      case "cyclic":
        this.frame = this.age % this.lastFrame;
        break;

      // Once finished, play backwards, and so on
      case "full":
        this.frame = this.age % this.lastFrame;
        let animationComplete = (this.age / this.lastFrame) % 2 >= 1;
        if (animationComplete) this.frame = this.lastFrame - this.frame;
        break;
    }

    // Update sprite properties based on given key-frame's easing mode
    this.animables.forEach(key => {
      let motion = this.getKeyframeMotion(key);

      if (motion)
        this.sprite[key] = this.calculateRelativeValue(motion, key);
    });
  }

  play() {
    this.playing = true;
  }

  pause() {
    this.playing = false;
  }

  // Gets motion for current refresh
  getKeyframeMotion(key) {
    let keyframes = this.trimmedKeyframes[key];

    // If no key-frames defined, motion is idle
    if (keyframes == null) return;
    // If there is only one key frame, motion is idle
    if (keyframes.length < 2) return;
    // If last frame reached, motion is idle
    if (this.frame > _.last(keyframes).frame) return;

    let start = this.findStartKeyframe(keyframes);
    let end = this.findEndKeyframe(keyframes);
    let ratio = this.getKeyframesRatio(start, end);

    return { start, end, ratio };
  }

  // Gets the movement ratio
  getKeyframesRatio(start, end) {
    return (this.frame - start.frame) / (end.frame - start.frame);
  }

  // Get property end value based on current frame
  findEndKeyframe(keyframes) {
    return _.find(keyframes, keyframe =>
      keyframe.frame >= (this.frame || 1)
    );
  }

  // Get property start value based on current frame
  findStartKeyframe(keyframes) {
    let resultIndex;

    keyframes.some((keyframe, currIndex) => {
      if (keyframe.frame >= (this.frame || 1)) {
        resultIndex = currIndex;
        return true;
      }
    });

    return keyframes[resultIndex - 1];
  }

  // Get a recalculated property value relative to provided easing mode
  calculateRelativeValue(motion, key) {
    let a = motion.start[key];
    let b = motion.end[key];
    let r = motion.ratio;
    let easing = r > 0 ? motion.start.easing : motion.end.easing;

    switch (easing) {
      case "in": r = Math.sin((r * Math.PI) / 2); break;
      case "out": r = Math.cos((r * Math.PI) / 2); break;
    }

    return ((b - a) * r) + a;
  }
};