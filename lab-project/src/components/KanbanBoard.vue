<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { storyRepository } from '../repository/StoryRepository';
import { taskRepository } from '../repository/TaskRepository';
import { userManager } from '../auth/UserManager';
import type { Story } from '../models/Story';
import type { Task } from '../models/Task';
import type { User } from '../models/User';
import TaskDetail from './TaskDetail.vue';

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits<{
  'board-updated': [];
}>();

const tasks = ref<Task[]>([]);
const storiesMap = ref<Record<string, Story>>({});
const usersMap = ref<Record<string, User>>({});
const selectedTaskId = ref<string | null>(null);

const draggedTaskId = ref<string | null>(null);

async function loadData() {
  const storiesList = await storyRepository.listByProject(props.projectId);
  storiesMap.value = storiesList.reduce((acc, story) => {
    acc[story.id] = story;
    return acc;
  }, {} as Record<string, Story>);

  const storyIds = storiesList.map(s => s.id);
  tasks.value = await taskRepository.listByStoryIds(storyIds);
  
  const users = userManager.getAllUsers();
  usersMap.value = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, User>);
}

const todoTasks = computed(() => tasks.value.filter(t => t.state === 'todo'));
const doingTasks = computed(() => tasks.value.filter(t => t.state === 'doing'));
const doneTasks = computed(() => tasks.value.filter(t => t.state === 'done'));

function onDragStart(event: DragEvent, taskId: string) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('taskId', taskId);
  }
  draggedTaskId.value = taskId;
}

async function onDrop(event: DragEvent, columnState: 'todo' | 'doing' | 'done') {
  const taskId = event.dataTransfer?.getData('taskId') || draggedTaskId.value;
  draggedTaskId.value = null;
  
  if (!taskId) return;
  
  const task = tasks.value.find(t => t.id === taskId);
  if (!task || task.state === columnState) return;

  // Optymistyczna aktualizacja UI
  task.state = columnState;
  
  // Zapisz do repozytorium
  await taskRepository.update({ ...task });
  
  // Przelicz stan całej historyjki
  await recalculateStoryState(task.storyId);
  
  emit('board-updated');
}

async function recalculateStoryState(storyId: string) {
  const storyTasks = await taskRepository.listByStory(storyId);
  const allTodo = storyTasks.length > 0 ? storyTasks.every(t => t.state === 'todo') : true;
  const allDone = storyTasks.length > 0 && storyTasks.every(t => t.state === 'done');
  
  let newState: 'todo' | 'doing' | 'done' = 'doing';
  if (allDone) newState = 'done';
  else if (allTodo) newState = 'todo';

  const story = await storyRepository.getById(storyId);
  if (story && story.state !== newState) {
    story.state = newState;
    await storyRepository.update(story);
    // Odśwież lokalną kopię
    storiesMap.value[storyId] = story;
  }
}

watch(() => props.projectId, loadData);
onMounted(loadData);
</script>

