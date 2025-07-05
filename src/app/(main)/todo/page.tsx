"use client";

import { useState } from "react";

interface ITodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  category: string;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<ITodoItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const categories = ["仕事", "家計", "買い物", "健康", "その他"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingId
            ? { ...todo, title, description, dueDate, priority, category }
            : todo,
        ),
      );
      setEditingId(null);
    } else {
      const newTodo: ITodoItem = {
        id: Date.now().toString(),
        title,
        description,
        completed: false,
        dueDate: dueDate || undefined,
        priority,
        category,
      };
      setTodos([...todos, newTodo]);
    }

    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setCategory("");
  };

  const handleToggleComplete = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleEdit = (todo: ITodoItem) => {
    setEditingId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description);
    setDueDate(todo.dueDate || "");
    setPriority(todo.priority);
    setCategory(todo.category);
  };

  const handleDelete = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("medium");
    setCategory("");
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "pending") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">ToDo管理</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4"
      >
        <h2 className="text-lg sm:text-xl font-semibold">
          {editingId ? "ToDoを編集" : "新しいToDoを追加"}
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
            placeholder="ToDoのタイトル"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base h-20"
            placeholder="詳細な説明（任意）"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              期限
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              優先度
            </label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "low" | "medium" | "high")
              }
              className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              カテゴリー
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm sm:text-base"
              required
            >
              <option value="">選択してください</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex-1 text-sm sm:text-base"
          >
            {editingId ? "更新" : "追加"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 text-sm sm:text-base"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>

      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">ToDoリスト</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded text-xs sm:text-sm ${filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              全て
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1 rounded text-xs sm:text-sm ${filter === "pending" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              未完了
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded text-xs sm:text-sm ${filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              完了済み
            </button>
          </div>
        </div>

        {filteredTodos.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm sm:text-base">
            {filter === "all"
              ? "ToDoはまだありません"
              : filter === "pending"
                ? "未完了のToDoはありません"
                : "完了したToDoはありません"}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`border rounded-lg p-3 ${todo.completed ? "bg-gray-50" : "bg-white"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-medium ${todo.completed ? "line-through text-gray-500" : ""}`}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p
                          className={`text-sm text-gray-600 mt-1 ${todo.completed ? "line-through" : ""}`}
                        >
                          {todo.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {todo.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}
                        >
                          優先度:{" "}
                          {todo.priority === "high"
                            ? "高"
                            : todo.priority === "medium"
                              ? "中"
                              : "低"}
                        </span>
                        {todo.dueDate && (
                          <span className="bg-blue-100 px-2 py-1 rounded">
                            期限:{" "}
                            {new Date(todo.dueDate).toLocaleDateString("ja-JP")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <button
                      onClick={() => handleEdit(todo)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
