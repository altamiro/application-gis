<template lang="pug">
  .measure-tool
    el-tooltip(content="Measure Tool" placement="right")
      el-button(
        :class="{ active: isActive }"
        :disabled="!enabled"
        @click="activate"
        icon="el-icon-discover"
        size="medium"
        circle
      )
    
    // Measurement type when tool is active
    el-select(
      v-if="isActive"
      v-model="measurementType"
      placeholder="Measure Type"
      size="small"
      class="measurement-select"
    )
      el-option(
        v-for="type in measurementTypes"
        :key="type.value"
        :label="type.label"
        :value="type.value"
      )
    
    // Measurement results when available
    .measurement-result(v-if="isActive && measureResult")
      el-card.result-card(shadow="hover")
        .result-content
          template(v-if="measurementType === 'area'")
            span.result-label Area:
            span.result-value {{ formatResult(measureResult) }} ha
          template(v-else)
            span.result-label Distance:
            span.result-value {{ formatResult(measureResult) }} m
          el-button(
            type="text"
            icon="el-icon-delete"
            @click="clearMeasurement"
            size="mini"
          ) Clear
  </template>
  
  <script>
  import { mapGetters, mapActions, mapState } from 'vuex';
  import { TOOL_TYPES } from '@/config/map-config';
  
  export default {
    name: 'MeasureTool',
    
    data() {
      return {
        measurementType: 'area',
        measurementTypes: [
          { label: 'Area', value: 'area' },
          { label: 'Distance', value: 'distance' }
        ],
        activeMeasurement: null
      };
    },
    
    computed: {
      ...mapGetters('tools', ['activeTool', 'getToolById']),
      ...mapState('tools', ['measureResult']),
      ...mapGetters('layers', ['hasPropertyArea']),
      
      isActive() {
        return this.activeTool && this.activeTool.id === TOOL_TYPES.MEASURE;
      },
      
      enabled() {
        return this.getToolById(TOOL_TYPES.MEASURE).enabled;
      }
    },
    
    watch: {
      isActive(newValue) {
        if (!newValue && this.activeMeasurement) {
          this.deactivateMeasurement();
        }
      },
      
      measurementType(newValue) {
        if (this.isActive) {
          this.deactivateMeasurement();
          this.activateMeasurement(newValue);
        }
      }
    },
    
    methods: {
      ...mapActions('tools', ['setActiveTool']),
      
      activate() {
        if (!this.enabled) return;
        
        // If property area doesn't exist yet, show a message
        if (!this.hasPropertyArea) {
          this.$message({
            message: 'Property Area must be drawn first',
            type: 'warning'
          });
          return;
        }
        
        this.setActiveTool(TOOL_TYPES.MEASURE);
        this.activateMeasurement(this.measurementType);
      },
      
      activateMeasurement(type) {
        // This will be implemented in the MapContainer component
        this.$root.$emit('activate-measurement', { type });
      },
      
      deactivateMeasurement() {
        // This will be implemented in the MapContainer component
        this.$root.$emit('deactivate-measurement');
        this.activeMeasurement = null;
      },
      
      clearMeasurement() {
        this.$store.commit('tools/SET_MEASURE_RESULT', null);
        this.deactivateMeasurement();
        this.activateMeasurement(this.measurementType);
      },
      
      formatResult(value) {
        if (!value) return '0.00';
        
        return parseFloat(value).toFixed(2);
      }
    },
    
    beforeDestroy() {
      if (this.activeMeasurement) {
        this.deactivateMeasurement();
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .measure-tool {
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .measurement-select {
      margin-top: 8px;
      width: 120px;
    }
    
    .measurement-result {
      margin-top: 8px;
      width: 180px;
      
      .result-card {
        padding: 8px;
        
        .result-content {
          display: flex;
          flex-direction: column;
          
          .result-label {
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .result-value {
            font-size: 16px;
            margin-bottom: 8px;
          }
        }
      }
    }
  }
  </style>