<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ProjectList from './components/ProjectList.vue';
import ProjectDashboard from './components/ProjectDashboard.vue';
import { userManager } from './auth/UserManager';
import { activeProjectApi } from './api/ActiveProjectApi';
import { projectApi } from './api/ProjectApi';
import type { Project } from './models/Project';

const userName = userManager.getFullName();
const activeProject = ref<Project | null>(null);

async function selectProject(project: Project) {
  activeProjectApi.set(project.id);
  activeProject.value = project;
}

function clearActiveProject() {
  activeProjectApi.clear();
  activeProject.value = null;
}

onMounted(async () => {
  const savedId = activeProjectApi.get();
  if (savedId) {
    const project = await projectApi.getById(savedId);
    if (project) {
      activeProject.value = project;
    } else {
      activeProjectApi.clear();
    }
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans">
    <header class="bg-gradient-to-r from-primary-800 via-primary-600 to-cyan-500 px-6 py-12 pb-14 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08)_0%,transparent_40%)] pointer-events-none"></div>

      <div class="absolute top-4 right-6 z-20 flex items-center gap-2.5" id="user-badge">
        <div class="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white/30">
          {{ userName.split(' ').map(n => n[0]).join('') }}
        </div>
        <span class="text-white/90 text-sm font-medium tracking-wide hidden sm:inline">{{ userName }}</span>
      </div>

      <div class="relative z-10 max-w-xl mx-auto">
        <div class="flex items-center justify-center gap-3.5 mb-2">
          <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">ManageMe</h1>
        </div>
        <p class="text-white/85 text-base tracking-wide">
          {{ activeProject ? activeProject.name : 'Zarządzaj swoimi projektami' }}
        </p>
      </div>
    </header>

    <main class="flex-1 w-full max-w-3xl mx-auto -mt-8 px-4 pb-12 relative z-10">
      <ProjectDashboard
        v-if="activeProject"
        :project="activeProject"
        @back="clearActiveProject"
      />
      <ProjectList v-else @select="selectProject" />
    </main>

    <footer class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm border-t border-slate-200 dark:border-slate-700" id="app-footer">
      <p>ManageMe &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>
