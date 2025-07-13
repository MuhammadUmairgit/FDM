import { useQuery } from '@tanstack/react-query';

// Mock API function - replace with actual API call
const fetchDriverLookup = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock response - replace with actual API endpoint
  return {
    response: [
      { id: "1", name: "Marco Rossi" },
      { id: "2", name: "Luigi Bianchi" },
      { id: "3", name: "Giovanni Verdi" },
      { id: "4", name: "Antonio Neri" },
      { id: "5", name: "Paolo Gialli" },
    ]
  };
};

export const useQueryGetDriverLookup = () => {
  return useQuery({
    queryKey: ['driverLookup'],
    queryFn: fetchDriverLookup,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};