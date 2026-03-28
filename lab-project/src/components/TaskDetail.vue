<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { Task } from '../models/Task';
import type { Story } from '../models/Story';
import type { User } from '../models/User';
import { taskRepository } from '../repository/TaskRepository';
import { storyRepository } from '../repository/StoryRepository';
import { userManager } from '../auth/UserManager';

import TaskForm from './TaskForm.vue';

const props = defineProps<{
  taskId: string;
}>();

const emit = defineEmits<{
  close: [];
  'task-updated': [];
}>();

const task = ref<Task | null>(null);
const story = ref<Story | null>(null);
const assignee = ref<User | null>(null);
const loading = ref(true);
const formattedStartDate = ref('');
const isEditing = ref(false);

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

async function loadData() {
  loading.value = true;
  task.value = await taskRepository.getById(props.taskId);
  
  if (task.value) {
    story.value = await storyRepository.getById(task.value.storyId) || null;
    
    if (task.value.assigneeId) {
      assignee.value = userManager.getAllUsers().find(u => u.id === task.value?.assigneeId) || null;
    } else {
      assignee.value = null;
    }

    if (task.value.startDate) {
      formattedStartDate.value = new Date(task.value.startDate).toLocaleDateString('pl-PL', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } else {
      formattedStartDate.value = 'Brak danych';
    }
  }
  loading.value = false;
}

watch(() => props.taskId, loadData);
onMounted(loadData);
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all">
      
      <!-- Nagłówek -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Szczegóły Zadania</h2>
        <div class="flex items-center gap-2">
          <button
            @click="isEditing = true"
            class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            Edytuj
          </button>
          <button
            @click="emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Zamknij"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto" v-if="!loading && task">
        <div class="mb-6">
          <div class="flex items-start justify-between gap-3 mb-2">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">{{ task.name }}</h3>
            <span
              class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
              :class="stateColor[task.state]"
            >
              {{ stateLabel[task.state] }}
            </span>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">{{ task.description || 'Brak opisu zadania.' }}</p>
        </div>

        <div class="space-y-4">
          <!-- Story -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Przypisana historyjka</div>
            <div class="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              {{ story?.name || 'Nieprawidłowa historyjka' }}
            </div>
          </div>

          <!-- Grid details -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Data startu</div>
              <div class="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {{ formattedStartDate }}
              </div>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Zrealizowane godziny</div>
              <div class="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span class="text-lg font-bold">{{ task.realizedHours }}</span> <span class="text-slate-500 text-xs">h</span>
              </div>
            </div>
          </div>

          <!-- Assignee -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Przypisana osoba</div>
              <div class="text-sm font-medium text-slate-800 dark:text-slate-200" v-if="assignee">
                {{ assignee.firstName }} {{ assignee.lastName }}
                <span class="ml-1 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase">{{ assignee.role }}</span>
              </div>
              <div class="text-sm text-amber-600 dark:text-amber-500 italic" v-else>Brak przypisanej osoby</div>
            </div>
            <div v-if="assignee" class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold border border-primary-200 dark:border-primary-800/50">
              {{ assignee.firstName[0] }}{{ assignee.lastName[0] }}
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 text-center text-slate-500" v-else-if="loading">
        Ładowanie szczegółów zadania...
      </div>
      <div class="p-6 text-center text-red-500" v-else>
        Nie znaleziono zadania.
      </div>
    </div>

    <!-- Pływający formularz edycji -->
    <TaskForm 
      v-if="isEditing && task" 
      :story-id="task.storyId" 
      :editing-task-id="task.id" 
      @save="() => { isEditing = false; loadData(); emit('task-updated'); }" 
      @cancel="isEditing = false" 
    />
  </div>
</template>
