<script setup lang="ts">
import { ref } from 'vue';
import ExInputSetter from './setters/ExInputSetter.vue';

const value = ref('');

const change = (e: any) => {
  value.value = e;
}

</script>

<template>
  <div class="root">
    <span>value: {{ value }}</span>
    <ExInputSetter :value="value" @change="change" />
  </div>
</template>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  color: #333;
}
</style>
