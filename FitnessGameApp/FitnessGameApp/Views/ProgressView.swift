import SwiftUI
import Charts

struct ProgressView: View {
    @EnvironmentObject var workoutViewModel: WorkoutViewModel
    @State private var selectedTimeframe: TimeFrame = .week
    
    enum TimeFrame: String, CaseIterable {
        case week = "7J"
        case month = "30J"
        case all = "Tout"
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Sélecteur de période
                    timeFramePicker
                    
                    // Graphique des scores
                    scoreChart
                    
                    // Statistiques globales
                    statsGrid
                    
                    // Historique des séances
                    sessionHistory
                }
                .padding()
            }
            .navigationTitle("Progrès")
            .refreshable {
                await workoutViewModel.loadWorkoutHistory()
            }
        }
    }
    
    private var timeFramePicker: some View {
        Picker("Période", selection: $selectedTimeframe) {
            ForEach(TimeFrame.allCases, id: \.self) { timeframe in
                Text(timeframe.rawValue).tag(timeframe)
            }
        }
        .pickerStyle(.segmented)
    }
    
    private var scoreChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Évolution du score")
                .font(.headline)
            
            if filteredSessions.isEmpty {
                VStack {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                    Text("Aucune donnée disponible")
                        .foregroundColor(.secondary)
                }
                .frame(height: 200)
                .frame(maxWidth: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.systemGray6))
                )
            } else {
                Chart(filteredSessions) { session in
                    LineMark(
                        x: .value("Date", session.date),
                        y: .value("Score", session.score)
                    )
                    .foregroundStyle(.blue)
                    .interpolationMethod(.catmullRom)
                    
                    PointMark(
                        x: .value("Date", session.date),
                        y: .value("Score", session.score)
                    )
                    .foregroundStyle(.blue)
                }
                .frame(height: 200)
                .chartYScale(domain: 0...1000)
                .chartXAxis {
                    AxisMarks(values: .stride(by: .day)) { _ in
                        AxisValueLabel(format: .dateTime.day().month(.abbreviated))
                        AxisGridLine()
                        AxisTick()
                    }
                }
                .chartYAxis {
                    AxisMarks { _ in
                        AxisValueLabel()
                        AxisGridLine()
                        AxisTick()
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
        )
    }
    
    private var statsGrid: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Statistiques")
                .font(.headline)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                StatCardView(
                    title: "Séances totales",
                    value: "\(workoutViewModel.workoutSessions.count)",
                    icon: "checkmark.circle.fill",
                    color: .green
                )
                
                StatCardView(
                    title: "Score moyen",
                    value: "\(averageScore)",
                    icon: "chart.bar.fill",
                    color: .blue
                )
                
                StatCardView(
                    title: "Meilleur score",
                    value: "\(bestScore)",
                    icon: "star.fill",
                    color: .orange
                )
                
                StatCardView(
                    title: "XP total",
                    value: "\(totalXP)",
                    icon: "bolt.fill",
                    color: .purple
                )
            }
        }
    }
    
    private var sessionHistory: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Historique récent")
                .font(.headline)
            
            if workoutViewModel.workoutSessions.isEmpty {
                VStack {
                    Image(systemName: "clock")
                        .font(.system(size: 40))
                        .foregroundColor(.gray)
                    Text("Aucune séance enregistrée")
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.systemGray6))
                )
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(Array(workoutViewModel.workoutSessions.prefix(5))) { session in
                        SessionRowView(session: session)
                    }
                }
            }
        }
    }
    
    private var filteredSessions: [WorkoutSession] {
        let now = Date()
        let cutoffDate: Date
        
        switch selectedTimeframe {
        case .week:
            cutoffDate = Calendar.current.date(byAdding: .day, value: -7, to: now) ?? now
        case .month:
            cutoffDate = Calendar.current.date(byAdding: .day, value: -30, to: now) ?? now
        case .all:
            return workoutViewModel.workoutSessions
        }
        
        return workoutViewModel.workoutSessions.filter { $0.date >= cutoffDate }
    }
    
    private var averageScore: Int {
        guard !workoutViewModel.workoutSessions.isEmpty else { return 0 }
        let total = workoutViewModel.workoutSessions.reduce(0) { $0 + $1.score }
        return total / workoutViewModel.workoutSessions.count
    }
    
    private var bestScore: Int {
        workoutViewModel.workoutSessions.map(\.score).max() ?? 0
    }
    
    private var totalXP: Int {
        workoutViewModel.workoutSessions.reduce(0) { $0 + $1.xpEarned }
    }
}

struct StatCardView: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }
            
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(value)
                        .font(.title2)
                        .fontWeight(.bold)
                    Text(title)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
        )
    }
}

struct SessionRowView: View {
    let session: WorkoutSession
    
    var body: some View {
        HStack {
            // Indicateur de score
            Circle()
                .fill(scoreColor)
                .frame(width: 12, height: 12)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(programName)
                    .font(.headline)
                Text("Niveau \(session.levelId)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(session.score)/1000")
                    .font(.headline)
                    .foregroundColor(scoreColor)
                Text(formattedDate)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(.systemGray6))
        )
    }
    
    private var scoreColor: Color {
        switch session.score {
        case 900...1000: return .green
        case 700...899: return .orange
        default: return .red
        }
    }
    
    private var programName: String {
        // Ici on pourrait faire un mapping des IDs vers les noms
        switch session.programId {
        case "muscleup": return "Muscle-Up"
        default: return "Programme"
        }
    }
    
    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: session.date)
    }
}

#Preview {
    ProgressView()
        .environmentObject(WorkoutViewModel())
}
