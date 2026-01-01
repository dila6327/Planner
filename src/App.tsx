import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import Confetti from "react-confetti";
import "./App.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Goal = {
  id: number;
  title: string;
  category: string;
  progress: number;
  month: string;
  priority: "High" | "Medium" | "Low";
  subtasks: { id: number; text: string; done: boolean }[];
};

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function App() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Career");
  const [month, setMonth] = useState("January");
  const [priority, setPriority] = useState<Goal["priority"]>("Medium");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");

  const [showConfetti, setShowConfetti] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem("goals");
    const savedMode = localStorage.getItem("darkMode");
    const savedFilters = localStorage.getItem("filters");
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedMode) setDarkMode(JSON.parse(savedMode));
    if (savedFilters) {
      const { category, priority, month } = JSON.parse(savedFilters);
      setFilterCategory(category);
      setFilterPriority(priority);
      setFilterMonth(month);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(
      "filters",
      JSON.stringify({
        category: filterCategory,
        priority: filterPriority,
        month: filterMonth,
      })
    );
  }, [filterCategory, filterPriority, filterMonth]);

  // Add goal
  const addGoal = () => {
    if (!title.trim()) return;
    setGoals([
      ...goals,
      {
        id: Date.now(),
        title,
        category,
        progress: 0,
        month,
        priority,
        subtasks: [],
      },
    ]);
    setTitle("");
  };

  // Delete goal
  const deleteGoal = (goalId: number) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  const addSubtask = (goalId: number, text: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              subtasks: [
                ...goal.subtasks,
                { id: Date.now(), text, done: false },
              ],
            }
          : goal
      )
    );
  };

  const toggleSubtask = (goalId: number, subtaskId: number) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === goalId) {
          const updatedSubtasks = goal.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, done: !st.done } : st
          );

          const newProgress =
            updatedSubtasks.length === 0
              ? 0
              : Math.round(
                  (updatedSubtasks.filter((st) => st.done).length /
                    updatedSubtasks.length) *
                    100
                );

          if (newProgress === 100) setShowConfetti(true);

          return { ...goal, subtasks: updatedSubtasks, progress: newProgress };
        }
        return goal;
      })
    );
  };

  const resetYear = () => {
    setGoals([]);
    setShowConfetti(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const calculateMonthlyProgress = () => {
    const categories = ["Health", "Career", "Learning"] as const;
    const summary: { [key: string]: number } = {};
    categories.forEach((cat) => {
      const catGoals = goals.filter((g) => g.category === cat);
      summary[cat] =
        catGoals.length === 0
          ? 0
          : Math.round(
              catGoals.reduce((acc, g) => acc + g.progress, 0) / catGoals.length
            );
    });
    return summary;
  };

  const chartData = {
    labels: ["Health", "Career", "Learning"],
    datasets: [
      {
        label: "Monthly Progress %",
        data: Object.values(calculateMonthlyProgress()),
        backgroundColor: ["#16a34a", "#2563eb", "#f59e0b"],
      },
    ],
  };

  const filteredGoals = goals.filter((g) => {
    const categoryCheck =
      filterCategory === "All" || g.category === filterCategory;
    const priorityCheck =
      filterPriority === "All" || g.priority === filterPriority;
    const monthCheck = filterMonth === "All" || g.month === filterMonth;
    return categoryCheck && priorityCheck && monthCheck;
  });

  return (
    <div className={darkMode ? "container dark" : "container"}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      <header>
        <h1>New Year Planning Toolkit</h1>
        <p>Plan smarter. Start fresh. Stay consistent.</p>
        <button className="dark-toggle" onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      <section className="form">
        <input
          type="text"
          placeholder="Enter your goal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Career</option>
          <option>Learning</option>
          <option>Health</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Goal["priority"])}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          {months.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <button onClick={addGoal}>Add Goal</button>
      </section>

      <section className="filter">
        <div className="filter-card">
          <label>Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option>All</option>
            <option>Health</option>
            <option>Career</option>
            <option>Learning</option>
          </select>
        </div>

        <div className="filter-card">
          <label>Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div className="filter-card">
          <label>Month</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option>All</option>
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </section>

      {months.map((m) => {
        const monthGoals = filteredGoals.filter((g) => g.month === m);
        if (monthGoals.length === 0) return null;

        return (
          <section key={m} className="month-section">
            <h2>{m}</h2>
            <div className="goals">
              {monthGoals.map((goal) => (
                <div key={goal.id} className="goal-card">
                  <h3>{goal.title}</h3>
                  <span className={`tag ${goal.priority.toLowerCase()}`}>
                    {goal.priority}
                  </span>
                  <span className="category">{goal.category}</span>

                  <div className="progress">{goal.progress}% completed</div>

                  <div className="subtasks">
                    {goal.subtasks.map((st) => (
                      <div key={st.id}>
                        <input
                          type="checkbox"
                          checked={st.done}
                          onChange={() => toggleSubtask(goal.id, st.id)}
                        />
                        {st.text} {st.done && "(done)"}
                      </div>
                    ))}
                    <AddSubtask goalId={goal.id} addSubtask={addSubtask} />
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    className="delete-goal"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    Delete Goal
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {goals.length > 0 && (
        <section className="monthly-summary">
          <h2>Monthly Summary</h2>
          <Bar data={chartData} />
        </section>
      )}

      {goals.length > 0 && (
        <button className="reset" onClick={resetYear}>
          Reset for New Year
        </button>
      )}

      <footer>
        <p>Built for a fresh start ✨</p>
      </footer>
    </div>
  );
}

function AddSubtask({
  goalId,
  addSubtask,
}: {
  goalId: number;
  addSubtask: (id: number, text: string) => void;
}) {
  const [text, setText] = useState("");
  const handleAdd = () => {
    if (!text.trim()) return;
    addSubtask(goalId, text);
    setText("");
  };
  return (
    <div className="add-subtask">
      <input
        type="text"
        placeholder="Add subtask"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}
