import DesignBoard from "./components/DesignBoard.vue";

export default DesignBoard;

export const install = (Vue) => {
  Vue.component(DesignBoard.name, DesignBoard);
}
