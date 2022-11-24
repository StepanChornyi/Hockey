import { ColorHelper, Tween } from 'black-engine';

export default class Utils {
  static rndPick(arr) {
    return arr[Math.round(arr.length * Math.random()) % arr.length];
  }

  static rndBetween(a, b) {
    return Utils.lerp(a, b, Math.random());
  }

  static clampToRect(vector, rect) {
    vector.x = Utils.clamp(rect.left, rect.right, vector.x);
    vector.y = Utils.clamp(rect.top, rect.bottom, vector.y);

    return vector;
  }

  static lerpVector(a, b, t, out = a) {
    out.x = Utils.lerp(a.x, b.x, t);
    out.y = Utils.lerp(a.y, b.y, t);

    return out;
  }

  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  static clamp(min, max, val) {
    return Math.max(min, Math.min(max, val));
  }

  static removeAllTweens(...gameObjects) {
    for (let i = 0; i < gameObjects.length; i++) {
      const gameObject = gameObjects[i];

      Utils.removeAllComponents(gameObject, Tween);
    }
  }

  static removeAllComponents(gameObject, componentType) {
    while (gameObject.getComponent(componentType)) {
      gameObject.removeComponent(gameObject.getComponent(componentType));
    }
  }

  static rotateHue(hex, t) {
    const hsv = ColorHelper.rgb2hsv(ColorHelper.hex2rgb(hex));

    hsv.h += t;

    return ColorHelper.rgb2hex(ColorHelper.hsv2rgb(hsv));
  }
}