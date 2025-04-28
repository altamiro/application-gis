<template lang="pug">
  i.gis-icon(
    :class="[name, `gis-icon--${size}`, { 'gis-icon--spin': spin }]"
    :style="{ color: color }"
  )
  </template>
  
  <script>
  export default {
    name: 'GisIcon',
    
    props: {
      name: {
        type: String,
        required: true
      },
      size: {
        type: String,
        default: 'medium',
        validator: value => ['mini', 'small', 'medium', 'large', 'xlarge'].includes(value)
      },
      color: {
        type: String,
        default: ''
      },
      spin: {
        type: Boolean,
        default: false
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .gis-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    &--mini {
      font-size: 12px;
    }
    
    &--small {
      font-size: 14px;
    }
    
    &--medium {
      font-size: 16px;
    }
    
    &--large {
      font-size: 20px;
    }
    
    &--xlarge {
      font-size: 24px;
    }
    
    &--spin {
      animation: gis-icon-spin 2s infinite linear;
    }
  }
  
  @keyframes gis-icon-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  </style>