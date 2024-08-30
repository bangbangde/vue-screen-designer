<template>
  <div class="design-board">
    <svg class="bg"><defs><pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><circle fill="#42454F" cx="12" cy="12" r="2"></circle></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect></svg>

    <div class="pan-zoom-container" ref="container" @wheel="handleWheel" @mousedown="onContainerMousedown">
      <div class="design-area" :style="designAreaStyle">
        <ScreenItem
            v-for="(item, index) in content"
            :key="item.id"
            :index="index"
            :item="item"
            ref="screenItem"
            @transformEnd="handleTransformEnd"
        >
          <template #default="slotProps">
            <slot v-bind="{...item, ...slotProps }"></slot>
          </template>
        </ScreenItem>
      </div>
    </div>
  </div>
</template>

<script>
import TheRuler from "./TheRuler.vue";
import MiniMap from './MiniMap.vue'
import ScreenItem from './ScreenItem.vue'
import { calculateInitialZoomLevel } from "../helpers";


export default {
  name: 'DesignBoard',
  components: {
    ScreenItem,
    TheRuler,
    MiniMap
  },
  props: {
    content: Array
  },
  data: () => ({
    screenSize: [1920, 1080], // 目标屏幕尺寸 [width, height]
    containerSize: [0, 0],    // 容器尺寸（渲染值）
    margin: [0, 0],           // 设计区域边距 [x, y]（渲染值）
    translate: [0, 0],        // 设计区域平移距离 [x, y]（渲染值）
    zoomLevel: 100,           // 缩放比例 10 - 200
    activeItemId: null,       // 当前选中的元素的 id
  }),
  computed: {
    designAreaStyle() {
      const [width, height] = this.screenSize;
      const scale = this.zoom / 100;
      const [left, top] = this.translate;

      return {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${left}px, ${top}px) scale(${scale})`
      }
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.removeKeyListener();
  },
  methods: {
    init() {
      const containerRect = this.$refs.container.getBoundingClientRect();
      this.containerSize = [containerRect.width, containerRect.height];
      calculateInitialZoomLevel(containerRect.height, this.height);
      this.addKeyListener();
    },
    computeMargin() {
      const margin = 650; // 渲染区域最小外边距渲染值(即任意缩放倍率下画布边距实际渲染后都是这个值)
      const [containerWidth, containerHeight] = this.containerSize;
      const [screenWidth, screenHeight] = this.screenSize;
      const zoom = this.zoomLevel / 100;

      this.margin = [
        Math.max((containerWidth - screenWidth * zoom) / 2, margin),
        Math.max((containerHeight - screenHeight * zoom) / 2, margin),
      ];
    },
    addKeyListener() {
      const handler = (ev) => {
        if (ev.key === 'Delete' && this.activeItemId) {
          const i = this.content.findIndex(item => item.id === this.activeItemId);
          if (this.content[i]?.['deletable'] === false) return;

          this.activeItemId = null;
          this.emit('delete-item', { id: this.activeItemId, index: i });
        }
      }
      document.addEventListener('keydown', handler);
      this.removeKeyListener = () => {
        document.removeEventListener('keydown', handler);
      }
    },
    handleWheel(event) {
      if (event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        const point = [event.offsetX, event.offsetY];
        this.changeZoomLevel(event.deltaY / 10, point);
        return;
      }
    },
    changeZoomLevel(diffLevel, point) {
      // 计算新的缩放比例
      let zoomLevel = this.zoomLevel + diffLevel;
      zoomLevel = Math.min(200, Math.max(10, zoomLevel));
      if (zoomLevel === this.zoomLevel) return;

      // 计算新的滚动距离
      if (!point) {
        point = this.containerSize.map(v => v / 2);
      }

      const diffZoom = (zoomLevel - this.zoomLevel) / 100;
      const newTranslate = this.translate.map(v => {
        return v * (1 + diffZoom);
      });

      this.zoomLevel = zoomLevel;
      this.translate = newTranslate;
    },
    handleTransformEnd({ index, layout }) {
      console.log('handleTransformEnd', index, layout);
      this.emit('update-layout', { index, layout });
    },
    onContainerMousedown(e) {
      if (!getAncestorWithClass(e.target, 'screen-item-wrapper')) {
        state.activeItem = null;
      }
    },
    emit(name, payload) {
      this.$emit('emit', {name, payload});
    }
  }
}
</script>

<style lang="scss" scoped>
.design-board {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .pan-zoom-container {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    .design-area {
      position: absolute;
      left: 0;
      top: 0;
      background: rgba(0, 0, 0, 0.97);
    }
  }
}
</style>
