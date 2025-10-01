import Foundation
import Firebase
import FirebaseAuth
import Combine

class AuthService: ObservableObject {
    @Published var currentUser: Firebase.User?
    @Published var isSignedIn = false
    
    private var authStateHandle: AuthStateDidChangeListenerHandle?
    
    init() {
        setupAuthStateListener()
    }
    
    deinit {
        if let handle = authStateHandle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
    }
    
    private func setupAuthStateListener() {
        authStateHandle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            DispatchQueue.main.async {
                self?.currentUser = user
                self?.isSignedIn = user != nil
            }
        }
    }
    
    // MARK: - Authentication Methods
    
    func signUp(email: String, password: String) async throws {
        let result = try await Auth.auth().createUser(withEmail: email, password: password)
        
        // Créer le profil utilisateur dans Firestore
        let user = User(email: email)
        try await FirestoreService.shared.createUser(user, uid: result.user.uid)
    }
    
    func signIn(email: String, password: String) async throws {
        _ = try await Auth.auth().signIn(withEmail: email, password: password)
    }
    
    func signOut() throws {
        try Auth.auth().signOut()
    }
    
    func resetPassword(email: String) async throws {
        try await Auth.auth().sendPasswordReset(withEmail: email)
    }
    
    var currentUserUID: String? {
        return currentUser?.uid
    }
}
