import SwiftUI

struct ProgramDetailView: View {
    let program: WorkoutProgram
    @EnvironmentObject var workoutViewModel: WorkoutViewModel
    @State private var selectedLevel: WorkoutLevel?
    @State private var showingWorkoutSession = false
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // En-tête du programme
                programHeader
                
                // Description
                VStack(alignment: .leading, spacing: 8) {
                    Text("Description")
                        .font(.headline)
                    
                    Text(program.description)
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)
                
                // Statistiques
                programStats
                
                // Liste des niveaux
                VStack(alignment: .leading, spacing: 12) {
                    Text("Niveaux")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    LazyVStack(spacing: 8) {
                        ForEach(program.levels) { level in
                            LevelRowView(
                                level: level,
                                program: program,
                                isUnlocked: workoutViewModel.isLevelUnlocked(
                                    programId: program.id,
                                    levelId: level.id
                                )
                            ) {
                                selectedLevel = level
                                showingWorkoutSession = true
                                workoutViewModel.startWorkout(program: program, levelId: level.id)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .navigationTitle(program.name)
        .navigationBarTitleDisplayMode(.large)
        .fullScreenCover(item: $selectedLevel) { level in
            WorkoutSessionView()
                .environmentObject(workoutViewModel)
        }
    }
    
    private var programHeader: some View {
        VStack {
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.blue.gradient)
                .frame(height: 120)
                .overlay {
                    Image(systemName: "figure.strengthtraining.traditional")
                        .font(.system(size: 50))
                        .foregroundColor(.white)
                }
                .padding(.horizontal)
        }
    }
    
    private var programStats: some View {
        HStack(spacing: 20) {
            StatView(
                title: "Niveau actuel",
                value: "\(workoutViewModel.getCurrentLevel(programId: program.id))",
                icon: "star.fill",
                color: .orange
            )
            
            StatView(
                title: "Séances",
                value: "\(workoutViewModel.getTotalSessions(programId: program.id))",
                icon: "checkmark.circle.fill",
                color: .green
            )
            
            StatView(
                title: "Total niveaux",
                value: "\(program.levels.count)",
                icon: "flag.fill",
                color: .blue
            )
        }
        .padding(.horizontal)
    }
}

struct LevelRowView: View {
    let level: WorkoutLevel
    let program: WorkoutProgram
    let isUnlocked: Bool
    let onStart: () -> Void
    
    var body: some View {
        HStack {
            // Indicateur de niveau
            Circle()
                .fill(isUnlocked ? Color.blue : Color.gray.opacity(0.3))
                .frame(width: 40, height: 40)
                .overlay {
                    Text("\(level.id)")
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(isUnlocked ? .white : .gray)
                }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(level.name)
                    .font(.headline)
                    .foregroundColor(isUnlocked ? .primary : .gray)
                
                Text(level.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                HStack {
                    Label("\(level.exercises.count) exercices", systemImage: "dumbbell")
                        .font(.caption2)
                        .foregroundColor(.blue)
                    
                    Spacer()
                    
                    if isUnlocked {
                        Text("Score requis: \(level.requiredScore)/1000")
                            .font(.caption2)
                            .foregroundColor(.orange)
                    } else {
                        Image(systemName: "lock.fill")
                            .foregroundColor(.gray)
                    }
                }
            }
            
            Spacer()
            
            if isUnlocked {
                Button("Commencer") {
                    onStart()
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
                .opacity(isUnlocked ? 1.0 : 0.5)
        )
    }
}

struct StatView: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
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
    NavigationView {
        ProgramDetailView(program: WorkoutProgramService.shared.getAllPrograms().first!)
            .environmentObject(WorkoutViewModel())
    }
}
