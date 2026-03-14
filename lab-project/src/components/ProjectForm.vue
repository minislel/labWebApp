<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Project } from '../models/Project';

const props = defineProps<{
  editingProject?: Project | null;
}>();

const emit = defineEmits<{
  save: [name: string, description: string];
  cancel: [];
}>();

const name = ref('');
const description = ref('');
const errors = ref<{ name?: string; description?: string }>({});

watch(
  () => props.editingProject,
  (project) => {
    if (project) {
      name.value = project.name;
      description.value = project.description;
    } else {
      name.value = '';
      description.value = '';
    }
    errors.value = {};
  },
  { immediate: true }
);

function validate(): boolean {
  errors.value = {};
  if (!name.value.trim()) {
    errors.value.name = 'Nazwa projektu jest wymagana.';
  }
  if (!description.value.trim()) {
    errors.value.description = 'Opis projektu jest wymagany.';
  }
  return Object.keys(errors.value).length === 0;
}

function handleSubmit() {
  if (!validate()) return;
  emit('save', name.value.trim(), description.value.trim());
  name.value = '';
  description.value = '';
  errors.value = {};
}

function handleCancel() {
  name.value = '';
  description.value = '';
  errors.value = {};
  emit('cancel');
}
</script>

<template>
  <form
    class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-lg mb-8 transition-shadow focus-within:shadow-xl focus-within:shadow-primary-500/10"
    @submit.prevent="handleSubmit"
    id="project-form"
  >
    <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
      {{ editingProject ? 'Edytuj projekt' : 'Nowy projekt' }}
    </h2>

    <div class="mb-5">
      <label for="project-name" class="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
        Nazwa projektu
      </label>
      <input
        id="project-name"
        v-model="name"
        type="text"
        class="w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-[1.5px] rounded-xl outline-none transition-all placeholder:text-slate-400"
        :class="errors.name ? 'border-red-500 shadow-red-500/10 shadow-md' : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 focus:border-primary-600 focus:shadow-primary-500/10 focus:shadow-md'"
        placeholder="Wpisz nazwę projektu..."
        autocomplete="off"
      />
      <span v-if="errors.name" class="block text-red-500 text-xs font-medium mt-1.5 animate-pulse">{{ errors.name }}</span>
    </div>

    <div class="mb-5">
      <label for="project-description" class="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
        Opis projektu
      </label>
      <textarea
        id="project-description"
        v-model="description"
        class="w-full px-4 py-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border-[1.5px] rounded-xl outline-none transition-all resize-y min-h-[100px] placeholder:text-slate-400"
        :class="errors.description ? 'border-red-500 shadow-red-500/10 shadow-md' : 'border-slate-200 dark:border-slate-600 hover:border-primary-300 focus:border-primary-600 focus:shadow-primary-500/10 focus:shadow-md'"
        placeholder="Opisz swój projekt..."
        rows="4"
      ></textarea>
      <span v-if="errors.description" class="block text-red-500 text-xs font-medium mt-1.5 animate-pulse">{{ errors.description }}</span>
    </div>

    <div class="flex gap-3 mt-6">
      <button
        type="submit"
        class="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl shadow-md shadow-primary-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/35 active:translate-y-0 transition-all cursor-pointer"
        id="project-submit-btn"
      >
        {{ editingProject ? 'Zapisz zmiany' : 'Dodaj projekt' }}
      </button>
      <button
        v-if="editingProject"
        type="button"
        class="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border-[1.5px] border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
        id="project-cancel-btn"
        @click="handleCancel"
      >
        Anuluj
      </button>
    </div>
  </form>
</template>
