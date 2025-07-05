// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, PieChart, Pie, Cell
// } from 'recharts';
// import {
//   Calendar, CheckCircle, Clock, AlertCircle, TrendingUp, Trash2, Edit3
// } from 'lucide-react';
// import axios from 'axios';
// import { format, isToday, subDays } from 'date-fns';
// import ExportButtons from '../components/ExportButtons';
// import TaskModal from '../components/TaskModal';

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0 });
//   const [tasks, setTasks] = useState([]);
//   const [todayTasks, setTodayTasks] = useState([]);
//   const [upcomingTasks, setUpcomingTasks] = useState([]);
//   const [completionData, setCompletionData] = useState([]);
//   const [categoryData, setCategoryData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const [tasksRes, statsRes] = await Promise.all([
//         axios.get('http://localhost:3487/api/tasks'),
//         axios.get('http://localhost:3487/api/tasks/stats')
//       ]);

//       const allTasks = tasksRes.data.tasks;
//       setTasks(allTasks);
//       setStats(statsRes.data);

//       const today = new Date();
//       setTodayTasks(allTasks.filter(t => isToday(new Date(t.dueDate))));
//       setUpcomingTasks(
//         allTasks
//           .filter(t => !isToday(new Date(t.dueDate)) && new Date(t.dueDate) > today)
//           .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
//           .slice(0, 5)
//       );

//       // Completion chart
//       const last7Days = [];
//       for (let i = 6; i >= 0; i--) {
//         const date = subDays(today, i);
//         last7Days.push({
//           date: format(date, 'MMM dd'),
//           completed: allTasks.filter(task =>
//             task.status === 'completed' &&
//             format(new Date(task.updatedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
//           ).length
//         });
//       }
//       setCompletionData(last7Days);

//       // Category chart
//       const categories = {};
//       allTasks.forEach(t => {
//         categories[t.category] = (categories[t.category] || 0) + 1;
//       });
//       setCategoryData(Object.entries(categories).map(([name, value]) => ({ name, value })));
//     } catch (err) {
//       console.error('Dashboard fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveTask = (savedTask) => {
//     setShowModal(false);
//     setEditingTask(null);
//     fetchDashboardData();
//   };

//   const handleEditTask = (task) => {
//     setEditingTask(task);
//     setShowModal(true);
//   };

//   const handleDeleteTask = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this task?')) return;
//     try {
//       await axios.delete(`http://localhost:3487/api/tasks/${id}`);
//       fetchDashboardData();
//     } catch (err) {
//       console.error('Delete task failed:', err);
//     }
//   };

//   const handleMarkCompleted = async (task) => {
//     try {
//       await axios.put(`http://localhost:3487/api/tasks/${task._id}`, {
//         ...task,
//         status: 'completed'
//       });
//       fetchDashboardData();
//     } catch (err) {
//       console.error('Mark complete failed:', err);
//     }
//   };

//   const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
//         <button
//           onClick={() => setShowModal(true)}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           + Create Task
//         </button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {[
//           ['Total Tasks', stats.total, <Calendar />, 'blue'],
//           ['Completed', stats.completed, <CheckCircle />, 'green'],
//           ['Pending', stats.pending, <Clock />, 'yellow'],
//           ['Overdue', stats.overdue, <AlertCircle />, 'red']
//         ].map(([label, count, icon, color], idx) => (
//           <div key={idx} className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-sm text-gray-600">{label}</p>
//                 <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
//               </div>
//               <div className={`h-12 w-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
//                 {icon}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
//             <TrendingUp className="text-gray-500" /> Completion (Last 7 Days)
//           </h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={completionData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="completed" fill="#3B82F6" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h2 className="text-lg font-semibold mb-4">Task Categories</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
//                 {categoryData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Tasks */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {[["Tasks Due Today", todayTasks], ["Upcoming Tasks", upcomingTasks]].map(
//           ([title, taskList], idx) => (
//             <div key={idx} className="bg-white p-6 rounded-lg shadow">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
//                 <ExportButtons data={taskList} filename={`${title.toLowerCase().replace(/\s+/g, '-')}`} type="tasks" />
//               </div>
//               <div className="space-y-3">
//                 {taskList.length > 0 ? (
//                   taskList.map((task) => (
//                     <div key={task._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
//                       <div>
//                         <p className="font-medium text-gray-900">{task.title}</p>
//                         <p className="text-sm text-gray-500">{task.category}</p>
//                       </div>
//                       <div className="flex gap-2 items-center">
//                         {task.status !== 'completed' && (
//                           <button
//                             onClick={() => handleMarkCompleted(task)}
//                             className="text-sm text-green-600 hover:underline"
//                           >
//                             Mark Completed
//                           </button>
//                         )}
//                         <Edit3 className="h-4 w-4 cursor-pointer text-blue-600" onClick={() => handleEditTask(task)} />
//                         <Trash2 className="h-4 w-4 cursor-pointer text-red-600" onClick={() => handleDeleteTask(task._id)} />
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-500 text-center py-8">No tasks</p>
//                 )}
//               </div>
//             </div>
//           )
//         )}
//       </div>

//       {showModal && (
//         <TaskModal
//           task={editingTask}
//           onClose={() => {
//             setShowModal(false);
//             setEditingTask(null);
//           }}
//           onSave={handleSaveTask}
//         />
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { format, isToday, subDays } from 'date-fns';
import ExportButtons from '../components/ExportButtons';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3487/api/tasks'),
        axios.get('http://localhost:3487/api/tasks/stats')
      ]);

      const allTasks = tasksRes.data.tasks;
      setTasks(allTasks);
      setStats(statsRes.data);

      // Filter tasks for today only
      const todayTasksFiltered = allTasks.filter(task => 
        isToday(new Date(task.dueDate))
      );
      setTodayTasks(todayTasksFiltered);

      // Generate completion data for last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const completedCount = allTasks.filter(task => 
          task.status === 'completed' && 
          task.completedAt &&
          format(new Date(task.completedAt), 'yyyy-MM-dd') === dateStr
        ).length;
        
        last7Days.push({
          date: format(date, 'MMM dd'),
          completed: completedCount
        });
      }
      setCompletionData(last7Days);

      // Generate category data
      const categories = {};
      allTasks.forEach(task => {
        categories[task.category] = (categories[task.category] || 0) + 1;
      });
      
      const categoryArray = Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      setCategoryData(categoryArray);

      // Generate status data for pie chart
      const statusArray = [
        { name: 'Completed', value: statsRes.data.completed, color: '#10B981' },
        { name: 'Pending', value: statsRes.data.pending, color: '#F59E0B' },
        { name: 'Overdue', value: statsRes.data.overdue, color: '#EF4444' }
      ].filter(item => item.value > 0);
      setStatusData(statusArray);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Here's your task overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tasks Completed (Last 7 Days)</h2>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Task Status Overview</h2>
            <ExportButtons 
              data={statusData} 
              filename="task-status"
              type="chart"
            />
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No tasks to display
            </div>
          )}
        </div>
      </div>

      {/* Today's Tasks Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tasks Due Today</h2>
          <ExportButtons 
            data={todayTasks} 
            filename="today-tasks"
            type="tasks"
          />
        </div>
        <div className="space-y-3">
          {todayTasks.length > 0 ? (
            todayTasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' : 
                    task.status === 'overdue' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.category}</p>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : task.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {format(new Date(task.dueDate), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No tasks due today</p>
              <p className="text-gray-400 text-sm">Great job staying on top of your tasks!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}