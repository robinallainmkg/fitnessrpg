import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var workoutViewModel: WorkoutViewModel
    @State private var showingSignOutAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Photo et info utilisateur
                    userInfoSection
                    
                    // Statistiques globales
                    globalStatsSection
                    
                    // Programmes en cours
                    currentProgramsSection
                    
                    // Actions
                    actionsSection
                }
                .padding()
            }
            .navigationTitle("Profil")
        }
        .alert("Déconnexion", isPresented: $showingSignOutAlert) {
            Button("Annuler", role: .cancel) { }
            Button("Se déconnecter", role: .destructive) {
                authViewModel.signOut()
            }
        } message: {
            Text("Êtes-vous sûr de vouloir vous déconnecter ?")
        }
    }
    
    private var userInfoSection: some View {
        VStack(spacing: 16) {
            // Avatar
            Circle()
                .fill(Color.blue.gradient)
                .frame(width: 100, height: 100)
                .overlay {
                    Image(systemName: "person.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.white)
                }
            
            VStack(spacing: 4) {
                Text(authViewModel.currentUser?.email ?? "Utilisateur")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                Text("Membre depuis \(memberSince)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Niveau et XP
            HStack(spacing: 20) {
                VStack {
                    Text("\(authViewModel.currentUser?.totalXP ?? 0)")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.purple)
                    Text("XP Total")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                    .frame(height: 40)
                
                VStack {
                    Text("Niveau \(userLevel)")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.orange)
                    Text("Fitness")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
            )
        }
    }
    
    private var globalStatsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Statistiques globales")
                .font(.headline)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ProfileStatCard(
                    title: "Séances totales",
                    value: "\(workoutViewModel.workoutSessions.count)",
                    icon: "figure.strengthtraining.traditional",
                    color: .blue
                )
                
                ProfileStatCard(
                    title: "Jours actifs",
                    value: "\(activeDays)",
                    icon: "calendar",
                    color: .green
                )
                
                ProfileStatCard(
                    title: "Score moyen",
                    value: "\(averageScore)/1000",
                    icon: "chart.bar.fill",
                    color: .orange
                )
                
                ProfileStatCard(
                    title: "Série actuelle",
                    value: "\(currentStreak) jours",
                    icon: "flame.fill",
                    color: .red
                )
            }
        }
    }
    
    private var currentProgramsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Programmes en cours")
                .font(.headline)
            
            ForEach(workoutViewModel.programs) { program in
                let currentLevel = workoutViewModel.getCurrentLevel(programId: program.id)
                let totalSessions = workoutViewModel.getTotalSessions(programId: program.id)
                
                HStack {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.blue.gradient)
                        .frame(width: 50, height: 50)
                        .overlay {
                            Image(systemName: "dumbbell.fill")
                                .foregroundColor(.white)
                        }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(program.name)
                            .font(.headline)
                        Text("Niveau \(currentLevel)/\(program.levels.count)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("\(totalSessions)")
                            .font(.headline)
                            .foregroundColor(.blue)
                        Text("séances")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.systemGray6))
                )
            }
        }
    }
    
    private var actionsSection: some View {
        VStack(spacing: 12) {
            Button(action: {
                // TODO: Implémenter les paramètres
            }) {
                HStack {
                    Image(systemName: "gear")
                    Text("Paramètres")
                    Spacer()
                    Image(systemName: "chevron.right")
                        .foregroundColor(.secondary)
                }
            }
            .foregroundColor(.primary)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
            )
            
            Button(action: {
                // TODO: Implémenter l'aide
            }) {
                HStack {
                    Image(systemName: "questionmark.circle")
                    Text("Aide & Support")
                    Spacer()
                    Image(systemName: "chevron.right")
                        .foregroundColor(.secondary)
                }
            }
            .foregroundColor(.primary)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
            )
            
            Button(action: {
                showingSignOutAlert = true
            }) {
                HStack {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                    Text("Se déconnecter")
                    Spacer()
                }
            }
            .foregroundColor(.red)
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.systemGray6))
            )
        }
    }
    
    private var memberSince: String {
        guard let createdAt = authViewModel.currentUser?.createdAt else { return "récemment" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: createdAt)
    }
    
    private var userLevel: Int {
        let xp = authViewModel.currentUser?.totalXP ?? 0
        return max(1, xp / 1000) // 1 niveau par 1000 XP
    }
    
    private var activeDays: Int {
        let dates = Set(workoutViewModel.workoutSessions.map { 
            Calendar.current.startOfDay(for: $0.date) 
        })
        return dates.count
    }
    
    private var averageScore: Int {
        let sessions = workoutViewModel.workoutSessions
        guard !sessions.isEmpty else { return 0 }
        return sessions.reduce(0) { $0 + $1.score } / sessions.count
    }
    
    private var currentStreak: Int {
        // Calcul simplifié de la série actuelle
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        
        var streak = 0
        var checkDate = today
        
        while true {
            let hasWorkout = workoutViewModel.workoutSessions.contains { session in
                calendar.startOfDay(for: session.date) == checkDate
            }
            
            if hasWorkout {
                streak += 1
                checkDate = calendar.date(byAdding: .day, value: -1, to: checkDate) ?? checkDate
            } else {
                break
            }
        }
        
        return streak
    }
}

struct ProfileStatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
        )
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthViewModel())
        .environmentObject(WorkoutViewModel())
}
