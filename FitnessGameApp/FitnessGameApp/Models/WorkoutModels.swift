import Foundation

// MARK: - WorkoutProgram Model
struct WorkoutProgram: Identifiable, Codable {
    let id: String
    let name: String
    let description: String
    let levels: [WorkoutLevel]
    let imageURL: String?
    
    init(id: String, name: String, description: String, levels: [WorkoutLevel], imageURL: String? = nil) {
        self.id = id
        self.name = name
        self.description = description
        self.levels = levels
        self.imageURL = imageURL
    }
}

// MARK: - WorkoutLevel Model
struct WorkoutLevel: Identifiable, Codable {
    let id: Int
    let name: String
    let description: String
    let exercises: [Exercise]
    let requiredScore: Int // Score minimum pour débloquer le niveau suivant (ex: 800/1000)
    
    init(id: Int, name: String, description: String, exercises: [Exercise], requiredScore: Int = 800) {
        self.id = id
        self.name = name
        self.description = description
        self.exercises = exercises
        self.requiredScore = requiredScore
    }
}

// MARK: - Exercise Model
struct Exercise: Identifiable, Codable {
    let id: UUID
    let name: String
    let description: String
    let sets: [ExerciseSet]
    let restTime: Int // en secondes
    let instructions: [String]
    
    init(name: String, description: String, sets: [ExerciseSet], restTime: Int = 90, instructions: [String] = []) {
        self.id = UUID()
        self.name = name
        self.description = description
        self.sets = sets
        self.restTime = restTime
        self.instructions = instructions
    }
}

// MARK: - ExerciseSet Model
struct ExerciseSet: Identifiable, Codable {
    let id: UUID
    let targetReps: Int
    let targetTime: Int? // Pour les exercices en temps (ex: planche)
    let setNumber: Int
    
    init(targetReps: Int, targetTime: Int? = nil, setNumber: Int) {
        self.id = UUID()
        self.targetReps = targetReps
        self.targetTime = targetTime
        self.setNumber = setNumber
    }
}

// MARK: - Workout State Enums
enum WorkoutState {
    case notStarted
    case inProgress
    case resting
    case completed
}

enum ExerciseType {
    case reps
    case time
    case repsAndTime
}
