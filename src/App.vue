<script setup>
import WorkArea from './components/WorkArea.vue';
import StagingArea from './components/StagingArea.vue';
import RepoArea from './components/RepoArea.vue';

</script>

<template>
  <div class="container">
    <WorkArea />
    <StagingArea />
    <RepoArea />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: space-around;
  margin-top: 50px;
  height: 90%;
}

.container>div {
  border: 1px solid #ddd;
  padding: 10px;
  width: 30%;
}
</style>
