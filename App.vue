<template>
  <div class="vsd-demo">
    <DesignBoard :items="items" ref="designBoard">
      <template #text="{ item }">
        <div class="screen-comp screen-comp-text">
          {{ item.params.content }}
        </div>
      </template>
      <template #image="{ item }">
        <img class="screen-comp screen-comp-image" :src="item.params.src" />
      </template>
    </DesignBoard>
  </div>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    items: [
      { id: 0, type: 'text', layout: { x: 0, y: 0, width: 100, height: 100, z: 1 }, config: { editable: true, focusable: true }, params: { content: 'hello world' } },
      { id: 1, type: 'image', layout: { x: 200, y: 200, width: 100, height: 100, z: 1 }, config: { editable: false, focusable: true }, params: { src: '' } },
    ]
  })
}
</script>

<style lang="scss">
.vsd-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.screen-comp {
  background-color: gainsboro;
  width: 100%;
  height: 100%;
}
</style>
