<template>
  <div class="sw-card m-8 py-6 px-4 shadow-lg rounded-md bg-white">
    <div class="min-h-[50px] empty:hidden">
      <slot name="header" />
    </div>
    <div class="min-h-[100px]">
      <slot />
    </div>
  </div>
</template>
