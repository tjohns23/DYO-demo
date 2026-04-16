'use client';

import { useState, useEffect } from 'react';

interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

export default function HomeRightPanel() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState('');
  const [mounted, setMounted] = useState(false);

  // Generate storage key based on today's local date
  const today = new Date();
  const storageKey = `dyo_todos_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Load todos from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setTodos(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse todos:', e);
      }
    }
    setMounted(true);
  }, [storageKey]);

  // Sync todos to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(storageKey, JSON.stringify(todos));
    }
  }, [todos, storageKey, mounted]);

  const addTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  };

  const removeTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col gap-4 pt-10">

      {/* Goals */}
      <div className="bg-(--glass-surface) border border-(--glass-border) rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-(--glass-text-muted) pb-3 border-b border-[rgba(255,255,255,0.05)] mb-4">
          Goals
        </div>
        <div className="flex flex-col items-center justify-center py-4 gap-3">
          <div className="w-9 h-9 rounded-full bg-(--glass-surface) border border-(--glass-border) flex items-center justify-center text-(--glass-text-dimmer) text-base">
            ◎
          </div>
          <div className="text-xs text-(--glass-text-dimmer) text-center font-mono uppercase tracking-[0.1em]">
            Coming soon
          </div>
        </div>
      </div>

      {/* To-do */}
      <div className="bg-(--glass-surface) border border-(--glass-border) rounded-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(255,255,255,0.05)]">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-(--glass-text-muted)">
            To-do
          </div>
          <span className="text-[7px] font-normal text-(--glass-text-dimmer) opacity-70 uppercase tracking-[0.1em]">Daily</span>
        </div>

        {/* Add todo */}
        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 min-w-0 bg-[rgba(255,255,255,0.025)] border border-(--glass-border) rounded-lg px-3 py-2 text-sm text-(--glass-text-primary) placeholder:text-(--glass-text-dimmer) outline-none focus:border-[rgba(224,48,96,0.35)] focus:shadow-[0_0_0_2px_rgba(224,48,96,0.06)] transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-3 py-2 rounded-lg bg-(--glass-accent) text-white font-mono text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[#f03870]"
          >
            +
          </button>
        </form>

        {/* Todo list */}
        {todos.length === 0 ? (
          <div className="text-xs text-(--glass-text-dimmer) text-center font-mono py-4 uppercase tracking-[0.1em]">
            No tasks yet
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.03)] group transition-colors"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-4 h-4 rounded shrink-0 border transition-all ${
                    todo.done
                      ? 'bg-(--glass-accent) border-(--glass-accent)'
                      : 'border-(--glass-border) hover:border-[rgba(224,48,96,0.4)]'
                  }`}
                >
                  {todo.done && (
                    <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={`flex-1 text-sm leading-snug transition-colors ${todo.done ? 'line-through text-(--glass-text-dimmer)' : 'text-(--glass-text-secondary)'}`}>
                  {todo.text}
                </span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 text-(--glass-text-dimmer) hover:text-(--glass-text-muted) text-xs transition-all leading-none"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
