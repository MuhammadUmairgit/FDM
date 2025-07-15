# Easy Khata - Customer Transaction Management App

A comprehensive React-based customer transaction management application built with Firebase, Ant Design, and modern web technologies.

## 🚀 Features

### Customer Management
- ✅ Add, edit, and delete customers
- ✅ Customer profiles with contact information
- ✅ Search and filter customers
- ✅ Phone and WhatsApp integration
- ✅ Customer transaction history

### Transaction Management
- ✅ Add transactions with images (receipts)
- ✅ Credit/Debit transaction types
- ✅ Transaction status tracking (Pending, Completed, Cancelled)
- ✅ Date-based transaction filtering
- ✅ Search transactions by customer, description, or amount
- ✅ Real-time transaction updates

### Analytics & Reporting
- ✅ Dashboard with key metrics
- ✅ Total customers and transactions
- ✅ Monthly revenue tracking
- ✅ Pending vs completed amounts
- ✅ Customer transaction statistics

### User Interface
- ✅ Modern and responsive design
- ✅ Mobile-friendly interface
- ✅ Smooth animations and transitions
- ✅ Dark/light theme support
- ✅ Intuitive navigation

### Data Management
- ✅ Firebase Firestore integration
- ✅ Real-time data synchronization
- ✅ Image storage with Firebase Storage
- ✅ User authentication
- ✅ Data backup and export capabilities

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0, Ant Design 5.12.8
- **Backend**: Firebase (Firestore, Storage, Auth)
- **State Management**: React Context API with useReducer
- **Routing**: React Router DOM 7.5.2
- **Animations**: Framer Motion 12.9.2
- **Date Management**: Day.js 1.11.10
- **Build Tool**: Vite
- **Styling**: Ant Design + Custom CSS

## 📱 Screenshots

### Dashboard
- Overview of total customers, transactions, and revenue
- Recent transactions and top customers
- Monthly revenue statistics

### Customer Management
- Add new customers with contact details
- View customer profiles and transaction history
- Search and filter customers
- Direct call and WhatsApp integration

### Transaction Management
- Add transactions with receipt images
- Filter by status, type, and date range
- Edit and delete transactions
- Real-time status updates

## 🚀 Getting Started

### Prerequisites
- Node.js 14.x or higher
- npm or yarn package manager
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd easy-khata
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase configuration
   - Update `src/firebase/firebaseConfig.js` with your config

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`

## 🔧 Configuration

### Firebase Configuration
Update `src/firebase/firebaseConfig.js` with your Firebase project settings:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /customers/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /transactions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /transactions/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📝 Usage

### Adding Customers
1. Navigate to the Customers tab
2. Click "Add Customer" button
3. Fill in customer details (name, phone, email, address)
4. Click "Add Customer" to save

### Adding Transactions
1. Navigate to the Transactions tab
2. Click "Add Transaction" button
3. Select customer, enter amount and description
4. Choose transaction type (Credit/Debit)
5. Set status (Pending/Completed/Cancelled)
6. Optionally upload receipt image
7. Click "Add Transaction" to save

### Searching and Filtering
- Use the search bar to find specific customers or transactions
- Apply filters by status, type, or date range
- Sort results by date, amount, or customer name

### Managing Data
- Edit customers or transactions by clicking the edit icon
- Delete items with the delete button (with confirmation)
- View detailed transaction information in modal dialogs

## 🎨 Customization

### Themes
The app supports customizable themes through Ant Design's ConfigProvider:

```javascript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 8,
    },
  }}
>
```

### Adding New Features
1. Create new components in `src/components/`
2. Add utility functions in `src/utils/khataHelpers.js`
3. Extend the context provider in `src/context/KhataContext.js`
4. Update routes in `src/App.js`

## 🏗️ Architecture

### Project Structure
```
src/
├── components/
│   ├── KhataBook/           # Main application component
│   ├── Auth/                # Authentication components
│   ├── CustomerScreen/      # Customer management
│   └── ...
├── context/
│   └── KhataContext.js      # Global state management
├── firebase/
│   └── firebaseConfig.js    # Firebase configuration
├── utils/
│   └── khataHelpers.js      # Utility functions
└── App.js                   # Main app component
```

### State Management
- Uses React Context API with useReducer for global state
- Separate contexts for authentication and khata data
- Real-time updates through Firebase listeners

### Data Flow
1. User interactions trigger actions
2. Actions are dispatched to reducers
3. Reducers update global state
4. Components re-render with new data
5. Firebase listeners provide real-time updates

## 🔐 Security

### Authentication
- Firebase Authentication integration
- User-specific data isolation
- Secure API calls with auth tokens

### Data Security
- Firestore security rules enforce user permissions
- Storage rules protect uploaded images
- Input validation and sanitization

### Best Practices
- Environment variables for sensitive data
- Proper error handling and user feedback
- Secure file upload with type validation

## 🚢 Deployment

### Build for Production
```bash
npm run build
# or
yarn build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `build` folder to Netlify
3. Configure build settings in Netlify dashboard

## 🧪 Testing

### Running Tests
```bash
npm test
# or
yarn test
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for Firebase operations
- Component tests with React Testing Library

## 📊 Performance

### Optimization Features
- Lazy loading of components
- Memoized calculations
- Optimized Firebase queries
- Image compression for uploads
- Efficient re-rendering with useMemo and useCallback

### Best Practices
- Code splitting for better loading times
- Proper dependency management
- Optimized bundle size
- Efficient state updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [FAQ](#faq) section
2. Search existing [issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information
4. Contact support at support@easykhata.com

## 📈 Roadmap

### Upcoming Features
- [ ] PDF report generation
- [ ] Email notifications
- [ ] Bulk import/export
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API integration capabilities
- [ ] Mobile app version

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added image upload for transactions
- **v1.2.0** - Enhanced search and filtering
- **v1.3.0** - Improved mobile responsive design

## 💡 FAQ

**Q: How do I reset my password?**
A: Use the "Forgot Password" link on the login page to reset your password via email.

**Q: Can I backup my data?**
A: Yes, use the export feature in the settings to download your data as JSON or CSV.

**Q: Is my data secure?**
A: Yes, all data is stored securely in Firebase with user-specific access controls.

**Q: Can I use this offline?**
A: Basic functionality works offline, but sync requires internet connection.

**Q: How do I add custom fields?**
A: You can extend the data models in the Firebase collections and update the forms accordingly.

---

Made with ❤️ for small businesses and entrepreneurs to manage their customer transactions efficiently.