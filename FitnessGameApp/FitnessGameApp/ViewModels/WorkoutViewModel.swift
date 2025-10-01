import Foundation
import Combine

@MainActor
class WorkoutViewModel: ObservableObject {
    @Published var programs: [WorkoutProgram] = []
    @Published var userProgress: [String: UserProgress] = [:]
    @Published var workoutSessions: [WorkoutSession] = []
    @Published var isLoading = false
    @Published var errorMessage = ""
    
    // État de la séance en cours
    @Published var currentSession: WorkoutSession?
    @Published var currentProgram: WorkoutProgram?
    @Published var currentLevel: WorkoutLevel?
    @Published var currentExerciseIndex = 0
    @Published var currentSetIndex = 0
    @Published var workoutState: WorkoutState = .notStarted
    @Published var restTimeRemaining = 0
    @Published var restTimer: Timer?
    
    private let programService = WorkoutProgramService.shared
    private let firestoreService = FirestoreService.shared
    private let authService = AuthService()
    
    init() {
        loadPrograms()
    }
    
    // MARK: - Programme Loading
    
    func loadPrograms() {
        programs = programService.getAllPrograms()
    }
    
    func loadUserProgress() async {
        guard let userId = authService.currentUserUID else { return }
        
        isLoading = true
        
        for program in programs {
            do {
                if let progress = try await firestoreService.getUserProgress(userId: userId, programId: program.id) {
                    userProgress[program.id] = progress
                } else {
                    // Créer un nouveau progrès utilisateur
                    let newProgress = UserProgress(userId: userId, programId: program.id)
                    try await firestoreService.createOrUpdateUserProgress(newProgress)
                    userProgress[program.id] = newProgress
                }
            } catch {
                errorMessage = "Erreur lors du chargement des progrès: \(error.localizedDescription)"
            }
        }
        
        isLoading = false
    }
    
    func loadWorkoutHistory() async {
        guard let userId = authService.currentUserUID else { return }
        
        do {
            workoutSessions = try await firestoreService.getUserWorkoutSessions(userId: userId)
        } catch {
            errorMessage = "Erreur lors du chargement de l'historique: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Workout Session Management
    
    func startWorkout(program: WorkoutProgram, levelId: Int) {
        guard let userId = authService.currentUserUID,
              let level = program.levels.first(where: { $0.id == levelId }) else { return }
        
        currentProgram = program
        currentLevel = level
        currentSession = WorkoutSession(userId: userId, programId: program.id, levelId: levelId)
        currentExerciseIndex = 0
        currentSetIndex = 0
        workoutState = .inProgress
        
        // Initialiser les résultats des exercices
        for exercise in level.exercises {
            let exerciseResult = ExerciseResult(
                exerciseName: exercise.name,
                target: exercise.sets.first?.targetReps ?? 0,
                setsCount: exercise.sets.count
            )
            currentSession?.exercises.append(exerciseResult)
        }
    }
    
    func recordSet(reps: Int) {
        guard var session = currentSession,
              currentExerciseIndex < session.exercises.count,
              currentSetIndex < session.exercises[currentExerciseIndex].sets.count else { return }
        
        // Enregistrer les reps pour cette série
        session.exercises[currentExerciseIndex].sets[currentSetIndex] = reps
        currentSession = session
        
        // Passer à la série suivante ou exercice suivant
        moveToNextSet()
    }
    
    private func moveToNextSet() {
        guard let level = currentLevel else { return }
        
        currentSetIndex += 1
        
        // Vérifier si on a terminé toutes les séries de cet exercice
        if currentSetIndex >= level.exercises[currentExerciseIndex].sets.count {
            currentSetIndex = 0
            currentExerciseIndex += 1
            
            // Vérifier si on a terminé tous les exercices
            if currentExerciseIndex >= level.exercises.count {
                completeWorkout()
                return
            }
        }
        
        // Démarrer le timer de repos
        startRestTimer()
    }
    
    private func startRestTimer() {
        guard let level = currentLevel else { return }
        
        let exercise = level.exercises[currentExerciseIndex]
        restTimeRemaining = exercise.restTime
        workoutState = .resting
        
        restTimer?.invalidate()
        restTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.restTimeRemaining -= 1
                if self?.restTimeRemaining ?? 0 <= 0 {
                    self?.restTimer?.invalidate()
                    self?.workoutState = .inProgress
                }
            }
        }
    }
    
