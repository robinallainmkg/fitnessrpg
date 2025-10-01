import Foundation
import Firebase
import FirebaseFirestore

class FirestoreService: ObservableObject {
    static let shared = FirestoreService()
    private let db = Firestore.firestore()
    
    private init() {}
    
    // MARK: - User Operations
    
    func createUser(_ user: User, uid: String) async throws {
        try db.collection("users").document(uid).setData(from: user)
    }
    
    func getUser(uid: String) async throws -> User? {
        let document = try await db.collection("users").document(uid).getDocument()
        return try document.data(as: User.self)
    }
    
    func updateUserXP(uid: String, xpToAdd: Int) async throws {
        let userRef = db.collection("users").document(uid)
        try await userRef.updateData([
            "totalXP": FieldValue.increment(Int64(xpToAdd))
        ])
    }
    
    // MARK: - UserProgress Operations
    
    func getUserProgress(userId: String, programId: String) async throws -> UserProgress? {
        let query = db.collection("userProgress")
            .whereField("userId", isEqualTo: userId)
            .whereField("programId", isEqualTo: programId)
        
        let snapshot = try await query.getDocuments()
        return try snapshot.documents.first?.data(as: UserProgress.self)
    }
    
    func createOrUpdateUserProgress(_ progress: UserProgress) async throws {
        if let id = progress.id {
            try db.collection("userProgress").document(id).setData(from: progress)
        } else {
            _ = try db.collection("userProgress").addDocument(from: progress)
        }
    }
    
    func unlockNextLevel(userId: String, programId: String, newLevel: Int) async throws {
        let query = db.collection("userProgress")
            .whereField("userId", isEqualTo: userId)
            .whereField("programId", isEqualTo: programId)
        
        let snapshot = try await query.getDocuments()
        
        if let document = snapshot.documents.first {
            try await document.reference.updateData([
                "currentLevel": newLevel,
                "unlockedLevels": FieldValue.arrayUnion([newLevel])
            ])
        }
    }
    
    // MARK: - WorkoutSession Operations
    
    func saveWorkoutSession(_ session: WorkoutSession) async throws {
        _ = try db.collection("workoutSessions").addDocument(from: session)
        
        // Mettre à jour le nombre total de séances
        if let userId = session.id {
            let userProgressQuery = db.collection("userProgress")
                .whereField("userId", isEqualTo: session.userId)
                .whereField("programId", isEqualTo: session.programId)
            
            let snapshot = try await userProgressQuery.getDocuments()
            
            if let document = snapshot.documents.first {
                try await document.reference.updateData([
                    "totalSessions": FieldValue.increment(Int64(1))
                ])
            }
        }
    }
    
    func getUserWorkoutSessions(userId: String, limit: Int = 10) async throws -> [WorkoutSession] {
        let query = db.collection("workoutSessions")
            .whereField("userId", isEqualTo: userId)
            .order(by: "date", descending: true)
            .limit(to: limit)
        
        let snapshot = try await query.getDocuments()
        return try snapshot.documents.compactMap { try $0.data(as: WorkoutSession.self) }
    }
    
    func getWorkoutSessionsForProgram(userId: String, programId: String) async throws -> [WorkoutSession] {
        let query = db.collection("workoutSessions")
            .whereField("userId", isEqualTo: userId)
            .whereField("programId", isEqualTo: programId)
            .order(by: "date", descending: true)
        
        let snapshot = try await query.getDocuments()
        return try snapshot.documents.compactMap { try $0.data(as: WorkoutSession.self) }
    }
}
