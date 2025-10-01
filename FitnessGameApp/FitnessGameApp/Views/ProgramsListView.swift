import SwiftUI

struct ProgramsListView: View {
    @EnvironmentObject var workoutViewModel: WorkoutViewModel
    
    var body: some View {
        NavigationView {
            List(workoutViewModel.programs) { program in
                NavigationLink(destination: ProgramDetailView(program: program)) {
                    ProgramRowView(program: program)
                }
            }
            .navigationTitle("Programmes")
            .refreshable {
                await workoutViewModel.loadUserProgress()
            }
        }
    }
}

struct ProgramRowView: View {
    let program: WorkoutProgram
    @EnvironmentObject var workoutViewModel: WorkoutViewModel
    
    var body: some View {
        HStack {
            // Icône du programme
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.blue.gradient)
                .frame(width: 60, height: 60)
                .overlay {
                    Image(systemName: "figure.strengthtraining.traditional")
                        .font(.title2)
                        .foregroundColor(.white)
                }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(program.name)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(program.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                HStack {
                    Label("\(program.levels.count) niveaux", systemImage: "star.fill")
                        .font(.caption2)
                        .foregroundColor(.orange)
                    
                    Spacer()
                    
                    Text("Niveau \(workoutViewModel.getCurrentLevel(programId: program.id))")
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.blue.opacity(0.2))
                        .cornerRadius(4)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    NavigationView {
        ProgramsListView()
            .environmentObject(WorkoutViewModel())
    }
}
