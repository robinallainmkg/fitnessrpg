import SwiftUI

struct MainTabView: View {
    @StateObject private var workoutViewModel = WorkoutViewModel()
    
    var body: some View {
        TabView {
            ProgramsListView()
                .tabItem {
                    Image(systemName: "list.bullet")
                    Text("Programmes")
                }
            
            ProgressView()
                .tabItem {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                    Text("Progrès")
                }
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.circle")
                    Text("Profil")
                }
        }
        .environmentObject(workoutViewModel)
        .task {
            await workoutViewModel.loadUserProgress()
            await workoutViewModel.loadWorkoutHistory()
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
}
