<script setup lang="ts">
import type { Story } from '../models/Story';

defineProps<{
  story: Story;
}>();

const emit = defineEmits<{
  edit: [story: Story];
  delete: [id: string];
}>();

const priorityLabel: Record<string, string> = {
  low: 'Niski',
  medium: 'Średni',
  high: 'Wysoki',
};

const priorityColor: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
};

const stateLabel: Record<string, string> = {
  todo: 'Do zrobienia',
  doing: 'W trakcie',
  done: 'Zrobione',
};

const stateColor: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-600/30 dark:text-slate-300',
  doing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
};
</script>

<template>
  <div
    class="flex items-start justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all hover:border-primary-300 dark:hover:border-primary-500/40 hover:shadow-md hover:-translate-y-0.5"
    :id="`story-card-${story.id}`"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1.5 flex-wrap">
        <h4 class="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{{ story.name }}</h4>
        <span
          class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          :class="priorityColor[story.priority]"
        >
          {{ priorityLabel[story.priority] }}
        </span>
        <span
          class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          :class="stateColor[story.state]"
        >
          {{ stateLabel[story.state] }}
        </span>
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2 line-clamp-2">{{ story.description }}</p>
      <span class="text-[11px] text-slate-400 dark:text-slate-500">
        {{ new Date(story.createdAt).toLocaleDateString('pl-PL') }}
      </span>
    </div>
    <div class="flex gap-1 shrink-0">
      <button
        class="w-9 h-9 flex items-center justify-center rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer"
        :id="`story-edit-btn-${story.id}`"
        title="Edytuj historyjkę"
        @click="emit('edit', story)"
      >
        Edytuj
      </button>
      <button
        class="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
        :id="`story-delete-btn-${story.id}`"
        title="Usuń historyjkę"
        @click="emit('delete', story.id)"
      >
        Usuń
      </button>
    </div>
  </div>
</template>
