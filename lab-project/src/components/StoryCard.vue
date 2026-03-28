<script setup lang="ts">
import type { Story } from '../models/Story';

const props = defineProps<{
  story: Story;
}>();

const emit = defineEmits<{
  edit: [story: Story];
  delete: [id: string];
  'task-click': [taskId: string];
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

import { ref, onMounted } from 'vue';
import type { Task } from '../models/Task';
import { taskRepository } from '../repository/TaskRepository';
import TaskForm from './TaskForm.vue';

const tasks = ref<Task[]>([]);
const isCreatingTask = ref(false);

async function loadTasks() {
  tasks.value = await taskRepository.listByStory(props.story.id);
}

async function onTaskSaved() {
  isCreatingTask.value = false;
  await loadTasks();
}

async function toggleTaskState(task: Task) {
  task.state = task.state === 'done' ? 'todo' : 'done';
  await taskRepository.update(task);
}

onMounted(loadTasks);
</script>

<template>
  <div
    class="flex flex-col gap-4 p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all hover:border-primary-300 dark:hover:border-primary-500/40 hover:shadow-md hover:-translate-y-0.5"
    :id="`story-card-${story.id}`"
  >
    <div class="flex items-start justify-between gap-4">
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

    <!-- SEKCJA TASKÓW -->
    <div class="mt-2 pt-4 border-t border-slate-200 dark:border-slate-800/80">
      <h5 class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
        Zadania
        <span class="text-xs font-normal text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{{ tasks.length }}</span>
      </h5>
      
      <!-- Dodawanie taska -->
      <div class="mb-4 mt-2">
        <button @click="isCreatingTask = true" class="w-full flex items-center justify-center gap-2 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Dodaj zadanie
        </button>
      </div>
      
      <!-- Lista tasków -->
      <ul class="space-y-1.5 list-none m-0 p-0">
        <li
          v-for="task in tasks"
          :key="task.id"
          @click="emit('task-click', task.id)"
          class="flex items-center justify-between gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors group cursor-pointer"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0 pointer-events-none">
            <input 
              type="checkbox" 
              :checked="task.state === 'done'" 
              @click.stop 
              @change="toggleTaskState(task)"
              class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600 shrink-0 cursor-pointer pointer-events-auto" 
            />
            <span class="text-sm text-slate-700 dark:text-slate-300 truncate transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400" :class="{ 'line-through text-slate-400 dark:text-slate-500': task.state === 'done' }">
              {{ task.name }}
            </span>
          </div>
          <button class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-500 transition-opacity text-xs cursor-pointer font-medium px-2 py-1 shrink-0">
            Szczegóły
          </button>
        </li>
        <li v-if="tasks.length === 0" class="text-xs text-slate-500 text-center py-2">
          Brak zadań.
        </li>
      </ul>
    </div>

    <!-- Formularz dodawania zadania -->
    <TaskForm
      v-if="isCreatingTask"
      :story-id="story.id"
      @save="onTaskSaved"
      @cancel="isCreatingTask = false"
    />
  </div>
</template>
