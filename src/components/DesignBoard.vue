<template>
  <div class="design-board">
    <svg class="bg"><defs><pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><circle fill="#42454F" cx="12" cy="12" r="2"></circle></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect></svg>
    <TheRuler :containerSize="containerSize" :screen-size="screenSize" :workAreaSize="workAreaSize" :scroll="scroll">
      <div class="pan-zoom-container" ref="container" @wheel="handleWheel">
        <div class="design-area" ref="designArea" :style="designAreaStyle">
          <ScreenItem
              ref="screenItems"
              v-for="(item, index) in items"
              :key="item.id"
              :index="index"
              :item="item"
              :activeItem.sync="activeItem"
              :zoomLevel="zoomLevel"
              :viewMode="viewMode"
          >
            <template #default="itemState">
              <slot :name="item.type" v-bind="{ index, zoomLevel, viewMode, item, itemState }"></slot>
            </template>
          </ScreenItem>
        </div>
      </div>
    </TheRuler>
    <div class="debugger" style="display: inline-block; position: absolute; color: white;">
      <ul>
        <li>containerSize:{{containerSize}}</li>
        <li>scroll:{{scroll}}</li>
        <li>designAreaSize:{{designAreaSize}}</li>
        <li>workAreaSize:{{workAreaSize}}</li>
        <li>margin:{{ workAreaSize.map((v, i) => (v - designAreaSize[i]) / 2) }}</li>
        <li><button @click="debugZoom">zoom</button></li>
      </ul>
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
    items: Array,
    viewMode: Boolean
  },
  data: () => ({
    containerSize: [0, 0],    // 容器元素尺寸
    screenSize: [1920, 1080], // 目标屏幕尺寸 [width, height]
    scroll: [0, 0],           // 工作区域滚动值（渲染值）
    zoomLevel: 100,           // 缩放比例 10 - 200
    activeItem: null,         // 当前选中的元素对象
  }),
  computed: {
    // 设计区域尺寸（渲染值）
    designAreaSize() {
      return this.screenSize.map(v => v * this.zoomLevel / 100);
    },
    // 工作区域尺寸（渲染值）由设计区域和最小650px的边距组成
    workAreaSize() {
      return this.designAreaSize.map((v, i) => Math.max(650 * 2 + v, this.containerSize[i]));
    },
    designAreaStyle() {
      const [width, height] = this.screenSize;
      const scale = this.zoomLevel / 100;
      const [left, top] = this.workAreaSize.map((v, i) => ((v - this.designAreaSize[i]) / 2 - this.scroll[i]));

      return {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${left}px, ${top}px) scale(${scale})`,
        transformOrigin: '0 0',
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
    debugZoom() {
      this.changeZoomLevel(10);
    },
    init() {
      const containerRect = this.$refs.container.getBoundingClientRect();
      this.containerSize = [containerRect.width, containerRect.height];
      calculateInitialZoomLevel(containerRect.height, this.height);
      this.addKeyListener();
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
    fixScroll() {
      this.scroll = this.scroll.map((v, i) => Math.min(Math.max(0, v), this.workAreaSize[i] - this.containerSize[i]));
    },
    handleWheel(event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.ctrlKey) {
        const containerRect = this.$refs.container.getBoundingClientRect();
        const point = [event.pageX - containerRect.x, event.pageY - containerRect.y]; // 光标相对于容器的坐标
        this.changeZoomLevel(event.deltaY / -10, point);
      } else {
        let {deltaX, deltaY} = event;
        if (event.shiftKey && deltaX=== 0) {
          deltaX = deltaY;
          deltaY = 0;
        }
        this.changeScroll([deltaX, deltaY]);
      }
    },
    changeZoomLevel(diffLevel, point) {
      // 计算新的缩放比例
      let zoomLevel = this.zoomLevel + diffLevel;
      zoomLevel = Math.min(200, Math.max(10, zoomLevel));
      if (zoomLevel === this.zoomLevel) return;

      const deltaZoom = (zoomLevel - this.zoomLevel) / 100;
      const designAreaPosition = this.scroll.map((v, i) => (this.workAreaSize[i] - this.designAreaSize[i]) / 2 - v);

      // 光标相对容器的偏移量
      if (!point) {
        point = this.containerSize.map(v => v / 2);
      }
      // 光标相对设计区域的偏移量
      const offsets = point.map((v, i) => v - designAreaPosition[i]);
      const offsetsScaled = offsets.map(v => v * (1 + deltaZoom));

      console.log('changeZoomLevel', {point, offsets, offsetsScaled});

      this.zoomLevel = zoomLevel;
      // padding - scrollNew + offsetsScaled == point
      const padding = this.workAreaSize.map((v, i) => (v - this.designAreaSize[i]) / 2);
      this.scroll = point.map((v, i) => padding[i] - point[i] + offsetsScaled[i]);
      // this.fixScroll();
    },
    changeScroll(delta) {
      this.scroll = this.scroll.map((v, i) => v + delta[i] * 0.5);
      this.fixScroll();
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
    background-color: black;
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
      background: rgba(146, 151, 238, 0.97);
    }
  }
}
</style>
