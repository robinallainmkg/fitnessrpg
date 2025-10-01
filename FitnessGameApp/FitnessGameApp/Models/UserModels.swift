import Foundation
import FirebaseFirestore

// MARK: - User Model
struct User: Identifiable, Codable {
    @DocumentID var id: String?
    let email: String
    var totalXP: Int
    let createdAt: Date
    
    init(email: String, totalXP: Int = 0) {
        self.email = email
        self.totalXP = totalXP
        self.createdAt = Date()
    }
}

// MARK: - UserProgress Model
struct UserProgress: Identifiable, Codable {
    @DocumentID var id: String?
    let userId: String
    let programId: String
    var currentLevel: Int
    var unlockedLevels: [Int]
    var totalSessions: Int
    
    init(userId: String, programId: String) {
        self.userId = userId
        self.programId = programId
        self.currentLevel = 1
        self.unlockedLevels = [1]
        self.totalSessions = 0
    }
}

// MARK: - WorkoutSession Model
struct WorkoutSession: Identifiable, Codable {
    @DocumentID var id: String?
    let userId: String
    let programId: String
    let levelId: Int
    let date: Date
    var exercises: [ExerciseResult]
    var score: Int
    var xpEarned: Int
    var completed: Bool
    
    init(userId: String, programId: String, levelId: Int) {
        self.userId = userId
        self.programId = programId
        self.levelId = levelId
        self.date = Date()
        self.exercises = []
        self.score = 0
        self.xpEarned = 0
        self.completed = false
    }
}

// MARK: - ExerciseResult Model
struct ExerciseResult: Codable {
    let exerciseName: String
    var sets: [Int]
    let target: Int
    
    init(exerciseName: String, target: Int, setsCount: Int) {
        self.exerciseName = exerciseName
        self.target = target
        self.sets = Array(repeating: 0, count: setsCount)
    }
}
