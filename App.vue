<template>
  <DesignBoard :items="items">
    <template #text="{ item }">
      <div class="screen-comp screen-comp-text">
        {{ item.params.content }}
      </div>
    </template>
    <template #image="{ item }">
      <img class="screen-comp screen-comp-image" :src="item.params.src" />
    </template>
  </DesignBoard>
</template>

<script>
import DesignBoard from "./src/main.js";

export default {
  name: 'App',
  components: {
    DesignBoard
  },
  data: () => ({
    items: [
      { id: 0, type: 'text', layout: { x: 0, y: 0, width: 100, height: 100, z: 1 }, config: { editable: true, focusable: true }, params: { content: 'hello world' } },
      { id: 1, type: 'image', layout: { x: 200, y: 200, width: 100, height: 100, z: 1 }, config: { editable: false, focusable: true }, params: { src: '' } },
    ]
  })
}
</script>

<style lang="scss">
.screen-comp {
  background-color: gainsboro;
  width: 100%;
  height: 100%;
}
</style>
