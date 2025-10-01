import Foundation
import Combine

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isSignedIn = false
    @Published var isLoading = false
    @Published var errorMessage = ""
    @Published var currentUser: User?
    
    private let authService = AuthService()
    private let firestoreService = FirestoreService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        setupBindings()
    }
    
    private func setupBindings() {
        authService.$isSignedIn
            .assign(to: \.isSignedIn, on: self)
            .store(in: &cancellables)
        
        authService.$currentUser
            .sink { [weak self] firebaseUser in
                Task {
                    if let uid = firebaseUser?.uid {
                        await self?.loadCurrentUser(uid: uid)
                    } else {
                        self?.currentUser = nil
                    }
                }
            }
            .store(in: &cancellables)
    }
    
    private func loadCurrentUser(uid: String) async {
        do {
            currentUser = try await firestoreService.getUser(uid: uid)
        } catch {
            print("Erreur lors du chargement de l'utilisateur: \(error)")
        }
    }
    
    func signUp(email: String, password: String) async {
        isLoading = true
        errorMessage = ""
        
        do {
            try await authService.signUp(email: email, password: password)
        } catch {
            errorMessage = handleAuthError(error)
        }
        
        isLoading = false
    }
    
    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = ""
        
        do {
            try await authService.signIn(email: email, password: password)
        } catch {
            errorMessage = handleAuthError(error)
        }
        
        isLoading = false
    }
    
    func signOut() {
        do {
            try authService.signOut()
            currentUser = nil
        } catch {
            errorMessage = "Erreur lors de la déconnexion"
        }
    }
    
    func resetPassword(email: String) async {
        isLoading = true
        errorMessage = ""
        
        do {
            try await authService.resetPassword(email: email)
        } catch {
            errorMessage = handleAuthError(error)
        }
        
        isLoading = false
    }
    
    private func handleAuthError(_ error: Error) -> String {
        if let authError = error as NSError? {
            switch authError.code {
            case 17007: // Email already in use
                return "Cette adresse email est déjà utilisée"
            case 17008: // Invalid email
                return "Adresse email invalide"
            case 17026: // Weak password
                return "Le mot de passe doit contenir au moins 6 caractères"
            case 17011: // User not found
                return "Aucun compte trouvé avec cette adresse email"
            case 17009: // Wrong password
                return "Mot de passe incorrect"
            case 17020: // Network error
                return "Erreur de connexion. Vérifiez votre connexion internet"
            default:
                return "Une erreur s'est produite: \(error.localizedDescription)"
            }
        }
        return error.localizedDescription
    }
}
