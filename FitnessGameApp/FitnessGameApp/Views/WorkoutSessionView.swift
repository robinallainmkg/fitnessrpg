import SwiftUI

struct WorkoutSessionView: View {
    @EnvironmentObject var workoutViewModel: WorkoutViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var repsInput = ""
    @State private var showingConfirmation = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if workoutViewModel.workoutState == .completed {
                    workoutCompletedView
                } else {
                    // En-tête avec progression
                    workoutHeader
                    
                    Divider()
                    
                    // Contenu principal
                    if workoutViewModel.workoutState == .resting {
                        restView
                    } else {
                        exerciseView
                    }
                    
                    Spacer()
                    
                    // Boutons d'action
                    actionButtons
                }
            }
            .navigationTitle("Séance")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Quitter") {
                        showingConfirmation = true
                    }
                }
            }
        }
        .alert("Quitter la séance ?", isPresented: $showingConfirmation) {
            Button("Annuler", role: .cancel) { }
            Button("Quitter", role: .destructive) {
                workoutViewModel.resetWorkout()
                dismiss()
            }
        } message: {
            Text("Votre progression sera perdue.")
        }
    }
    
    private var workoutHeader: some View {
        VStack(spacing: 12) {
            // Progression globale
            let progress = workoutViewModel.getProgress()
            
            HStack {
                VStack(alignment: .leading) {
                    Text("Exercice \(progress.totalProgress)")
                        .font(.headline)
                    Text(workoutViewModel.getCurrentExercise()?.name ?? "")
                        .font(.title2)
                        .fontWeight(.bold)
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text("Série \(progress.exerciseProgress)")
                        .font(.headline)
                    Text("Target: \(workoutViewModel.getCurrentSet()?.targetReps ?? 0) reps")
                        .font(.caption)
                        .foregroundColor(.blue)
                }
            }
            
            // Barre de progression
            ProgressView(value: calculateProgress())
                .progressViewStyle(LinearProgressViewStyle(tint: .blue))
        }
        .padding()
        .background(Color(.systemGray6))
    }
    
    private var exerciseView: some View {
        VStack(spacing: 20) {
            // Instructions de l'exercice
            if let exercise = workoutViewModel.getCurrentExercise(),
               !exercise.instructions.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Instructions")
                        .font(.headline)
                    
                    ForEach(exercise.instructions, id: \.self) { instruction in
                        HStack(alignment: .top) {
                            Text("•")
                            Text(instruction)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        .font(.body)
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.blue.opacity(0.1))
                )
                .padding(.horizontal)
            }
            
            // Saisie des répétitions
            VStack(spacing: 16) {
                Text("Combien de répétitions avez-vous réalisées ?")
                    .font(.headline)
                    .multilineTextAlignment(.center)
                
                TextField("Nombre de reps", text: $repsInput)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.numberPad)
                    .font(.title)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: 200)
            }
            .padding()
        }
    }
    
    private var restView: some View {
        VStack(spacing: 30) {
            Text("Repos")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            // Timer circulaire
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 10)
                    .frame(width: 200, height: 200)
                
                Circle()
                    .trim(from: 0, to: restProgress)
                    .stroke(Color.blue, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                    .frame(width: 200, height: 200)
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 1), value: restProgress)
                
                VStack {
                    Text("\(workoutViewModel.restTimeRemaining)")
                        .font(.system(size: 48, weight: .bold, design: .monospaced))
                    Text("secondes")
                        .font(.headline)
                        .foregroundColor(.secondary)
                }
            }
            
            Text("Préparez-vous pour la série suivante")
                .font(.headline)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
        }
        .padding()
    }
    
    private var actionButtons: some View {
        VStack(spacing: 16) {
            if workoutViewModel.workoutState == .resting {
                Button("Passer le repos") {
                    workoutViewModel.skipRest()
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.orange)
                .foregroundColor(.white)
                .cornerRadius(10)
                .padding(.horizontal)
            } else {
                Button("Valider la série") {
                    if let reps = Int(repsInput) {
                        workoutViewModel.recordSet(reps: reps)
                        repsInput = ""
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(repsInput.isEmpty ? Color.gray : Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
                .padding(.horizontal)
                .disabled(repsInput.isEmpty)
            }
        }
    }
    
    private var workoutCompletedView: some View {
        VStack(spacing: 30) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.green)
            
            Text("Séance terminée !")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            if let session = workoutViewModel.currentSession {
                VStack(spacing: 16) {
                    ScoreCardView(
                        title: "Score",
                        value: "\(session.score)/1000",
                        color: .blue
                    )
                    
                    ScoreCardView(
                        title: "XP gagnés",
                        value: "+\(session.xpEarned)",
                        color: .orange
                    )
                    
                    if session.score >= workoutViewModel.currentLevel?.requiredScore ?? 800 {
                        Text("🎉 Niveau validé ! Niveau suivant débloqué !")
                            .font(.headline)
                            .foregroundColor(.green)
                            .multilineTextAlignment(.center)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.green.opacity(0.1))
                            )
                    }
                }
            }
            
            Button("Terminer") {
                workoutViewModel.resetWorkout()
                dismiss()
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(10)
            .padding(.horizontal)
        }
        .padding()
    }
    
    private func calculateProgress() -> Double {
        guard let level = workoutViewModel.currentLevel else { return 0 }
        
        let totalSets = level.exercises.reduce(0) { $0 + $1.sets.count }
        let completedSets = workoutViewModel.currentExerciseIndex * (workoutViewModel.getCurrentExercise()?.sets.count ?? 0) + workoutViewModel.currentSetIndex
        
        return Double(completedSets) / Double(totalSets)
    }
    
    private var restProgress: Double {
        guard let exercise = workoutViewModel.getCurrentExercise() else { return 0 }
        let totalTime = Double(exercise.restTime)
        let remaining = Double(workoutViewModel.restTimeRemaining)
        return (totalTime - remaining) / totalTime
    }
}

struct ScoreCardView: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.secondary)
                Text(value)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(color)
            }
            
            Spacer()
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
        )
    }
}

#Preview {
    WorkoutSessionView()
        .environmentObject(WorkoutViewModel())
}
