<template lang="pug">
  .gis-loader(:class="[`gis-loader--${type}`, `gis-loader--${size}`]")
    .gis-loader__spinner
      .gis-loader__bounce(v-for="i in 3" :key="i")
    span.gis-loader__text(v-if="text") {{ text }}
  </template>
  
  <script>
  export default {
    name: 'GisLoader',
    
    props: {
      type: {
        type: String,
        default: 'primary',
        validator: value => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
      },
      size: {
        type: String,
        default: 'medium',
        validator: value => ['small', 'medium', 'large'].includes(value)
      },
      text: {
        type: String,
        default: ''
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .gis-loader {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    
    &__spinner {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    &__bounce {
      width: 8px;
      height: 8px;
      margin: 0 3px;
      border-radius: 50%;
      animation: gis-loader-bounce 1.4s infinite ease-in-out both;
      
      &:nth-child(1) {
        animation-delay: -0.32s;
      }
      
      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }
    
    &__text {
      margin-top: 8px;
      font-size: 14px;
    }
    
    &--small {
      .gis-loader__bounce {
        width: 6px;
        height: 6px;
        margin: 0 2px;
      }
      
      .gis-loader__text {
        font-size: 12px;
      }
    }
    
    &--large {
      .gis-loader__bounce {
        width: 10px;
        height: 10px;
        margin: 0 4px;
      }
      
      .gis-loader__text {
        font-size: 16px;
      }
    }
    
    &--primary {
      .gis-loader__bounce {
        background-color: #409eff;
      }
      
      .gis-loader__text {
        color: #409eff;
      }
    }
    
    &--success {
      .gis-loader__bounce {
        background-color: #67c23a;
      }
      
      .gis-loader__text {
        color: #67c23a;
      }
    }
    
    &--warning {
      .gis-loader__bounce {
        background-color: #e6a23c;
      }
      
      .gis-loader__text {
        color: #e6a23c;
      }
    }
    
    &--danger {
      .gis-loader__bounce {
        background-color: #f56c6c;
      }
      
      .gis-loader__text {
        color: #f56c6c;
      }
    }
    
    &--info {
      .gis-loader__bounce {
        background-color: #909399;
      }
      
      .gis-loader__text {
        color: #909399;
      }
    }
  }
  
  @keyframes gis-loader-bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
  </style>