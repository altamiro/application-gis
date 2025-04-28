<template lang="pug">
  button.gis-button(
    :class="[
      `gis-button--${type}`,
      { 'gis-button--round': round },
      { 'gis-button--circle': circle },
      { 'gis-button--disabled': disabled },
      { 'gis-button--block': block },
      { 'gis-button--active': active },
      sizeClass
    ]"
    :disabled="disabled"
    :type="nativeType"
    @click="handleClick"
  )
    Icon(v-if="icon" :name="icon" :class="{ 'mr-2': $slots.default }")
    slot
  </template>
  
  <script>
  import Icon from './Icon.vue';
  
  export default {
    name: 'GisButton',
    
    components: {
      Icon
    },
    
    props: {
      type: {
        type: String,
        default: 'default',
        validator: value => ['default', 'primary', 'success', 'warning', 'danger', 'info', 'text'].includes(value)
      },
      size: {
        type: String,
        default: 'medium',
        validator: value => ['mini', 'small', 'medium', 'large'].includes(value)
      },
      icon: {
        type: String,
        default: ''
      },
      nativeType: {
        type: String,
        default: 'button',
        validator: value => ['button', 'submit', 'reset'].includes(value)
      },
      round: {
        type: Boolean,
        default: false
      },
      circle: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      block: {
        type: Boolean,
        default: false
      },
      active: {
        type: Boolean,
        default: false
      }
    },
    
    computed: {
      sizeClass() {
        return this.size ? `gis-button--${this.size}` : '';
      }
    },
    
    methods: {
      handleClick(event) {
        if (this.disabled) return;
        this.$emit('click', event);
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .gis-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 4px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.3s;
    outline: none;
    
    &:hover {
      opacity: 0.8;
    }
    
    &:active {
      opacity: 0.9;
    }
    
    &--default {
      background-color: #fff;
      border-color: #dcdfe6;
      color: #606266;
      
      &:hover, &:focus {
        border-color: #c6e2ff;
        color: #409eff;
      }
    }
    
    &--primary {
      background-color: #409eff;
      border-color: #409eff;
      color: #fff;
    }
    
    &--success {
      background-color: #67c23a;
      border-color: #67c23a;
      color: #fff;
    }
    
    &--warning {
      background-color: #e6a23c;
      border-color: #e6a23c;
      color: #fff;
    }
    
    &--danger {
      background-color: #f56c6c;
      border-color: #f56c6c;
      color: #fff;
    }
    
    &--info {
      background-color: #909399;
      border-color: #909399;
      color: #fff;
    }
    
    &--text {
      background-color: transparent;
      border-color: transparent;
      color: #409eff;
      padding: 4px 8px;
    }
    
    &--round {
      border-radius: 20px;
    }
    
    &--circle {
      border-radius: 50%;
      padding: 8px;
      width: 40px;
      height: 40px;
    }
    
    &--mini {
      padding: 4px 8px;
      font-size: 12px;
      
      &.gis-button--circle {
        width: 28px;
        height: 28px;
        padding: 4px;
      }
    }
    
    &--small {
      padding: 6px 12px;
      font-size: 13px;
      
      &.gis-button--circle {
        width: 32px;
        height: 32px;
        padding: 6px;
      }
    }
    
    &--large {
      padding: 12px 20px;
      font-size: 16px;
      
      &.gis-button--circle {
        width: 48px;
        height: 48px;
        padding: 12px;
      }
    }
    
    &--block {
      display: flex;
      width: 100%;
    }
    
    &--disabled {
      opacity: 0.5;
      cursor: not-allowed;
      
      &:hover {
        opacity: 0.5;
      }
    }
    
    &--active {
      opacity: 0.9;
      
      &.gis-button--default {
        border-color: #409eff;
        color: #409eff;
      }
    }
  }
  </style>