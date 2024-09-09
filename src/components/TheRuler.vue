<template>
  <div class="TheRuler" :style="`--size: ${rulerHeight}px;`">
    <div class="corner"></div>
    <div class="ruler-x"><canvas ref="canvasX" :width="width" :height="scaledRulerHeight"></canvas></div>
    <div class="ruler-y"><canvas ref="canvasY" :width="scaledRulerHeight" :height="height"></canvas></div>
    <div class="content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
const dpr = window.devicePixelRatio || 1;

function drawVerticalNumbers(ctx, numbers, x, y) {
  numbers = Math.abs(numbers).toFixed(0);
  ctx.save();
  ctx.translate(x + y, 2);
  ctx.rotate(90 * Math.PI / 180);
  ctx.scale(1, -1);
  const length = numbers.length;
  for (let i = 0; i < length; i++) {
    ctx.save();
    ctx.translate(0, i * y);
    ctx.fillText(numbers[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function drawTicks(ctx, options) {
  const {
    scale,
    vertical,
    minTickLabel,
    fontSize,
    translate,
    maxTick,
    interval,
    tickLength,
    minorTickLength,
    minorInterval
  } = options;

  let curTick = minTickLabel;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  if (vertical) {
    ctx.rotate(-90 * Math.PI / 180);
    ctx.scale(-1, 1);
  }
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#a7a7a9';
  ctx.fillStyle = '#a7a7a9';
  ctx.font = `${fontSize}px serif`;
  ctx.imageSmoothingEnabled = false;

  ctx.translate(translate  * dpr, 0);
  while(curTick < maxTick) {
    const x = curTick * scale * dpr;
    if (curTick % interval === 0) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, tickLength);
      ctx.stroke();
      if (vertical) {
        drawVerticalNumbers(ctx, curTick + '', x + 2, fontSize);
      } else {
        ctx.fillText(curTick + '', x + 2, fontSize);
      }
    } else {
      ctx.save();
      ctx.translate(0, tickLength - minorTickLength);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, minorTickLength);
      ctx.stroke();
      ctx.restore();
    }
    curTick += minorInterval;
  }
  ctx.restore();
}

export default {
  name: 'TheRuler',
  props: {
    rulerHeight: {
      type: Number,
      default: 15
    },
    zoomLevel: Number,
    screenSize: Array,
    containerSize: Array,
    workAreaSize: Array,
    scroll: Array
  },
  data: () => ({
    width: '0',
    height: '0'
  }),
  computed: {
    scaledRulerHeight() {
      return this.rulerHeight * dpr;
    },
    stateX() {
      return {
        zoom: this.zoomLevel,
        scroll: this.scroll[0],
        viewLength: this.workAreaSize[0],
        length: this.screenSize[0]
      }
    },
    stateY() {
      return {
        zoom: this.zoomLevel,
        scroll: this.scroll[1],
        viewLength: this.workAreaSize[1],
        length: this.screenSize[1]
      }
    }
  },
  watch: {
    stateX: {
      deep: true,
      handler() {
        this.drawTicks();
      }
    },
    stateY: {
      deep: true,
      handler() {
        this.drawTicks(true);
      }
    },
  },
  created() {
    this.handleResize = this.handleResize.bind(this);
  },
  mounted() {
    this.ctxX = this.$refs.canvasX.getContext("2d");
    this.ctxY = this.$refs.canvasY.getContext("2d");
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.width = this.$refs.canvasX.getBoundingClientRect().width * dpr;
      this.height = this.$refs.canvasY.getBoundingClientRect().height * dpr;
      this.$nextTick(() => {
        this.drawTicks();
        this.drawTicks(true);
      })
    },
    drawTicks(vertical = false) {
      const minorTickNumber = 10;
      const { zoom, scroll, length, viewLength } = vertical ? this.stateY : this.stateX;
      const ctx = vertical ? this.ctxY : this.ctxX;
      const scale = zoom / 100;

      let interval;
      if (zoom <= 10) {
        interval = 1000;
      } else if (zoom < 30) {
        interval = 500;
      }else if (zoom < 60) {
        interval = 200;
      } else if (zoom <190) {
        interval = 100;
      } else {
        interval = 50;
      }
      const tickLength = vertical ? ctx.canvas.width : ctx.canvas.height;
      const minorTickLength = tickLength * 0.3;
      const minorInterval = interval / minorTickNumber;
      const fontSize = tickLength * 0.6;
      const minTick = (viewLength / scale  - length) / 2;
      const minTickCeil = Math.ceil(minTick / interval) * interval;
      const minTickLabel = -(minTickCeil);
      const translate = -(scroll - minTick * scale);
      const maxTick = viewLength / scale;

      drawTicks(ctx, {
        vertical,
        scale,
        minTickLabel,
        fontSize,
        translate,
        maxTick,
        interval,
        tickLength,
        minorInterval,
        minorTickLength
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.TheRuler {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: unset;
  height: unset;

  .corner {
    top: 0;
    left: 0;
    width: var(--size);
    height: var(--size);
    position: absolute;
    background: #222429 no-repeat center/contain url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAC/0lEQVR4Xu3dMW7lSAwE0DnaHm0yw3WpOZoHwlpJEy1A/WU09+97AFMGVFXY0K9fAAAAAAAAAAAAAAAAAAAAAADwNj4+Pv75/Pz8/eqMe+EtHAVJ8vXqjHvhLSgIXFAQuKAgcEFB4IKCwAUFgQsKAhcUBC4oCFxQELigIHBBQeCCgsAFBYELCgIXFAQAAAAAAAAAAAAAAAAAflKSP6/OE78++35RWHbfnXEvvOQ7WF+vzIMFKbvvzrgXXhIFgbkoCMxFQWAuCgJzURCYi4LAXBQE5qIgMBcFgbkoCMxFQWAuCgJzURCYi4LAXBQE5o5wPzHj3ruOgow7V2bcCwAAAAAAAAAAAAAAAPyw43HQEzPuXTHuXJ1x713jvtUZ9/IfdHzI8anoyox7V8STW7rpFIYoCN10CkMUhG46hSEKQjedwhAFoZtOYYiC0E2nMERB6KZTGKIgdNMpDFEQuukUhigI3XQKQxSEbjqFIQpCN53CEAWhm05hiILQTacwREHoplMYoiB00ykMURAAAAAAAAAAAAAAAAAA3k7+fT330jz4eq7svjvj3hXjzpV5t5v8b30f8euVeTAMZffdGfeuiJtwijAUcRNOEYYibsIpwlDETThFGIq4CacIQxE34RRhKOImnCIMRdyEU4ShiJtwijAUcRNOEYYibsIpwlDETThFGIq4CacIQxE34RRhKOImnCIMRdyE0/Ehn5hx711HGMadKzPuXTHuXJ1x712dbgIAAAAAAAAAAAAAAABTx0OYJ2bcu2LcuTrj3rvGfasz7l0x7lydce9d477VGfe2d7zyGp9Frsy4d0U8Ly3iJnspSNUpDHGTvRSk6hSGuMleClJ1CkPcZC8FqTqFIW6yl4JUncIQN9lLQapOYYib7KUgVacwxE32UpCqUxjiJnspSNUpDHGTvRSk6hSGuMleClJ1CkPcZC8FqTqFIW6yl4JUncIQN9lLQapOYYib7KUgVacwxE32UpCqUxjiJgAAAAAAAAAAAAAAAAAAAAAAG/wFqlQU297xdpAAAAAASUVORK5CYII=');
  }

  .ruler-x, .ruler-y {
    position: absolute;

    canvas {
      display: block;
      width: 100%;
      height: 100%;
      background: #222429;
    }
  }
  .ruler-x {
    left: var(--size);
    right: 0;
    top: 0;
    height: var(--size);
  }
  .ruler-y {
    left: 0;
    top: var(--size);
    width: var(--size);
    bottom: 0;
  }
  .content-wrapper {
    position: absolute;
    left: var(--size);
    top: var(--size);
    right: 0;
    bottom: 0;
    overflow: hidden;
  }
}
</style>