<template>
  <div class="kanban-board-container" id="kanban-board">
    <TaskDetail
      v-if="selectedTaskId"
      :task-id="selectedTaskId"
      @close="selectedTaskId = null"
      @task-updated="loadData"
    />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <!-- TODO Column -->
      <div 
        class="flex flex-col bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 min-h-[500px]"
        @dragover.prevent
        @dragenter.prevent
        @drop="(e) => onDrop(e, 'todo')"
      >
        <div class="flex items-center justify-between mb-4 px-1">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            Do zrobienia
          </h3>
          <span class="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{{ todoTasks.length }}</span>
        </div>
        
        <div class="flex flex-col gap-3 flex-1">
          <div 
            v-for="task in todoTasks" 
            :key="task.id"
            draggable="true"
            @dragstart="(e) => onDragStart(e, task.id)"
            @click="selectedTaskId = task.id"
            class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-grab active:cursor-grabbing group"
            :class="{ 'opacity-50 blur-[1px]': draggedTaskId === task.id }"
          >
            <div class="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1.5 truncate" v-if="storiesMap[task.storyId]">
              {{ storiesMap[task.storyId].name }}
            </div>
            <h4 class="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug mb-3">
              {{ task.name }}
            </h4>
            <div class="flex items-center justify-between mt-auto">
              <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ task.realizedHours || 0 }}h
              </div>
              <div class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-[10px] font-bold border border-primary-200 dark:border-primary-800" v-if="task.assigneeId && usersMap[task.assigneeId]" :title="usersMap[task.assigneeId].firstName + ' ' + usersMap[task.assigneeId].lastName">
                {{ usersMap[task.assigneeId].firstName[0] }}{{ usersMap[task.assigneeId].lastName[0] }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DOING Column -->
      <div 
        class="flex flex-col bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 min-h-[500px]"
        @dragover.prevent
        @dragenter.prevent
        @drop="(e) => onDrop(e, 'doing')"
      >
        <div class="flex items-center justify-between mb-4 px-1">
          <h3 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            W trakcie
          </h3>
          <span class="text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{{ doingTasks.length }}</span>
        </div>
        
        <div class="flex flex-col gap-3 flex-1">
          <div 
            v-for="task in doingTasks" 
            :key="task.id"
            draggable="true"
            @dragstart="(e) => onDragStart(e, task.id)"
            @click="selectedTaskId = task.id"
            class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-grab active:cursor-grabbing group"
            :class="{ 'opacity-50 blur-[1px]': draggedTaskId === task.id }"
          >
            <div class="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1.5 truncate" v-if="storiesMap[task.storyId]">
              {{ storiesMap[task.storyId].name }}
            </div>
            <h4 class="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug mb-3">
              {{ task.name }}
            </h4>
            <div class="flex items-center justify-between mt-auto">
              <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ task.realizedHours || 0 }}h
              </div>
              <div class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center text-[10px] font-bold border border-primary-200 dark:border-primary-800" v-if="task.assigneeId && usersMap[task.assigneeId]" :title="usersMap[task.assigneeId].firstName + ' ' + usersMap[task.assigneeId].lastName">
                {{ usersMap[task.assigneeId].firstName[0] }}{{ usersMap[task.assigneeId].lastName[0] }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DONE Column -->
      <div 
        class="flex flex-col bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 min-h-[500px]"
        @dragover.prevent
        @dragenter.prevent
        @drop="(e) => onDrop(e, 'done')"
      >
        <div class="flex items-center justify-between mb-4 px-1">
          <h3 class="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Zrobione
          </h3>
          <span class="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">{{ doneTasks.length }}</span>
        </div>
        
        <div class="flex flex-col gap-3 flex-1">
          <div 
            v-for="task in doneTasks" 
            :key="task.id"
            draggable="true"
            @dragstart="(e) => onDragStart(e, task.id)"
            @click="selectedTaskId = task.id"
            class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-grab active:cursor-grabbing group opacity-75 hover:opacity-100"
            :class="{ 'opacity-50 blur-[1px]': draggedTaskId === task.id }"
          >
            <div class="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1.5 truncate line-through" v-if="storiesMap[task.storyId]">
              {{ storiesMap[task.storyId].name }}
            </div>
            <h4 class="text-sm font-medium text-slate-500 dark:text-slate-400 leading-snug mb-3 line-through">
              {{ task.name }}
            </h4>
            <div class="flex items-center justify-between mt-auto">
              <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 opacity-80">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {{ task.realizedHours || 0 }}h
              </div>
              <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold" v-if="task.assigneeId && usersMap[task.assigneeId]" :title="usersMap[task.assigneeId].firstName + ' ' + usersMap[task.assigneeId].lastName">
                {{ usersMap[task.assigneeId].firstName[0] }}{{ usersMap[task.assigneeId].lastName[0] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional styling to make the drag visual slightly smoother for Safari */
[draggable] {
  user-select: none;
}
</style>
