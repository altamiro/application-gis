<template lang="pug">
  .area-calculation-board
    el-card.area-board-container
      .board-header
        h3 Area Calculation (hectares)
        el-button(
          type="text"
          icon="el-icon-refresh"
          size="mini"
          @click="recalculateAreas"
        ) Recalculate
      
      .board-body
        .no-data(v-if="!hasPropertyArea")
          p Please draw a Property Area to view calculations
        
        .area-stats(v-else)
          el-table(:data="areaTableData" style="width: 100%" border)
            el-table-column(prop="name" label="Layer")
            el-table-column(prop="area" label="Area (ha)" width="100")
            el-table-column(prop="percentage" label="% of Property" width="120")
          
          .total-area
            strong Total Property Area: {{ propertyAreaTotal }} hectares
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  
  export default {
    name: 'AreaCalculationBoard',
    
    computed: {
      ...mapGetters('layers', ['hasPropertyArea', 'getLayerArea', 'getAllAreas']),
      
      areaTableData() {
        if (!this.hasPropertyArea) {
          return [];
        }
        
        const propertyAreaTotal = this.getLayerArea('property-area') || 0;
        
        return Object.entries(this.getAllAreas)
          .filter(([layerId]) => layerId !== 'property-area') // Exclude property area from the table
          .map(([layerId, area]) => {
            const layer = this.$store.getters['layers/getLayerById'](layerId);
            const percentage = propertyAreaTotal > 0 
              ? ((area / propertyAreaTotal) * 100).toFixed(2) 
              : '0.00';
            
            return {
              name: layer.name,
              area: area,
              percentage: `${percentage}%`
            };
          });
      },
      
      propertyAreaTotal() {
        return this.getLayerArea('property-area') || 0;
      }
    },
    
    methods: {
      ...mapActions('layers', ['calculateAreas']),
      
      recalculateAreas() {
        this.calculateAreas();
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .area-calculation-board {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 5;
    
    .area-board-container {
      width: 350px;
      
      .board-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 10px;
        border-bottom: 1px solid #e6e6e6;
        
        h3 {
          margin: 0;
          font-size: 16px;
        }
      }
      
      .board-body {
        .no-data {
          padding: 10px;
          text-align: center;
          color: #999;
        }
        
        .area-stats {
          .el-table {
            margin-bottom: 10px;
          }
          
          .total-area {
            text-align: right;
            padding: 5px;
            font-size: 14px;
          }
        }
      }
    }
  }
  </style>