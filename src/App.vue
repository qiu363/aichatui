<template>
  <RouterView />
</template>

<script setup lang="ts">
</script>

<style lang="less" scoped>
</style>

<style lang="less">
  .ai-loading {
    display: inline-block;
    width: 12px;
    height: 12px;
    background: #000;
    border-radius: 50px;
    vertical-align: middle;
    animation: slidein 1s infinite linear;
  }

  @keyframes slidein {
    0% {
      opacity: 0.8;
    }

    50% {
      opacity: 0.2;
    }

    100% {
      opacity: 0.8;
    }
  }
</style>
