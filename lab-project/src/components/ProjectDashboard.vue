<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Project } from '../models/Project';
import type { Story } from '../models/Story';
import { storyApi } from '../api/StoryApi';
import StoryList from './StoryList.vue';

const props = defineProps<{
  project: Project;
}>();

const emit = defineEmits<{
  back: [];
}>();

const stories = ref<Story[]>([]);

async function loadStories() {
  stories.value = await storyApi.listByProject(props.project.id);
}

const storyCount = computed(() => stories.value.length);
const doingCount = computed(() => stories.value.filter((s) => s.state === 'doing').length);
const doneCount = computed(() => stories.value.filter((s) => s.state === 'done').length);

const progressPercent = computed(() => {
  if (stories.value.length === 0) return 0;
  return Math.round((doneCount.value / stories.value.length) * 100);
});

onMounted(loadStories);
</script>

<template>
  <div id="project-dashboard">
    <button
      class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 mb-6 transition-colors cursor-pointer group"
      id="back-to-projects-btn"
      @click="emit('back')"
    >
      Zmień projekt
    </button>

    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-lg mb-8">
      <div class="flex items-start gap-4 mb-6">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-primary-500/25 shrink-0">
          {{ project.name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{{ project.name }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{{ project.description }}</p>
        </div>
      </div>

      <div class="border-t border-slate-200 dark:border-slate-700 pt-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">{{ storyCount }}</div>
            <div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Historyjki</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ doingCount }}</div>
            <div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">W trakcie</div>
          </div>
          <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ progressPercent }}%</div>
            <div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Ukończono</div>
          </div>
        </div>
      </div>
    </div>

    <StoryList :project-id="project.id" @stories-changed="loadStories" />
  </div>
</template>
