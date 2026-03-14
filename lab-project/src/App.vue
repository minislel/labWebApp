<script setup lang="ts">
import ProjectList from './components/ProjectList.vue';
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans">
    <header class="bg-gradient-to-r from-primary-800 via-primary-600 to-cyan-500 px-6 py-12 pb-14 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08)_0%,transparent_40%)] pointer-events-none"></div>
      <div class="relative z-10 max-w-xl mx-auto">
        <div class="flex items-center justify-center gap-3.5 mb-2">
          <span class="text-4xl drop-shadow-lg">📊</span>
          <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">ManageMe</h1>
        </div>
        <p class="text-white/85 text-base tracking-wide">Zarządzaj swoimi projektami</p>
      </div>
    </header>

    <main class="flex-1 w-full max-w-3xl mx-auto -mt-8 px-4 pb-12 relative z-10">
      <ProjectList />
    </main>

    <footer class="text-center py-6 text-slate-400 dark:text-slate-500 text-sm border-t border-slate-200 dark:border-slate-700" id="app-footer">
      <p>ManageMe &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>
