# Driver Activities Dashboard

A comprehensive React component for displaying driver activities with API integration, featuring a horizontal stacked bar chart and detailed activity breakdowns.

## Features

- **API Integration**: Uses React Query for efficient data fetching and caching
- **Interactive Chart**: Horizontal stacked bar chart using ApexCharts
- **Date Range Selection**: Up to 7 days with preset options
- **Driver Selection**: Dropdown to select different drivers
- **Vehicle Filtering**: Optional vehicle filtering capability
- **Real-time Data**: Dynamic legend showing total durations by activity type
- **Error Handling**: Comprehensive error states and loading indicators
- **Responsive Design**: Works on desktop and mobile devices

## Installation

1. Install dependencies:
```bash
npm install
```

2. Required dependencies:
```json
{
  "react": "^18.2.0",
  "antd": "^5.12.0",
  "@ant-design/icons": "^5.2.0",
  "dayjs": "^1.11.10",
  "react-apexcharts": "^1.4.1",
  "apexcharts": "^3.45.0",
  "@tanstack/react-query": "^5.0.0"
}
```

## Usage

### Basic Usage

```jsx
import DriverActivities from './DriverActivities';

function App() {
  return (
    <div>
      <DriverActivities />
    </div>
  );
}
```

### With Props

```jsx
import DriverActivities from './DriverActivities';

function App() {
  return (
    <div>
      <DriverActivities 
        driverId="123"
        vehiclePlate="AB123CD"
        fromVehicleView={true}
      />
    </div>
  );
}
```

## API Integration

The component uses two main API endpoints:

### 1. Driver Lookup API
```javascript
// src/queries/driver.queries.js
export const useQueryGetDriverLookup = () => {
  return useQuery({
    queryKey: ['driverLookup'],
    queryFn: fetchDriverLookup,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
```

**Expected Response:**
```json
{
  "response": [
    { "id": "1", "name": "Marco Rossi" },
    { "id": "2", "name": "Luigi Bianchi" }
  ]
}
```

### 2. Tacho Driver Activity API
```javascript
// src/queries/tacho.queries.js
export const useQueryGetTachoDriverActivity = (params, options) => {
  return useQuery({
    queryKey: ['tachoDriverActivity', params],
    queryFn: () => fetchTachoDriverActivity(params),
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  });
};
```

**Parameters:**
- `driverId`: String - The driver's unique identifier
- `from`: String - Start date in format "YYYY-MM-DD 00:00:00"
- `to`: String - End date in format "YYYY-MM-DD 00:00:00"

**Expected Response:**
```json
{
  "response": {
    "driverName": "Marco Rossi",
    "weekRange": "Dec 1 - Dec 7, 2024",
    "days": [
      {
        "dayOfTheWeek": "Monday",
        "date": "2024-12-02",
        "commitment": "8h30",
        "activities": [
          {
            "workingState": "DRIVING",
            "stateType": null,
            "duration": "2h30",
            "startTime": "08:00",
            "endTime": "10:30"
          }
        ]
      }
    ]
  }
}
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `driverId` | string | null | Pre-selected driver ID |
| `vehiclePlate` | string | null | Pre-selected vehicle plate |
| `fromVehicleView` | boolean | false | Shows back button if true |

## Driver States

The component supports the following driver states with predefined colors:

```javascript
const DRIVER_STATES = {
  DRIVING: { name: "Driving (within limit)", color: "#52c41a" },
  DRIVING_WARNING: { name: "Driving (approaching 4h30)", color: "#faad14" },
  DRIVING_VIOLATION: { name: "Driving (over 4h30)", color: "#f5222d" },
  BREAK: { name: "Break", color: "#1890ff" },
  REST: { name: "Rest", color: "#722ed1" },
  AVAILABLE: { name: "Available", color: "#13c2c2" },
  WORK: { name: "Work (not driving)", color: "#d9d9d9" },
};
```

## Features

### Date Range Validation
- Maximum 7 days allowed
- Future dates are blocked
- Preset options for quick selection

### Chart Features
- Horizontal stacked bar chart
- 24-hour time scale
- Interactive tooltips
- Dynamic colors based on activity state
- Responsive design

### Data Processing
- Automatic duration calculation from time strings
- Total duration aggregation by state
- Driving time calculation
- Commitment time display

### Error Handling
- API error states
- Loading indicators
- Retry functionality
- Graceful fallbacks

## Customization

### Styling
The component uses Ant Design components and can be customized using:
- CSS classes
- Inline styles
- Ant Design theme customization

### Chart Options
Modify the `chartOptions` object in the component to customize:
- Colors
- Tooltips
- Axis labels
- Chart dimensions

### API Integration
Replace the mock API functions in the query files with actual API calls:

```javascript
// Replace in src/queries/driver.queries.js
const fetchDriverLookup = async () => {
  const response = await fetch('/api/drivers');
  return response.json();
};

// Replace in src/queries/tacho.queries.js
const fetchTachoDriverActivity = async (params) => {
  const response = await fetch('/api/tacho-activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
};
```

## Performance Considerations

- React Query provides automatic caching and background updates
- Chart re-renders are optimized with proper key props
- Large datasets are handled efficiently with virtualization
- API calls are debounced to prevent excessive requests

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License