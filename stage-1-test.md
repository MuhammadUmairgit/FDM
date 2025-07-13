# Stage 1 Test: React Fundamentals Assessment

## Test Overview
**Duration:** 2 hours  
**Format:** Practical coding test  
**Difficulty:** Beginner to Intermediate  

## Prerequisites
- Complete Stage 1 learning materials
- Have a React development environment set up
- Basic understanding of HTML, CSS, and JavaScript

---

## Test Instructions

### Setup
1. Create a new React application using Create React App or Vite
2. Set up your development environment
3. Read through all requirements before starting
4. Plan your component structure before coding

### Requirements

You will build a **Task Management Application** with the following features:

#### 1. Component Structure (20 points)
Create the following components:
- `App` - Main application component
- `TaskList` - Displays all tasks
- `TaskItem` - Individual task display
- `AddTask` - Form to add new tasks
- `TaskFilter` - Filter tasks by status

#### 2. State Management (25 points)
- Use `useState` hook to manage:
  - List of tasks (array of objects)
  - Filter state (all, active, completed)
  - Form input state
- Each task should have: `id`, `title`, `description`, `completed`, `priority`

#### 3. Task Operations (25 points)
Implement the following functionality:
- **Add Task**: Form with title, description, and priority selection
- **Toggle Complete**: Mark tasks as complete/incomplete
- **Delete Task**: Remove tasks from the list
- **Filter Tasks**: Filter by all, active, or completed status

#### 4. User Interface (20 points)
- Clean, responsive design
- Proper form handling with validation
- Visual feedback for task status
- Priority indicators (High, Medium, Low)
- Proper JSX usage with conditional rendering

#### 5. Code Quality (10 points)
- Clean, readable code
- Proper component composition
- Meaningful variable and function names
- Comments where necessary

---

## Detailed Requirements

### Task Object Structure
```javascript
{
  id: string,
  title: string,
  description: string,
  completed: boolean,
  priority: 'high' | 'medium' | 'low'
}
```

### Component Specifications

#### App Component
- Main container component
- Manages global state
- Renders all child components

#### TaskList Component
- Receives tasks array and filter as props
- Renders filtered tasks
- Handles task operations (toggle, delete)

#### TaskItem Component
- Displays individual task information
- Shows priority with color coding
- Toggle complete functionality
- Delete button

#### AddTask Component
- Form with title, description, and priority fields
- Form validation (title required)
- Submit handler to add new task
- Clear form after submission

#### TaskFilter Component
- Filter buttons (All, Active, Completed)
- Active filter highlighting
- Filter change handler

---

## Bonus Features (Extra Points)

### UI Enhancements (5 points each)
- Task count display
- Priority-based sorting
- Due date functionality
- Local storage persistence
- Keyboard shortcuts

### Advanced Features (10 points each)
- Task editing functionality
- Bulk operations (select multiple tasks)
- Search functionality
- Task categories/tags
- Export/import tasks

---

## Submission Requirements

### Code Submission
1. **Working Application**: Fully functional React app
2. **Clean Code**: Well-structured, readable code
3. **Component Structure**: Proper separation of concerns
4. **State Management**: Effective use of useState
5. **User Experience**: Intuitive and responsive interface

### Documentation
1. **README.md**: Setup instructions and features list
2. **Code Comments**: Explain complex logic
3. **Component Documentation**: Purpose of each component

---

## Evaluation Criteria

### Passing Score: 70/100 points

#### Code Quality (30 points)
- Component structure and organization
- State management implementation
- Code readability and maintainability
- Proper React patterns usage

#### Functionality (40 points)
- All required features working
- Proper event handling
- Form validation and submission
- Filter functionality

#### User Interface (20 points)
- Clean and responsive design
- Proper JSX usage
- Visual feedback and indicators
- Accessibility considerations

#### Bonus Features (10 points)
- Additional features implementation
- Code optimization
- Advanced patterns usage

---

## Test Environment Setup

### Option 1: Create React App
```bash
npx create-react-app task-management-app
cd task-management-app
npm start
```

### Option 2: Vite (Recommended)
```bash
npm create vite@latest task-management-app -- --template react
cd task-management-app
npm install
npm run dev
```

### Required Dependencies
```bash
npm install react react-dom
```

---

## Sample Data Structure

```javascript
const initialTasks = [
  {
    id: '1',
    title: 'Learn React Fundamentals',
    description: 'Complete Stage 1 of React learning curriculum',
    completed: false,
    priority: 'high'
  },
  {
    id: '2',
    title: 'Build Portfolio Project',
    description: 'Create a showcase project for React skills',
    completed: true,
    priority: 'medium'
  }
];
```

---

## Time Management Tips

### Planning Phase (15 minutes)
- Read all requirements carefully
- Plan component structure
- Design state management approach
- Sketch UI layout

### Implementation Phase (90 minutes)
- Start with basic component structure
- Implement state management
- Add core functionality
- Style and polish UI

### Testing Phase (15 minutes)
- Test all features
- Fix any bugs
- Optimize code
- Prepare submission

---

## Common Pitfalls to Avoid

1. **Over-engineering**: Start simple, add complexity gradually
2. **Poor state management**: Plan your state structure carefully
3. **Inconsistent naming**: Use clear, consistent naming conventions
4. **Missing validation**: Always validate user inputs
5. **Poor component composition**: Keep components focused and reusable

---

## Success Checklist

Before submitting, ensure you have:

- [ ] All required components created
- [ ] State management implemented with useState
- [ ] All CRUD operations working
- [ ] Filter functionality implemented
- [ ] Form validation in place
- [ ] Clean, readable code
- [ ] Responsive design
- [ ] Proper error handling
- [ ] Code comments where needed
- [ ] README with setup instructions

---

## Next Steps After Completion

1. **Self-Review**: Go through your code and identify areas for improvement
2. **Peer Review**: Share your code with others for feedback
3. **Documentation**: Update your portfolio with this project
4. **Reflection**: Note what you learned and what you'd do differently
5. **Preparation**: Review Stage 2 materials while waiting for feedback

---

**Good luck with your Stage 1 assessment! Remember, the goal is to demonstrate your understanding of React fundamentals. Focus on clean, working code rather than perfect features.**

**Time starts now! ⏰**