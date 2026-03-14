<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Story, StoryPriority, StoryState } from '../models/Story';

const props = defineProps<{
  editingStory?: Story | null;
  projectId: string;
  ownerId: string;
}>();

const emit = defineEmits<{
  save: [payload: { name: string; description: string; priority: StoryPriority; state: StoryState }];
  cancel: [];
}>();

const name = ref('');
const description = ref('');
const priority = ref<StoryPriority>('medium');
const state = ref<StoryState>('todo');
const errors = ref<{ name?: string; description?: string }>({});

watch(
  () => props.editingStory,
  (story) => {
    if (story) {
      name.value = story.name;
      description.value = story.description;
      priority.value = story.priority;
      state.value = story.state;
    } else {
      name.value = '';
      description.value = '';
      priority.value = 'medium';
      state.value = 'todo';
    }
    errors.value = {};
  },
  { immediate: true }
);

function validate(): boolean {
  errors.value = {};
  if (!name.value.trim()) {
    errors.value.name = 'Nazwa historyjki jest wymagana.';
  }
  if (!description.value.trim()) {
    errors.value.description = 'Opis historyjki jest wymagany.';
  }
  return Object.keys(errors.value).length === 0;
}

function handleSubmit() {
  if (!validate()) return;
  emit('save', {
    name: name.value.trim(),
    description: description.value.trim(),
    priority: priority.value,
    state: state.value,
  });
  name.value = '';
  description.value = '';
  priority.value = 'medium';
  state.value = 'todo';
  errors.value = {};
}

function handleCancel() {
  name.value = '';
  description.value = '';
  priority.value = 'medium';
  state.value = 'todo';
  errors.value = {};
  emit('cancel');
}

const priorityOptions: { value: StoryPriority; label: string }[] = [
  { value: 'low', label: 'Niski' },
  { value: 'medium', label: 'Średni' },
  { value: 'high', label: 'Wysoki' },
];

const stateOptions: { value: StoryState; label: string }[] = [
  { value: 'todo', label: 'Do zrobienia' },
  { value: 'doing', label: 'W trakcie' },
  { value: 'done', label: 'Zrobione' },
];
</script>

<template>
  <form
    class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-lg mb-8 transition-shadow focus-within:shadow-xl focus-within:shadow-primary-500/10"
    @submit.prevent="handleSubmit"
    id="story-form"
  >
    <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
      {{ editingStory ? 'Edytuj historyjkę' : 'Nowa historyjka' }}
    </h3>

    <div class="mb-5">
      <label for="story-name" class="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
        Nazwa
      </label>
      <input
        id="story-name"
        v-model="name"
        type="text"
        class="w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-[1.5px] rounded-xl outline-none transition-all placeholder:text-slate-400"
        :class="errors.name ? 'border-red-500 shadow-red-500/10 shadow-md' : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 focus:border-primary-600 focus:shadow-primary-500/10 focus:shadow-md'"
        placeholder="Wpisz nazwę historyjki..."
        autocomplete="off"
      />
      <span v-if="errors.name" class="block text-red-500 text-xs font-medium mt-1.5 animate-pulse">{{ errors.name }}</span>
    </div>

    <div class="mb-5">
      <label for="story-description" class="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
        Opis
      </label>
      <textarea
        id="story-description"
        v-model="description"
        class="w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-[1.5px] rounded-xl outline-none transition-all resize-y min-h-[80px] placeholder:text-slate-400"
        :class="errors.description ? 'border-red-500 shadow-red-500/10 shadow-md' : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 focus:border-primary-600 focus:shadow-primary-500/10 focus:shadow-md'"
        placeholder="Opisz historyjkę..."
        rows="3"
      ></textarea>
      <span v-if="errors.description" class="block text-red-500 text-xs font-medium mt-1.5 animate-pulse">{{ errors.description }}</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
      <div>
        <label for="story-priority" class="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
          Priorytet
        </label>
        <select
          id="story-priority"
          v-model="priority"
          class="w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-[1.5px] border-slate-200 dark:border-slate-600 rounded-xl outline-none transition-all hover:border-primary-300 focus:border-primary-600 focus:shadow-primary-500/10 focus:shadow-md cursor-pointer"
        >
          <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <div>
        <label for="story-state" class="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
          Stan
        </label>
        <select
          id="story-state"
          v-model="state"
          class="w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-[1.5px] border-slate-200 dark:border-slate-600 rounded-xl outline-none transition-all hover:border-primary-300 focus:border-primary-600 focus:shadow-primary-500/10 focus:shadow-md cursor-pointer"
        >
          <option v-for="opt in stateOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <div class="flex gap-3 mt-6">
      <button
        type="submit"
        class="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-md shadow-primary-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/35 active:translate-y-0 transition-all cursor-pointer"
        id="story-submit-btn"
      >
        {{ editingStory ? 'Zapisz zmiany' : 'Dodaj historyjkę' }}
      </button>
      <button
        v-if="editingStory"
        type="button"
        class="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border-[1.5px] border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
        id="story-cancel-btn"
        @click="handleCancel"
      >
        Anuluj
      </button>
    </div>
  </form>
</template>
