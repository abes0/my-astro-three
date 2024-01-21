export default class UtilMath {
  static random(range: number) {
    return Math.random() * range - range / 2
  }
}
