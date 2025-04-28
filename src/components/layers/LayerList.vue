<template lang="pug">
  .layer-list
    .no-layers(v-if="layers.length === 0")
      p No layers available
    
    .layer-list-item(v-for="layer in layers" :key="layer.id")
      LayerItem(:layer="layer" @visibility-toggled="toggleLayer")
  </template>
  
  <script>
  import LayerItem from './LayerItem.vue';
  
  export default {
    name: 'LayerList',
    
    components: {
      LayerItem
    },
    
    props: {
      layers: {
        type: Array,
        required: true
      }
    },
    
    methods: {
      toggleLayer({ layerId, visible }) {
        this.$emit('layer-toggled', { layerId, visible });
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .layer-list {
    .no-layers {
      padding: 10px;
      text-align: center;
      color: #999;
    }
    
    .layer-list-item {
      margin-bottom: 5px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  </style>