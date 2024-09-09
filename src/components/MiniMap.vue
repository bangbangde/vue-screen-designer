<template>
  <div class="mini-map-wrapper">
    <div v-if="state" class="mini-map" :style="style">
      <div class="design-board"></div>
      <div class="viewport" @mousedown.capture.prevent="handleMousedown"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MiniMap',
  props: {
    containerSize: Array,
    workAreaSize: Array,
    screenSize: Array,
    zoomLevel: Number,
    scroll: Array
  },
  computed: {
    state() {
      if (!this.containerSize) return null;

      const width = 140;
      const height = this.workAreaSize[1] / this.workAreaSize[0] * 140;
      const boardWidth = this.screenSize[0] * this.zoomLevel / 100 * width / this.workAreaSize[0];
      const boardHeight = this.screenSize[1] * boardWidth / this.screenSize[0];
      const viewportWidth = this.containerSize[0] * width / this.workAreaSize[0];
      const viewportHeight = this.containerSize[1] * viewportWidth / this.containerSize[0];
      const translateX = this.scroll[0] * width / this.workAreaSize[0];
      const translateY = this.scroll[1] * height / this.workAreaSize[1];
      return {
        width,
        height,
        boardWidth,
        boardHeight,
        viewportWidth,
        viewportHeight,
        translateX,
        translateY,
      }
    },
    style() {
      const {
        width,
        height,
        boardWidth,
        boardHeight,
        viewportWidth,
        viewportHeight,
        translateX,
        translateY,
      } = this.state || {};
      return {
        "--width": `${width}px`,
        "--height": `${height}px`,
        "--boardWidth": `${boardWidth}px`,
        "--boardHeight": `${boardHeight}px`,
        "--viewportWidth": `${viewportWidth}px`,
        "--viewportHeight": `${viewportHeight}px`,
        "--translateX": `${translateX}px`,
        "--translateY": `${translateY}px`,
      }
    }
  },
  created() {
    this.handleMouseup = this.handleMouseup.bind(this);
    this.handleMousemove = this.handleMousemove.bind(this);
  },
  methods: {
    handleMousedown(ev) {
      ev.preventDefault();
      document.addEventListener('mouseup', this.handleMouseup);
      document.addEventListener('mousemove', this.handleMousemove);

      this.startTX = this.state.translateX;
      this.startTY = this.state.translateY;
      this.startX = ev.clientX;
      this.startY = ev.clientY;
      this.maxX = this.state.width - this.state.viewportWidth;
      this.maxY = this.state.height - this.state.viewportHeight;
    },
    handleMousemove(ev) {
      let diffX, diffY, x, y;
      diffX = (ev.clientX - this.startX);
      diffY = (ev.clientY - this.startY);
      x = this.startTX + diffX;
      y = this.startTY + diffY;
      if (x < 0) {
        x = 0;
      }
      if (x > this.maxX) {
        x = this.maxX;
      }
      if (y < 0) {
        y = 0;
      }
      if (y > this.maxY) {
        y = this.maxY;
      }
      this.$emit('update:scroll', [
        x * this.workAreaSize[0] / this.state.width,
        y * this.workAreaSize[1] / this.state.height
      ])
    },
    handleMouseup(ev) {
      document.removeEventListener('mouseup', this.handleMouseup);
      document.removeEventListener('mousemove', this.handleMousemove);
    }
  }
}
</script>

<style lang="scss" scoped>
.mini-map-wrapper {
  position: absolute;
  background: #09090B;
  padding: 2px;
  margin: 30px;
  .mini-map {
    background-color: #141618;
    width: 140px;
    height: var(--height);
    overflow: hidden;
    position: relative;

    .design-board {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: var(--boardWidth);
      height: var(--boardHeight);
      background:
          repeat, repeat top left/7px 7px linear-gradient(to right, transparent 6.4px, #09090B 6.4px, #09090B 7px),
          repeat, repeat top left/7px 7px linear-gradient(to bottom, transparent 6.4px, #09090B 6.4px, #09090B 7px),
          #2658D8;
    }

    .viewport {
      border: solid 1px #2658D8;
      cursor: grab;
      position: absolute;
      box-shadow: 0px 0px 0px 300px rgba(34, 34, 34, 0.7);
      width: var(--viewportWidth);
      height: var(--viewportHeight);
      box-sizing: border-box;
      left: 0;
      top: 0;
      transform: translate(var(--translateX), var(--translateY));
    }
  }
}
</style>
