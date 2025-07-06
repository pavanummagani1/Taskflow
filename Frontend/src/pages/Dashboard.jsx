import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { format, isToday, subDays, startOfDay, endOfDay } from 'date-fns';
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
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        axios.get('https://taskflow-wxqj.onrender.com/api/tasks?limit=1000'),
        axios.get('https://taskflow-wxqj.onrender.com/api/tasks/stats')
      ]);

      const allTasks = tasksRes.data.tasks || [];
      setTasks(allTasks);
      setStats(statsRes.data);

      // Filter tasks for different sections
      const today = new Date();
      const todayTasksFiltered = allTasks.filter(task => 
        isToday(new Date(task.dueDate))
      );
      setTodayTasks(todayTasksFiltered);

      const upcomingTasksFiltered = allTasks.filter(task => 
        !isToday(new Date(task.dueDate)) && 
        new Date(task.dueDate) > today
      ).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setUpcomingTasks(upcomingTasksFiltered.slice(0, 5));

      // Generate completion data for last 7 days with REAL data
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        // Get tasks that were completed on this specific day
        const completedOnDay = allTasks.filter(task => {
          if (task.status !== 'completed' || !task.completedAt) return false;
          const completedDate = new Date(task.completedAt);
          return completedDate >= dayStart && completedDate <= dayEnd;
        }).length;

        // Get tasks that were due on this day
        const tasksForDay = allTasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          return taskDate >= dayStart && taskDate <= dayEnd;
        });

        const pendingCount = tasksForDay.filter(task => task.status === 'pending').length;
        const overdueCount = tasksForDay.filter(task => task.status === 'overdue').length;
        
        last7Days.push({
          date: format(date, 'MMM dd'),
          completed: completedOnDay,
          pending: pendingCount,
          overdue: overdueCount
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
            <h2 className="text-lg font-semibold text-gray-900">Daily Task Activity (Last 7 Days)</h2>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              <Bar dataKey="overdue" fill="#EF4444" name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tasks by Category</h2>
            <ExportButtons 
              data={categoryData} 
              filename="task-categories"
              type="chart"
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
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
                <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' : 
                      task.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : task.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks due today</p>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <ExportButtons 
              data={upcomingTasks} 
              filename="upcoming-tasks"
              type="tasks"
            />
          </div>
          <div className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.category}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {format(new Date(task.dueDate), 'MMM dd')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}