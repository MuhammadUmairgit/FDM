import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.example.com';

export const fetchDashboardData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch dashboard data');
  }
};

// Mock data for demonstration
export const mockDashboardData = {
  metrics: [
    {
      id: 1,
      title: 'Total Revenue',
      value: '$12,345',
      change: 12.5,
      color: '#4f46e5',
      icon: <i className="fas fa-dollar-sign"></i>,
    },
    {
      id: 2,
      title: 'New Orders',
      value: '143',
      change: -2.3,
      color: '#10b981',
      icon: <i className="fas fa-shopping-cart"></i>,
    },
    {
      id: 3,
      title: 'Active Users',
      value: '1,234',
      change: 8.7,
      color: '#3b82f6',
      icon: <i className="fas fa-users"></i>,
    },
    {
      id: 4,
      title: 'Conversion Rate',
      value: '3.2%',
      change: 0.5,
      color: '#f59e0b',
      icon: <i className="fas fa-chart-line"></i>,
    },
  ],
  quickActions: [
    {
      id: 1,
      title: 'Add Product',
      subtitle: 'Create new product',
      icon: <i className="fas fa-plus"></i>,
      screen: 'products/new',
    },
    {
      id: 2,
      title: 'Process Order',
      subtitle: 'Manage orders',
      icon: <i className="fas fa-truck"></i>,
      screen: 'orders',
    },
    {
      id: 3,
      title: 'View Reports',
      subtitle: 'Analytics dashboard',
      icon: <i className="fas fa-chart-pie"></i>,
      screen: 'reports',
    },
    {
      id: 4,
      title: 'Customer Support',
      subtitle: 'Help center',
      icon: <i className="fas fa-headset"></i>,
      screen: 'support',
    },
  ],
  recentActivities: [
    {
      id: 1,
      title: 'New order #1234 received',
      time: '2 minutes ago',
      icon: <i className="fas fa-shopping-cart"></i>,
      color: '#10b981',
    },
    {
      id: 2,
      title: 'Payment from John Doe processed',
      time: '15 minutes ago',
      icon: <i className="fas fa-dollar-sign"></i>,
      color: '#4f46e5',
    },
    {
      id: 3,
      title: 'New customer registered',
      time: '1 hour ago',
      icon: <i className="fas fa-user-plus"></i>,
      color: '#3b82f6',
    },
    {
      id: 4,
      title: 'System update completed',
      time: '3 hours ago',
      icon: <i className="fas fa-cog"></i>,
      color: '#f59e0b',
    },
  ],
  salesData: [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 2780 },
    { month: 'May', sales: 1890 },
    { month: 'Jun', sales: 2390 },
    { month: 'Jul', sales: 3490 },
  ],
};