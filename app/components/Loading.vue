<template>
  <div v-if="isLoading">
    Loading...
  </div>
  <slot v-else />
</template>
<script setup>
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: () => false,
  },
})
</script>
