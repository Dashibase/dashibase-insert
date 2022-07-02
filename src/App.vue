<template>
  <div class="min-h-screen flex flex-col">
    <router-view :key="route.fullPath" />
  </div>
  <LoadData :key="route.fullPath" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import LoadData from './components/LoadData.vue'

const route = useRoute()
</script>
