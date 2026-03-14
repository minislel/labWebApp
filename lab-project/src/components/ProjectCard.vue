<script setup lang="ts">
import type { Project } from '../models/Project';

defineProps<{
  project: Project;
}>();

const emit = defineEmits<{
  edit: [project: Project];
  delete: [id: string];
}>();
</script>

<template>
  <div
    class="flex items-start justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all hover:border-primary-300 dark:hover:border-primary-500/40 hover:shadow-md hover:-translate-y-0.5"
    :id="`project-card-${project.id}`"
  >
    <div class="flex-1 min-w-0">
      <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">{{ project.name }}</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2 line-clamp-3">{{ project.description }}</p>
      <span class="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-md">
        ID: {{ project.id }}
      </span>
    </div>
    <div class="flex gap-1 shrink-0">
      <button
        class="w-9 h-9 flex items-center justify-center rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer"
        :id="`edit-btn-${project.id}`"
        title="Edytuj projekt"
        @click="emit('edit', project)"
      >
        ✏️
      </button>
      <button
        class="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
        :id="`delete-btn-${project.id}`"
        title="Usuń projekt"
        @click="emit('delete', project.id)"
      >
        🗑️
      </button>
    </div>
  </div>
</template>
