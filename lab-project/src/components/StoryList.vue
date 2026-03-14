<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { storyApi } from '../api/StoryApi';
import { userManager } from '../auth/UserManager';
import type { Story, StoryPriority, StoryState } from '../models/Story';
import StoryCard from './StoryCard.vue';
import StoryForm from './StoryForm.vue';

const props = defineProps<{
  projectId: string;
}>();

const stories = ref<Story[]>([]);
const editingStory = ref<Story | null>(null);
const activeFilter = ref<StoryState | 'all'>('all');

const currentUser = userManager.getUser();
const ownerId = currentUser?.id ?? '';

async function loadStories() {
  stories.value = await storyApi.listByProject(props.projectId);
}

const filteredStories = computed(() => {
  if (activeFilter.value === 'all') return stories.value;
  return stories.value.filter((s) => s.state === activeFilter.value);
});

const countByState = computed(() => ({
  all: stories.value.length,
  todo: stories.value.filter((s) => s.state === 'todo').length,
  doing: stories.value.filter((s) => s.state === 'doing').length,
  done: stories.value.filter((s) => s.state === 'done').length,
}));

async function handleSave(payload: { name: string; description: string; priority: StoryPriority; state: StoryState }) {
  if (editingStory.value) {
    await storyApi.update({
      ...editingStory.value,
      ...payload,
    });
    editingStory.value = null;
  } else {
    await storyApi.create({
      ...payload,
      projectId: props.projectId,
      ownerId,
    });
  }
  await loadStories();
}

function handleEdit(story: Story) {
  editingStory.value = { ...story };
  document.getElementById('story-form')?.scrollIntoView({ behavior: 'smooth' });
}

async function handleDelete(id: string) {
  if (!confirm('Czy na pewno chcesz usunąć tę historyjkę?')) return;
  await storyApi.delete(id);
  if (editingStory.value?.id === id) {
    editingStory.value = null;
  }
  await loadStories();
}

function handleCancel() {
  editingStory.value = null;
}

const filters: { value: StoryState | 'all'; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'todo', label: 'Do zrobienia' },
  { value: 'doing', label: 'W trakcie' },
  { value: 'done', label: 'Zrobione' },
];

onMounted(loadStories);
</script>

<template>
  <div id="story-list-container">
    <StoryForm
      :editing-story="editingStory"
      :project-id="projectId"
      :owner-id="ownerId"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <section class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-md">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
          Historyjki
        </h3>
        <span
          class="inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white text-xs font-bold"
          id="story-count"
        >
          {{ countByState[activeFilter] }}
        </span>
      </div>

      <div class="flex gap-2 mb-6 flex-wrap" id="story-filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer"
          :class="activeFilter === filter.value
            ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/25'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary-300 hover:text-primary-600'"
          :id="`filter-${filter.value}`"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
          <span
            class="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            :class="activeFilter === filter.value
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
          >
            {{ countByState[filter.value] }}
          </span>
        </button>
      </div>

      <div v-if="filteredStories.length === 0" class="text-center py-10" id="story-empty-state">
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">
          {{ activeFilter === 'all' ? 'Brak historyjek w tym projekcie.' : 'Brak historyjek w tym stanie.' }}
        </p>
      </div>

      <TransitionGroup name="story-card" tag="div" class="flex flex-col gap-3" v-else>
        <StoryCard
          v-for="story in filteredStories"
          :key="story.id"
          :story="story"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </TransitionGroup>
    </section>
  </div>
</template>

<style scoped>
.story-card-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.story-card-leave-active {
  transition: all 0.25s ease-in;
}
.story-card-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
.story-card-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.96);
}
.story-card-move {
  transition: transform 0.3s ease;
}
</style>
