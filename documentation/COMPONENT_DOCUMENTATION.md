# Component Documentation

This document provides detailed documentation for all React components in the Eco-Friendly Activity Tracker application.

## 📋 Table of Contents

- [Authentication Components](#authentication-components)
- [Activity Components](#activity-components)
- [User Profile Components](#user-profile-components)
- [UI Components](#ui-components)
- [Page Components](#page-components)
- [Icon Components](#icon-components)

## 🔐 Authentication Components

### LoginForm.jsx
**Location**: `src/components/auth/LoginForm.jsx`

**Purpose**: Handles user authentication with email and password.

**Props**: None

**State**:
- `formData`: Object containing email and password
- `loading`: Boolean indicating submission state
- `errors`: Object containing validation errors

**Key Features**:
- Form validation
- Error handling
- Loading states
- Automatic navigation on success

**Usage**:
```jsx
<LoginForm />
```

### RegisterForm.jsx
**Location**: `src/components/auth/RegisterForm.jsx`

**Purpose**: Handles new user registration.

**Props**: None

**State**:
- `formData`: Object containing email and password
- `loading`: Boolean indicating submission state
- `errors`: Object containing validation errors

**Key Features**:
- Password confirmation validation
- Email format validation
- Automatic login after registration

**Usage**:
```jsx
<RegisterForm />
```

### AuthGuard.jsx
**Location**: `src/components/auth/AuthGuard.jsx`

**Purpose**: Protects routes that require authentication.

**Props**:
- `children`: React elements to render if authenticated

**Key Features**:
- Token validation
- Automatic redirect to login
- Loading state during validation

**Usage**:
```jsx
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>
```

## 📊 Activity Components

### ActivitySubmissionForm.jsx
**Location**: `src/components/activity/ActivitySubmissionForm.jsx`

**Purpose**: Form for logging new activities with validation and API integration.

**Props**:
- `onSuccess`: Function called on successful submission
- `onError`: Function called on submission error

**State**:
- `formData`: Object with type, distance, description
- `loading`: Boolean for submission state
- `errors`: Object with validation errors
- `activityRules`: Array of available activity types

**Key Features**:
- Dynamic form validation based on activity type
- Real-time points calculation display
- Distance requirement for certain activities
- API integration for rules fetching

**Usage**:
```jsx
<ActivitySubmissionForm 
  onSuccess={(response) => console.log('Activity logged:', response)}
  onError={(error) => console.error('Error:', error)}
/>
```

### ActivityHistoryTable.jsx
**Location**: `src/components/activity/ActivityHistoryTable.jsx`

**Purpose**: Displays paginated table of user's activity history.

**Props**:
- `limit`: Number of activities per page (default: 10)

**State**:
- `activities`: Array of activity objects
- `loading`: Boolean for data fetching state
- `pagination`: Object with pagination info
- `filters`: Object with current filter settings

**Key Features**:
- Pagination controls
- Activity type filtering
- Sortable columns
- Responsive table design

**Usage**:
```jsx
<ActivityHistoryTable limit={20} />
```

### ActivityStatsDashboard.jsx
**Location**: `src/components/activity/ActivityStatsDashboard.jsx`

**Purpose**: Displays comprehensive statistics and analytics for user activities.

**Props**: None

**State**:
- `stats`: Object containing activity statistics
- `loading`: Boolean for data fetching state
- `error`: String with error message if any

**Key Features**:
- Total points and activities display
- Activity breakdown by type
- Recent activities list
- Milestone progress indicators
- Visual charts and progress bars

**Usage**:
```jsx
<ActivityStatsDashboard />
```

### ActivityRulesDisplay.jsx
**Location**: `src/components/activity/ActivityRulesDisplay.jsx`

**Purpose**: Shows the points calculation rules for different activity types.

**Props**: None

**State**:
- `rules`: Array of activity rules
- `loading`: Boolean for data fetching state

**Key Features**:
- Points per activity type
- Distance-based vs fixed-point activities
- Visual icons for each activity type
- Responsive grid layout

**Usage**:
```jsx
<ActivityRulesDisplay />
```

## 👤 User Profile Components

### UserProfileDisplay.jsx
**Location**: `src/components/user/UserProfileDisplay.jsx`

**Purpose**: Displays user profile information and statistics.

**Props**: None

**State**:
- `profile`: Object with user profile data
- `loading`: Boolean for data fetching state
- `error`: String with error message if any

**Key Features**:
- User information display
- Points and milestone summary
- Next milestone progress
- Profile update functionality

**Usage**:
```jsx
<UserProfileDisplay />
```

### ProfileUpdateForm.jsx
**Location**: `src/components/user/ProfileUpdateForm.jsx`

**Purpose**: Form for updating user profile information.

**Props**:
- `onSuccess`: Function called on successful update
- `onError`: Function called on update error

**State**:
- `formData`: Object with form fields
- `loading`: Boolean for submission state
- `errors`: Object with validation errors

**Key Features**:
- Email validation
- Duplicate email checking
- Form validation
- Success/error feedback

**Usage**:
```jsx
<ProfileUpdateForm 
  onSuccess={() => console.log('Profile updated')}
  onError={(error) => console.error('Update failed:', error)}
/>
```

### MilestonesList.jsx
**Location**: `src/components/user/MilestonesList.jsx`

**Purpose**: Displays user's milestone progress and achievements.

**Props**: None

**State**:
- `milestones`: Array of milestone objects
- `summary`: Object with milestone summary
- `loading`: Boolean for data fetching state

**Key Features**:
- Progress bars for each milestone
- Achievement status indicators
- Points needed for next milestone
- Visual progress representation

**Usage**:
```jsx
<MilestonesList />
```

### LeaderboardTable.jsx
**Location**: `src/components/user/LeaderboardTable.jsx`

**Purpose**: Displays leaderboard of top users by points.

**Props**:
- `limit`: Number of users to display (default: 10)

**State**:
- `leaderboard`: Array of user objects
- `loading`: Boolean for data fetching state
- `error`: String with error message if any

**Key Features**:
- Rank display
- User points and join date
- Responsive table design
- Configurable limit

**Usage**:
```jsx
<LeaderboardTable limit={20} />
```

## 🎨 UI Components

### Progress.jsx
**Location**: `src/components/UI/Progress.jsx`

**Purpose**: Reusable progress bar component.

**Props**:
- `value`: Number (0-100) representing progress percentage
- `max`: Number representing maximum value (default: 100)
- `className`: String for additional CSS classes
- `showLabel`: Boolean to show percentage label

**Key Features**:
- Animated progress bar
- Customizable styling
- Accessibility support
- Responsive design

**Usage**:
```jsx
<Progress value={75} showLabel={true} className="w-full" />
```

### Tabs.jsx
**Location**: `src/components/UI/Tabs.jsx`

**Purpose**: Tab navigation component.

**Props**:
- `tabs`: Array of tab objects with id, label, and icon
- `activeTab`: String with currently active tab id
- `onTabChange`: Function called when tab changes

**Key Features**:
- Icon support
- Active state styling
- Keyboard navigation
- Responsive design

**Usage**:
```jsx
<Tabs 
  tabs={[
    { id: 'tab1', label: 'Tab 1', icon: '📊' },
    { id: 'tab2', label: 'Tab 2', icon: '👤' }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

## 📄 Page Components

### LoginPage.jsx
**Location**: `src/pages/LoginPage.jsx`

**Purpose**: Main login page with authentication forms.

**Features**:
- Tabbed interface for login/register
- Form validation
- Error handling
- Responsive design

### ActivityDashboard.jsx
**Location**: `src/pages/ActivityDashboard.jsx`

**Purpose**: Main dashboard with tabbed navigation.

**Features**:
- Tab navigation (Dashboard, Profile, Milestones, Leaderboard)
- Header with action buttons
- Responsive layout
- Logout functionality

### LogActivityPage.jsx
**Location**: `src/pages/LogActivityPage.jsx`

**Purpose**: Page for logging new activities.

**Features**:
- Activity submission form
- Rules display
- Success/error feedback
- Navigation back to dashboard

### ActivityHistoryPage.jsx
**Location**: `src/pages/ActivityHistoryPage.jsx`

**Purpose**: Page displaying activity history.

**Features**:
- Activity history table
- Pagination controls
- Filtering options
- Export functionality (if implemented)

## 🎯 Icon Components

### BikeIcon.jsx
**Location**: `src/components/icons/BikeIcon.jsx`

**Purpose**: SVG icon for cycling activities.

**Props**:
- `className`: String for CSS classes
- `size`: Number for icon size

### CarIcon.jsx
**Location**: `src/components/icons/CarIcon.jsx`

**Purpose**: SVG icon for transportation activities.

### RecycleIcon.jsx
**Location**: `src/components/icons/RecycleIcon.jsx`

**Purpose**: SVG icon for recycling activities.

### TreePineIcon.jsx
**Location**: `src/components/icons/TreePineIcon.jsx`

**Purpose**: SVG icon for tree planting activities.

### ZapIcon.jsx
**Location**: `src/components/icons/ZapIcon.jsx`

**Purpose**: SVG icon for energy saving activities.

### LogOutIcon.jsx
**Location**: `src/components/icons/LogOutIcon.jsx`

**Purpose**: SVG icon for logout functionality.

## 🔧 Component Patterns

### Common Props Pattern
```jsx
// Standard component props
interface ComponentProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  loading?: boolean;
  className?: string;
}
```

### State Management Pattern
```jsx
// Common state structure
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### API Integration Pattern
```jsx
// Standard API call pattern
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.getData();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Form Validation Pattern
```jsx
// Standard form validation
const validateForm = () => {
  const errors = {};
  
  if (!formData.field) {
    errors.field = 'Field is required';
  }
  
  setErrors(errors);
  return Object.keys(errors).length === 0;
};
```

## 🎨 Styling Guidelines

### Tailwind CSS Classes
- Use consistent spacing: `p-4`, `m-2`, `space-y-4`
- Use semantic colors: `bg-green-600` for eco-friendly actions
- Use responsive prefixes: `sm:`, `md:`, `lg:`
- Use consistent text sizes: `text-sm`, `text-base`, `text-lg`

### Component Styling
```jsx
// Standard component styling
<div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
    Component Title
  </h2>
  {/* Component content */}
</div>
```

## 🧪 Testing Components

### Component Testing Checklist
- [ ] Renders without errors
- [ ] Handles props correctly
- [ ] Manages state properly
- [ ] Handles user interactions
- [ ] Displays loading states
- [ ] Shows error messages
- [ ] Responsive design works
- [ ] Accessibility features work

### Example Test Structure
```jsx
// Component test example
describe('ActivitySubmissionForm', () => {
  it('renders form fields correctly', () => {
    render(<ActivitySubmissionForm />);
    expect(screen.getByLabelText(/activity type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
  
  it('validates required fields', () => {
    render(<ActivitySubmissionForm />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText(/activity type is required/i)).toBeInTheDocument();
  });
});
```

---

This component documentation should be updated as new components are added or existing ones are modified.
