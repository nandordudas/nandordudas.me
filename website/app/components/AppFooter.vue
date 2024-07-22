<script setup lang="ts">
function _getCopyrightYear(baseYear: number) {
  const currentYear = new Date().getFullYear()

  if (currentYear === baseYear)
    return baseYear.toString()

  return `${baseYear} - ${currentYear}`
}

const getCopyrightYear = computed(() => _getCopyrightYear(2024))
</script>

<template>
  <UFooter>
    <template #left>
      Copyright &copy; {{ getCopyrightYear }}
    </template>
  </UFooter>
</template>
