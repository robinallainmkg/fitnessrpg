<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
# Fitness Gamification App - iOS SwiftUI

## Project Overview
This is a complete iOS native SwiftUI application for gamifying fitness workouts with a leveling progression system. The app features a comprehensive workout program (Muscle-Up Mastery) with 6 progressive levels, each containing 4-5 exercises with detailed instructions and rest timers.

## Tech Stack
- **Frontend**: SwiftUI (iOS 16+)
- **Backend**: Firebase (Firestore + Authentication)
- **Charts**: Swift Charts (native)
- **Architecture**: MVVM
- **State Management**: Combine + ObservableObject

## Implemented Features
✅ **Complete Authentication System**
- Email/password signup and login
- Session persistence
- Error handling with user-friendly messages

✅ **Workout Programs**
- Muscle-Up Mastery program with 6 levels
- Progressive difficulty system
- Level unlocking based on performance

✅ **Guided Workout Sessions**
- Step-by-step exercise guidance
- Automatic rest timers between sets
- Rep input and tracking
- Real-time progress indicators

✅ **Scoring & Progression System**
- Score calculation based on performance vs targets
- XP rewards system
- Automatic level unlocking (80% score required)
- Progress tracking across sessions

✅ **Data Visualization**
- Score progression charts with Swift Charts
- Performance statistics
- Workout history with filtering

✅ **User Profile & Statistics**
- Personal stats dashboard
- Activity streaks
- Total XP and level system

## Project Structure
```
FitnessGameApp/
├── Models/           # Data models for User, Workout, Progress
├── Views/            # SwiftUI views for all screens
├── ViewModels/       # MVVM view models with Combine
├── Services/         # Firebase services and data management
└── Resources/        # Assets and configuration files
```

## Development Guidelines
- **Architecture**: Strict MVVM pattern with Combine for reactive programming
- **Firebase**: All data operations use async/await with proper error handling
- **UI/UX**: Follows iOS Human Interface Guidelines
- **Data Flow**: Unidirectional data flow from ViewModels to Views
- **Testing**: Designed for unit testing with dependency injection

## Setup Requirements
⚠️ **This project requires Xcode for compilation and testing**
- Xcode 15.0+
- Firebase project configuration
- iOS 16+ simulator or device

## Key Code Patterns
- ObservableObject ViewModels for state management
- @StateObject and @EnvironmentObject for data flow
- Proper SwiftUI lifecycle management
- Firebase Firestore integration with Codable models
- Timer management for workout rest periods
- Charts integration for progress visualization

## Next Steps for Extension
- Additional workout programs
- Social features and leaderboards
- Apple Health integration
- Offline mode with sync
- Push notifications for workout reminders
