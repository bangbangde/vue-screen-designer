<template>
  <div v-if="layout" ref="root" class="screen-item-wrapper" :style="style" :data-index="index" @mousedown="handleMousedown">
    <template v-if="mode === 'edit' && active">
      <div class="th-line e"></div>
      <div class="th-line w"></div>
      <div class="th-line s"></div>
      <div class="th-line n"></div>
      <div v-if="!contentEditing" class="th-mask" data-handle="m"></div>
      <div
          v-for="item in handles"
          :key="item"
          :class="['th-handle', item]"
          :data-handle="item"
      ></div>
    </template>
    <slot v-bind="{active, editing: contentEditing}"></slot>
  </div>
</template>

<script>
export default {
  name: 'ScreenItem',
  props: {
    index: Number,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    z: Number,
    type: String,
    focusable: Boolean,
    active: Boolean,
    zoom: Number,
  },
  data: () => ({
    handles: ['nw', 'ne', 'sw', 'se', 'ms', 'mn', 'me', 'mw'],
    contentEditing: false
  }),
  computed: {
    layout() {
      return this.item.layout;
    },
    style() {
      return {
        width: `${this.layout.width}px`,
        height: `${this.layout.height}px`,
        transform: `translate(${this.layout.x}px, ${this.layout.y}px)`,
        zIndex: this.layout.z,
        cursor: this.mode === 'edit' ? 'grab' : 'auto',
        '--zoom': this.zoom
      };
    },
    contentEditable() {
      return this.item.type === 'title';
    },
  },
  watch: {
    active() {
      this.contentEditing = false;
    }
  },
  created() {
    this.handleMouseup = this.handleMouseup.bind(this);
    this.handleMousemove = this.handleMousemove.bind(this);
  },
  methods: {
    handleMousedown(ev) {
      this.startHandle = ev.target.dataset.handle;

      if (
          this.mode === 'view' ||
          this.item.focusable === false ||
          (this.contentEditing && !this.startHandle)
      ) {
        return;
      }

      ev.preventDefault();

      document.addEventListener('mouseup', this.handleMouseup);
      document.addEventListener('mousemove', this.handleMousemove);

      if (!this.startHandle) {
        this.startHandle = 'm';
      }
      this.transformType = this.startHandle === 'm' ? 'move' : 'resize';
      this.startLayout = {...this.layout};
      this.newLayout = {...this.layout};
      this.startX = ev.clientX;
      this.startY = ev.clientY;
      this.$emit(`transformStart`, {type: this.transformType});
    },
    handleMousemove(ev) {
      let diffX, diffY, x, y, width, height;

      diffX = (ev.clientX - this.startX) / state.zoom * 100;
      diffY = (ev.clientY - this.startY) / state.zoom * 100;

      switch (this.startHandle) {
        case 'nw':
          x = this.startLayout.x + diffX;
          y = this.startLayout.y + diffY;
          width = this.startLayout.width - diffX;
          height = this.startLayout.height - diffY;
          if (width < 0) {
            width = 0;
            x = this.startLayout.x + this.startLayout.width;
          }
          if (height < 0) {
            height = 0;
            y = this.startLayout.y + this.startLayout.height;
          }
          this.newLayout.x = x;
          this.newLayout.y = y;
          this.newLayout.width = width;
          this.newLayout.height = height;
          break;
        case 'ne':
          y = this.startLayout.y + diffY;
          width = this.startLayout.width + diffX;
          height = this.startLayout.height - diffY;
          if (width < 0) {
            width = 0;
          }
          if (height < 0) {
            height = 0;
            y = this.startLayout.y + this.startLayout.height;
          }
          this.newLayout.y = y;
          this.newLayout.width = width;
          this.newLayout.height = height;
          break;
        case 'sw':
          x = this.startLayout.x + diffX;
          width = this.startLayout.width - diffX;
          height = this.startLayout.height + diffY;
          if (width < 0) {
            x = this.startLayout.x + this.startLayout.width;
            width = 0;
          }
          if (height < 0) {
            height = 0;
          }
          this.newLayout.x = x;
          this.newLayout.width = width;
          this.newLayout.height = height;
          break;
        case 'se':
          width = this.startLayout.width + diffX;
          height = this.startLayout.height + diffY;
          if (width < 0) {
            width = 0;
          }
          if (height < 0) {
            height = 0;
          }
          this.newLayout.width = width;
          this.newLayout.height = height;
          break;
        case 'ms':
          height = this.startLayout.height + diffY;
          if (height < 0) {
            height = 0;
          }
          this.newLayout.height = height;
          break;
        case 'mn':
          y = this.startLayout.y + diffY;
          height = this.startLayout.height - diffY;
          if (height < 0) {
            y = this.startLayout.y + this.startLayout.height;
            height = 0;
          }
          this.newLayout.y = y;
          this.newLayout.height = height;
          break;
        case 'me':
          width = this.startLayout.width + diffX;
          if (width < 0) {
            width = 0;
          }
          this.newLayout.width = width;

          break;
        case 'mw':
          x = this.startLayout.x + diffX;
          width = this.startLayout.width - diffX;
          if (width < 0) {
            x = this.startLayout.x + this.startLayout.width;
            width = 0;
          }
          this.newLayout.x = x;
          this.newLayout.width = width;
          break;
        default:
          this.newLayout.x = this.startLayout.x + diffX;
          this.newLayout.y = this.startLayout.y + diffY;
          break;
      }
      this.item.layout = this.newLayout;
      this.$emit('transform', {type: this.transformType, layout: this.newLayout});
    },
    handleMouseup(ev) {
      const handleClick = () => {
        if (this.active && this.contentEditable) {
          this.contentEditing = true;
        }
        // state.activeItem = this.sid;
      }

      document.removeEventListener('mouseup', this.handleMouseup);
      document.removeEventListener('mousemove', this.handleMousemove);

      if (
          this.transformType === 'move' &&
          this.startLayout.x === this.newLayout.x &&
          this.startLayout.y === this.newLayout.y
      ) {
        handleClick();
        return;
      }

      this.$emit(`transformEnd`, {
        type: this.transformType,
        index: this.index,
        layout: this.newLayout,
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.screen-item-wrapper {
  position: absolute;
  transform-origin: center;
  left: 0;
  top: 0;
  overflow: visible;

  --lineHeight: 1px;
  --lineColor: #2e74ff;
  --pointRadius: 12px;
  --pointColor: #fff;

  .th-line {
    position: absolute;

    &.s, &.n, &.e, &.w {
      background-color: var(--lineColor);
    }

    &.s, &.n {
      left: calc(var(--pointRadius) / 4);
      right: calc(var(--pointRadius) / 4);
      height: var(--lineHeight);
      transform: scale(1, calc(1 / var(--zoom) * 100));
    }

    &.w, &.e {
      width: var(--lineHeight);
      top: calc(var(--pointRadius) / 4);
      bottom: calc(var(--pointRadius) / 4);
      transform: scale(calc(1 / var(--zoom) * 100), 1);
    }

    &.n {
      top: calc(var(--lineHeight) / -2);
    }

    &.s {
      bottom: calc(var(--lineHeight) / -2);
    }

    &.w {
      left: calc(var(--lineHeight) / -2);
    }

    &.e {
      right: calc(var(--lineHeight) / -2);
    }

  }

  .th-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: grab;
    z-index: 9999;
  }

  .th-handle {
    position: absolute;
    z-index: 99999;

    &.ne, &.se, &.nw, &.sw,
    &.mn, &.ms, &.me, &.mw {
      background-color: var(--pointColor);
      width: var(--pointRadius);
      height: var(--pointRadius);
      border-radius: 50%;
      border: calc(var(--pointRadius) / 4) solid transparent;
      transform: scale(calc(1 / var(--zoom) * 100));
      background-clip: content-box;
    }

    &.se {
      right: calc(var(--pointRadius) / -2);
      bottom: calc(var(--pointRadius) / -2);
      cursor: se-resize;
    }

    &.ne {
      right: calc(var(--pointRadius) / -2);
      top: calc(var(--pointRadius) / -2);
      cursor: ne-resize;
    }

    &.sw {
      left: calc(var(--pointRadius) / -2);
      bottom: calc(var(--pointRadius) / -2);
      cursor: sw-resize;
    }

    &.nw {
      left: calc(var(--pointRadius) / -2);
      top: calc(var(--pointRadius) / -2);
      cursor: nw-resize;
    }

    &.ms {
      left: calc(50% - var(--pointRadius) / 2);
      bottom: calc(var(--pointRadius) / -2);
      cursor: s-resize;
    }

    &.mn {
      left: calc(50% - var(--pointRadius) / 2);
      top: calc(var(--pointRadius) / -2);
      cursor: n-resize;
    }

    &.me {
      top: calc(50% - var(--pointRadius) / 2);
      right: calc(var(--pointRadius) / -2);
      cursor: e-resize;
    }

    &.mw {
      top: calc(50% - var(--pointRadius) / 2);
      left: calc(var(--pointRadius) / -2);
      cursor: w-resize;
    }
  }
}
</style>
