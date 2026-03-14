<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { projectApi } from '../api/ProjectApi';
import type { Project } from '../models/Project';
import ProjectCard from './ProjectCard.vue';
import ProjectForm from './ProjectForm.vue';

const projects = ref<Project[]>([]);
const editingProject = ref<Project | null>(null);

const emit = defineEmits<{
  select: [project: Project];
}>();

async function loadProjects() {
  projects.value = await projectApi.list();
}

async function handleSave(name: string, description: string) {
  if (editingProject.value) {
    await projectApi.update({ id: editingProject.value.id, name, description });
    editingProject.value = null;
  } else {
    await projectApi.create({ name, description });
  }
  await loadProjects();
}

function handleEdit(project: Project) {
  editingProject.value = { ...project };
  document.getElementById('project-form')?.scrollIntoView({ behavior: 'smooth' });
}

async function handleDelete(id: string) {
  if (!confirm('Czy na pewno chcesz usunąć ten projekt?')) return;
  await projectApi.delete(id);
  if (editingProject.value?.id === id) {
    editingProject.value = null;
  }
  await loadProjects();
}

function handleCancel() {
  editingProject.value = null;
}

onMounted(loadProjects);
</script>

<template>
  <div id="project-list-container">
    <ProjectForm
      :editing-project="editingProject"
      @save="handleSave"
      @cancel="handleCancel"
    />

    <section class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-md">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">
          Twoje projekty
        </h2>
        <span
          class="inline-flex items-center justify-center min-w-[32px] h-8 px-2.5 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white text-xs font-bold"
          id="project-count"
        >
          {{ projects.length }}
        </span>
      </div>

      <div v-if="projects.length === 0" class="text-center py-12" id="empty-state">
        <p class="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">Nie masz jeszcze żadnych projektów.</p>
        <p class="text-sm text-slate-400">Dodaj swój pierwszy projekt powyżej!</p>
      </div>

      <TransitionGroup name="card" tag="div" class="flex flex-col gap-3" v-else>
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @select="(p) => emit('select', p)"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </TransitionGroup>
    </section>
  </div>  
</template>

<style scoped>
.card-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.card-leave-active {
  transition: all 0.25s ease-in;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
.card-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.96);
}
.card-move {
  transition: transform 0.3s ease;
}
</style>
