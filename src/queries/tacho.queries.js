import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

// Mock API function - replace with actual API call
const fetchTachoDriverActivity = async ({ driverId, from, to }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Validate required parameters
  if (!driverId || !from || !to) {
    throw new Error('Missing required parameters: driverId, from, to');
  }

  // Generate mock data based on the date range
  const startDate = dayjs(from);
  const endDate = dayjs(to);
  const daysDiff = endDate.diff(startDate, 'days') + 1;
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const generateDayActivities = (date, dayIndex) => {
    const activities = [];
    let currentTime = 0;
    
    // Generate random activities for the day
    while (currentTime < 1440) { // 24 hours in minutes
      const activityTypes = ['DRIVING', 'BREAK', 'REST', 'AVAILABLE', 'WORK'];
      const workingState = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      
      // Random duration between 30 minutes and 4 hours
      const duration = Math.floor(Math.random() * 210) + 30; // 30-240 minutes
      
      if (currentTime + duration > 1440) {
        break;
      }
      
      const startHour = Math.floor(currentTime / 60);
      const startMinute = currentTime % 60;
      const endTime = currentTime + duration;
      const endHour = Math.floor(endTime / 60);
      const endMinute = endTime % 60;
      
      activities.push({
        workingState,
        stateType: workingState === 'DRIVING' && Math.random() > 0.7 ? 'WARNING' : null,
        duration: `${Math.floor(duration / 60)}h${duration % 60}m`,
        startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
        endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
      });
      
      currentTime += duration;
    }
    
    return activities;
  };

  const days = [];
  for (let i = 0; i < daysDiff; i++) {
    const date = startDate.add(i, 'days');
    const dayIndex = date.day();
    const activities = generateDayActivities(date, dayIndex);
    
    // Calculate commitment and driving time
    const drivingMinutes = activities
      .filter(a => a.workingState === 'DRIVING')
      .reduce((sum, a) => {
        const match = a.duration.match(/(\d+)h(?:(\d+))?/);
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2] || "0", 10);
        return sum + (hours * 60 + minutes);
      }, 0);
    
    const commitmentMinutes = Math.min(drivingMinutes + Math.floor(Math.random() * 180), 600); // Max 10 hours
    const commitmentHours = Math.floor(commitmentMinutes / 60);
    const commitmentMins = commitmentMinutes % 60;
    
    days.push({
      dayOfTheWeek: daysOfWeek[dayIndex],
      date: date.format('YYYY-MM-DD'),
      commitment: `${commitmentHours}h${commitmentMins.toString().padStart(2, '0')}`,
      activities,
    });
  }

  // Mock response - replace with actual API endpoint
  return {
    response: {
      driverName: `Driver ${driverId}`,
      weekRange: `${startDate.format('MMM D')} - ${endDate.format('MMM D, YYYY')}`,
      days,
    }
  };
};

export const useQueryGetTachoDriverActivity = (params, options = {}) => {
  return useQuery({
    queryKey: ['tachoDriverActivity', params],
    queryFn: () => fetchTachoDriverActivity(params),
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
};