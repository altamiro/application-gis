<template lang="pug">
  .app
    el-container
      el-header(height="60px")
        h1 GIS Application
      el-container
        router-view
  </template>
  
  <script>
  export default {
    name: 'App'
  }
  </script>
  
  <style lang="scss">
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .el-header {
    background-color: #409EFF;
    color: white;
    display: flex;
    align-items: center;
    padding: 0 20px;
  }
  
  .el-container {
    height: 100%;
  }
  </style>