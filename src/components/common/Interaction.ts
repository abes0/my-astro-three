import CommonWork from "@three/CommonWork"
import * as THREE from "three"
import whatInput from "what-input"

export default class Interaction {
  pos: THREE.Vector2 = new THREE.Vector2(0, 0)
  coord: THREE.Vector2 = new THREE.Vector2(0, 0)
  coord_old: THREE.Vector2 = new THREE.Vector2(0, 0)
  vec: THREE.Vector2 = new THREE.Vector2(0, 0)
  isTouchActive: boolean = false

  init(callback?: (e: MouseEvent) => void) {
    const handler = (e: MouseEvent) => {
      this.eMouseMove(e)
      if (callback) callback(e)
    }
    window.addEventListener("mousemove", handler, { passive: true })
    window.addEventListener("touchmove", this.eTouchMove.bind(this), {
      passive: true,
    })
    window.addEventListener("touchstart", this.eTouchStart.bind(this), {
      passive: true,
    })
    window.addEventListener("touchend", this.eTouchEnd.bind(this), {
      passive: true,
    })
  }

  isTouchDevice() {
    return whatInput.ask("intent") === "touch"
  }

  eMouseMove(e: MouseEvent) {
    this.setPos(e.clientX, e.clientY)
    this.setCoord(e.clientX, e.clientY)
  }

  eTouchMove(e: TouchEvent) {
    const touch = e.touches[0]
    this.setPos(touch.clientX, touch.clientY)
    this.setCoord(touch.clientX, touch.clientY)
  }

  eTouchStart(e: TouchEvent) {
    this.isTouchActive = true
    const touch = e.touches[0]
    this.setPos(touch.clientX, touch.clientY)
    this.setCoord(touch.clientX, touch.clientY)
  }

  eTouchEnd(e: TouchEvent) {
    this.isTouchActive = false
  }

  update() {
    this.setVec()
  }

  setPos(x: number, y: number) {
    const posX = x - CommonWork.size.sw * 0.5
    const posY = (y - CommonWork.size.sh * 0.5) * -1
    this.pos.set(posX, posY)
  }

  setCoord(x: number, y: number) {
    const coordU = (x / CommonWork.size.sw) * 2 - 1
    const coordV = (y / CommonWork.size.sh) * -2 + 1
    this.coord.set(coordU, coordV)
    // console.log({ coordU, coordV })
  }

  setVec() {
    if (this.coord_old.x !== 0 && this.coord_old.y !== 0) {
      this.vec.subVectors(this.coord, this.coord_old)
    }

    this.coord_old.copy(this.coord)
    // console.log(this.vec.x, this.vec.y)
  }

  setGLCoord(x: number, y: number) {
    const coordU = (x / CommonWork.size.sw) * 2 - 1
    const coordV = (y / CommonWork.size.sh) * -2 + 1
    this.coord.set(coordU, coordV)
    // console.log({ coordU, coordV })
  }
}
