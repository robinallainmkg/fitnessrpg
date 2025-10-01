import SwiftUI

struct AuthView: View {
    @State private var isLoginMode = true
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Logo ou titre
                VStack {
                    Image(systemName: "dumbbell.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.blue)
                    
                    Text("Fitness Game")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                }
                .padding(.top, 50)
                
                Spacer()
                
                // Formulaire
                VStack(spacing: 15) {
                    TextField("Email", text: $email)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                    
                    SecureField("Mot de passe", text: $password)
                        .textFieldStyle(.roundedBorder)
                    
                    if !isLoginMode {
                        SecureField("Confirmer le mot de passe", text: $confirmPassword)
                            .textFieldStyle(.roundedBorder)
                    }
                }
                .padding(.horizontal, 30)
                
                // Message d'erreur
                if !authViewModel.errorMessage.isEmpty {
                    Text(authViewModel.errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 30)
                }
                
                // Bouton principal
                Button(action: handleSubmit) {
                    if authViewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text(isLoginMode ? "Se connecter" : "S'inscrire")
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
                .padding(.horizontal, 30)
                .disabled(authViewModel.isLoading || !isFormValid)
                
                // Bouton pour changer de mode
                Button(action: {
                    isLoginMode.toggle()
                    authViewModel.errorMessage = ""
                }) {
                    Text(isLoginMode ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter")
                        .foregroundColor(.blue)
                }
                .padding(.top, 10)
                
                if isLoginMode {
                    Button("Mot de passe oublié ?") {
                        // TODO: Implémenter la réinitialisation du mot de passe
                    }
                    .foregroundColor(.blue)
                    .font(.caption)
                }
                
                Spacer()
            }
            .navigationBarHidden(true)
        }
    }
    
    private var isFormValid: Bool {
        if isLoginMode {
            return !email.isEmpty && !password.isEmpty
        } else {
            return !email.isEmpty && !password.isEmpty && password == confirmPassword && password.count >= 6
        }
    }
    
    private func handleSubmit() {
        Task {
            if isLoginMode {
                await authViewModel.signIn(email: email, password: password)
            } else {
                await authViewModel.signUp(email: email, password: password)
            }
        }
    }
}

#Preview {
    AuthView()
        .environmentObject(AuthViewModel())
}
