import SwiftUI

struct ContentView: View {
    @StateObject private var authViewModel = AuthViewModel()
    
    var body: some View {
        Group {
            if authViewModel.isSignedIn {
                MainTabView()
            } else {
                AuthView()
            }
        }
        .environmentObject(authViewModel)
    }
}

#Preview {
    ContentView()
}