    func skipRest() {
        restTimer?.invalidate()
        restTimeRemaining = 0
        workoutState = .inProgress
    }
    
    private func completeWorkout() {
        guard var session = currentSession else { return }
        
        // Calculer le score
        let score = calculateScore(session: session)
        session.score = score
        session.xpEarned = calculateXP(score: score)
        session.completed = true
        
        currentSession = session
        workoutState = .completed
        
        // Sauvegarder la séance
        Task {
            await saveWorkoutSession()
            await checkLevelCompletion()
        }
    }
    
    private func calculateScore(session: WorkoutSession) -> Int {
        var totalScore = 0.0
        var totalPossible = 0.0
        
        for exerciseResult in session.exercises {
            for reps in exerciseResult.sets {
                totalScore += Double(reps)
                totalPossible += Double(exerciseResult.target)
            }
        }
        
        let percentage = totalPossible > 0 ? totalScore / totalPossible : 0
        return Int(percentage * 1000) // Score sur 1000
    }
    
    private func calculateXP(score: Int) -> Int {
        // XP basé sur le score
        switch score {
        case 900...1000: return 300
        case 800...899: return 250
        case 700...799: return 200
        case 600...699: return 150
        default: return 100
        }
    }
    
    private func saveWorkoutSession() async {
        guard let session = currentSession else { return }
        
        do {
            try await firestoreService.saveWorkoutSession(session)
            
            // Mettre à jour l'XP de l'utilisateur
            if let userId = authService.currentUserUID {
                try await firestoreService.updateUserXP(uid: userId, xpToAdd: session.xpEarned)
            }
            
            // Recharger l'historique
            await loadWorkoutHistory()
        } catch {
            errorMessage = "Erreur lors de la sauvegarde: \(error.localizedDescription)"
        }
    }
    
    private func checkLevelCompletion() async {
        guard let session = currentSession,
              let level = currentLevel,
              let userId = authService.currentUserUID else { return }
        
        // Vérifier si le niveau est validé (score >= 80%)
        if session.score >= level.requiredScore {
            let nextLevel = level.id + 1
            
            do {
                try await firestoreService.unlockNextLevel(
                    userId: userId,
                    programId: session.programId,
                    newLevel: nextLevel
                )
                
                // Recharger les progrès
                await loadUserProgress()
            } catch {
                errorMessage = "Erreur lors du déverrouillage du niveau: \(error.localizedDescription)"
            }
        }
    }
    
    func resetWorkout() {
        restTimer?.invalidate()
        currentSession = nil
        currentProgram = nil
        currentLevel = nil
        currentExerciseIndex = 0
        currentSetIndex = 0
        workoutState = .notStarted
        restTimeRemaining = 0
    }
    
    // MARK: - Helper Methods
    
    func getCurrentExercise() -> Exercise? {
        guard let level = currentLevel,
              currentExerciseIndex < level.exercises.count else { return nil }
        return level.exercises[currentExerciseIndex]
    }
    
    func getCurrentSet() -> ExerciseSet? {
        guard let exercise = getCurrentExercise(),
              currentSetIndex < exercise.sets.count else { return nil }
        return exercise.sets[currentSetIndex]
    }
    
    func getProgress() -> (exerciseProgress: String, totalProgress: String) {
        guard let level = currentLevel else {
            return ("", "")
        }
        
        let exerciseProgress = "\(currentSetIndex + 1)/\(getCurrentExercise()?.sets.count ?? 0)"
        let totalProgress = "\(currentExerciseIndex + 1)/\(level.exercises.count)"
        
        return (exerciseProgress, totalProgress)
    }
    
    func isLevelUnlocked(programId: String, levelId: Int) -> Bool {
        return userProgress[programId]?.unlockedLevels.contains(levelId) ?? false
    }
    
    func getCurrentLevel(programId: String) -> Int {
        return userProgress[programId]?.currentLevel ?? 1
    }
    
    func getTotalSessions(programId: String) -> Int {
        return userProgress[programId]?.totalSessions ?? 0
    }
}
