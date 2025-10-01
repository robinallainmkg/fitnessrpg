import Foundation

class WorkoutProgramService: ObservableObject {
    static let shared = WorkoutProgramService()
    
    private init() {}
    
    // MARK: - Données hardcodées des programmes
    
    func getAllPrograms() -> [WorkoutProgram] {
        return [
            createMuscleUpProgram(),
            // Ajouter d'autres programmes ici
        ]
    }
    
    func getProgram(id: String) -> WorkoutProgram? {
        return getAllPrograms().first { $0.id == id }
    }
    
    // MARK: - Programme Muscle-Up
    
    private func createMuscleUpProgram() -> WorkoutProgram {
        return WorkoutProgram(
            id: "muscleup",
            name: "Muscle-Up Mastery",
            description: "Progression en 6 niveaux pour maîtriser le muscle-up",
            levels: [
                createLevel1_LeSoldat(),
                createLevel2_LeGuerrierDeFer(),
                createLevel3_LeTitanDacier(),
                createLevel4_LeConquerantDuCiel(),
                createLevel5_LeMaitreDeLapesanteur(),
                createLevel6_LeLegendaireMuscleUp()
            ]
        )
    }
    
    // MARK: - Niveaux du programme Muscle-Up
    
    private func createLevel1_LeSoldat() -> WorkoutLevel {
        let exercises = [
            Exercise(
                name: "Tractions assistées",
                description: "Tractions avec assistance élastique ou aide d'un partenaire",
                sets: [
                    ExerciseSet(targetReps: 5, setNumber: 1),
                    ExerciseSet(targetReps: 5, setNumber: 2),
                    ExerciseSet(targetReps: 4, setNumber: 3),
                    ExerciseSet(targetReps: 4, setNumber: 4),
                    ExerciseSet(targetReps: 3, setNumber: 5)
                ],
                restTime: 90,
                instructions: [
                    "Utilisez un élastique ou l'aide d'un partenaire",
                    "Concentrez-vous sur la technique",
                    "Montée explosive, descente contrôlée"
                ]
            ),
            Exercise(
                name: "Pompes",
                description: "Pompes classiques au sol",
                sets: [
                    ExerciseSet(targetReps: 10, setNumber: 1),
                    ExerciseSet(targetReps: 10, setNumber: 2),
                    ExerciseSet(targetReps: 8, setNumber: 3),
                    ExerciseSet(targetReps: 8, setNumber: 4),
                    ExerciseSet(targetReps: 6, setNumber: 5)
                ],
                restTime: 60,
                instructions: [
                    "Corps aligné de la tête aux pieds",
                    "Descente contrôlée, montée explosive",
                    "Ne pas cambrer le dos"
                ]
            ),
            Exercise(
                name: "Dips sur chaise",
                description: "Dips en utilisant une chaise ou un banc",
                sets: [
                    ExerciseSet(targetReps: 8, setNumber: 1),
                    ExerciseSet(targetReps: 8, setNumber: 2),
                    ExerciseSet(targetReps: 6, setNumber: 3),
                    ExerciseSet(targetReps: 6, setNumber: 4),
                    ExerciseSet(targetReps: 5, setNumber: 5)
                ],
                restTime: 75,
                instructions: [
                    "Mains sur le bord de la chaise",
                    "Descendre jusqu'à 90° aux coudes",
                    "Remonter en poussant fort"
                ]
            ),
            Exercise(
                name: "Planche",
                description: "Maintien de la position planche",
                sets: [
                    ExerciseSet(targetReps: 0, targetTime: 30, setNumber: 1),
                    ExerciseSet(targetReps: 0, targetTime: 30, setNumber: 2),
                    ExerciseSet(targetReps: 0, targetTime: 25, setNumber: 3),
                    ExerciseSet(targetReps: 0, targetTime: 25, setNumber: 4),
                    ExerciseSet(targetReps: 0, targetTime: 20, setNumber: 5)
                ],
                restTime: 60,
                instructions: [
                    "Corps aligné et rigide",
                    "Respiration régulière",
                    "Abdos contractés"
                ]
            )
        ]
        
        return WorkoutLevel(
            id: 1,
            name: "Niveau 1 - Le Soldat",
            description: "Construire les bases de force nécessaires",
            exercises: exercises,
            requiredScore: 800
        )
    }
    
    private func createLevel2_LeGuerrierDeFer() -> WorkoutLevel {
        let exercises = [
            Exercise(
                name: "Tractions strictes",
                description: "Tractions complètes sans assistance",
                sets: [
                    ExerciseSet(targetReps: 6, setNumber: 1),
                    ExerciseSet(targetReps: 6, setNumber: 2),
                    ExerciseSet(targetReps: 5, setNumber: 3),
                    ExerciseSet(targetReps: 5, setNumber: 4),
                    ExerciseSet(targetReps: 4, setNumber: 5)
                ],
                restTime: 120
            ),
            Exercise(
                name: "Pompes diamant",
                description: "Pompes avec les mains en forme de diamant",
                sets: [
                    ExerciseSet(targetReps: 8, setNumber: 1),
                    ExerciseSet(targetReps: 8, setNumber: 2),
                    ExerciseSet(targetReps: 6, setNumber: 3),
                    ExerciseSet(targetReps: 6, setNumber: 4),
                    ExerciseSet(targetReps: 5, setNumber: 5)
                ],
                restTime: 90
            ),
            Exercise(
                name: "Dips sur barres parallèles",
                description: "Dips complets sur barres parallèles",
                sets: [
                    ExerciseSet(targetReps: 10, setNumber: 1),
                    ExerciseSet(targetReps: 10, setNumber: 2),
                    ExerciseSet(targetReps: 8, setNumber: 3),
                    ExerciseSet(targetReps: 8, setNumber: 4),
                    ExerciseSet(targetReps: 6, setNumber: 5)
                ],
                restTime: 90
            ),
            Exercise(
                name: "L-Sit progression",
                description: "Maintien L-Sit ou genoux levés",
                sets: [
                    ExerciseSet(targetReps: 0, targetTime: 15, setNumber: 1),
                    ExerciseSet(targetReps: 0, targetTime: 15, setNumber: 2),
                    ExerciseSet(targetReps: 0, targetTime: 12, setNumber: 3),
                    ExerciseSet(targetReps: 0, targetTime: 12, setNumber: 4),
                    ExerciseSet(targetReps: 0, targetTime: 10, setNumber: 5)
                ],
                restTime: 90
            )
        ]
        
        return WorkoutLevel(
            id: 2,
            name: "Niveau 2 - Le Guerrier de Fer",
            description: "Développer la force pure",
            exercises: exercises,
            requiredScore: 800
        )
    }
    
    private func createLevel3_LeTitanDacier() -> WorkoutLevel {
        let exercises = [
            Exercise(
                name: "Tractions lestées",
                description: "Tractions avec poids additionnel (5-10kg)",
                sets: [
                    ExerciseSet(targetReps: 5, setNumber: 1),
                    ExerciseSet(targetReps: 5, setNumber: 2),
                    ExerciseSet(targetReps: 4, setNumber: 3),
                    ExerciseSet(targetReps: 4, setNumber: 4),
                    ExerciseSet(targetReps: 3, setNumber: 5)
                ],
                restTime: 150
            ),
            Exercise(
                name: "Pompes sur une main (assistées)",
                description: "Progression vers les pompes à une main",
                sets: [
                    ExerciseSet(targetReps: 3, setNumber: 1),
                    ExerciseSet(targetReps: 3, setNumber: 2),
                    ExerciseSet(targetReps: 2, setNumber: 3),
                    ExerciseSet(targetReps: 2, setNumber: 4),
                    ExerciseSet(targetReps: 2, setNumber: 5)
                ],
                restTime: 120
            ),
            Exercise(
                name: "Dips lestés",
                description: "Dips avec poids additionnel (5-10kg)",
                sets: [
                    ExerciseSet(targetReps: 8, setNumber: 1),
                    ExerciseSet(targetReps: 8, setNumber: 2),
                    ExerciseSet(targetReps: 6, setNumber: 3),
                    ExerciseSet(targetReps: 6, setNumber: 4),
                    ExerciseSet(targetReps: 5, setNumber: 5)
                ],
                restTime: 120
            ),
            Exercise(
                name: "Muscle-up négatif",
                description: "Phase descendante du muscle-up",
                sets: [
                    ExerciseSet(targetReps: 3, setNumber: 1),
                    ExerciseSet(targetReps: 3, setNumber: 2),
                    ExerciseSet(targetReps: 2, setNumber: 3),
                    ExerciseSet(targetReps: 2, setNumber: 4),
                    ExerciseSet(targetReps: 2, setNumber: 5)
                ],
                restTime: 180
            )
        ]
        
        return WorkoutLevel(
            id: 3,
            name: "Niveau 3 - Le Titan d'Acier",
            description: "Maîtriser la transition",
            exercises: exercises,
            requiredScore: 800
        )
    }
    
    private func createLevel4_LeConquerantDuCiel() -> WorkoutLevel {
        let exercises = [
            Exercise(
                name: "Tractions haute (chest to bar)",
                description: "Tractions jusqu'à la poitrine",
                sets: [
                    ExerciseSet(targetReps: 8, setNumber: 1),
                    ExerciseSet(targetReps: 8, setNumber: 2),
                    ExerciseSet(targetReps: 6, setNumber: 3),
                    ExerciseSet(targetReps: 6, setNumber: 4),
                    ExerciseSet(targetReps: 5, setNumber: 5)
                ],
                restTime: 120
            ),
            Exercise(
                name: "False grip hang",
                description: "Suspension en prise muscle-up",
                sets: [
                    ExerciseSet(targetReps: 0, targetTime: 20, setNumber: 1),
                    ExerciseSet(targetReps: 0, targetTime: 20, setNumber: 2),
                    ExerciseSet(targetReps: 0, targetTime: 15, setNumber: 3),
                    ExerciseSet(targetReps: 0, targetTime: 15, setNumber: 4),
                    ExerciseSet(targetReps: 0, targetTime: 10, setNumber: 5)
                ],
                restTime: 90
            ),
            Exercise(
                name: "Transition assistée",
                description: "Transition du muscle-up avec assistance",
                sets: [
                    ExerciseSet(targetReps: 5, setNumber: 1),
                    ExerciseSet(targetReps: 5, setNumber: 2),
                    ExerciseSet(targetReps: 4, setNumber: 3),
                    ExerciseSet(targetReps: 4, setNumber: 4),
                    ExerciseSet(targetReps: 3, setNumber: 5)
                ],
                restTime: 180
            ),
            Exercise(
                name: "Ring support hold",
                description: "Maintien en position haute sur anneaux",
                sets: [
                    ExerciseSet(targetReps: 0, targetTime: 30, setNumber: 1),
                    ExerciseSet(targetReps: 0, targetTime: 30, setNumber: 2),
                    ExerciseSet(targetReps: 0, targetTime: 25, setNumber: 3),
                    ExerciseSet(targetReps: 0, targetTime: 25, setNumber: 4),
                    ExerciseSet(targetReps: 0, targetTime: 20, setNumber: 5)
                ],
                restTime: 90
            )
        ]
        
        return WorkoutLevel(
            id: 4,
            name: "Niveau 4 - Le Conquérant du Ciel",
            description: "Perfectionner la technique",
            exercises: exercises,
            requiredScore: 800
        )
    }
    
    private func createLevel5_LeMaitreDeLapesanteur() -> WorkoutLevel {
        let exercises = [
            Exercise(
                name: "Muscle-up assisté léger",
                description: "Muscle-up avec assistance minimale",
                sets: [
                    ExerciseSet(targetReps: 3, setNumber: 1),
                    ExerciseSet(targetReps: 3, setNumber: 2),
                    ExerciseSet(targetReps: 2, setNumber: 3),
                    ExerciseSet(targetReps: 2, setNumber: 4),
                    ExerciseSet(targetReps: 2, setNumber: 5)
                ],
                restTime: 240
            ),
            Exercise(
                name: "Kipping pull-ups",
                description: "Tractions avec élan contrôlé",
                sets: [
                    ExerciseSet(targetReps: 10, setNumber: 1),
                    ExerciseSet(targetReps: 10, setNumber: 2),
                    ExerciseSet(targetReps: 8, setNumber: 3),
                    ExerciseSet(targetReps: 8, setNumber: 4),
                    ExerciseSet(targetReps: 6, setNumber: 5)
                ],
                restTime: 120
            ),
            Exercise(
                name: "Dips explosifs",
                description: "Dips avec poussée explosive",
                sets: [
                    ExerciseSet(targetReps: 6, setNumber: 1),
                    ExerciseSet(targetReps: 6, setNumber: 2),
                    ExerciseSet(targetReps: 5, setNumber: 3),
                    ExerciseSet(targetReps: 5, setNumber: 4),
                    ExerciseSet(targetReps: 4, setNumber: 5)
                ],
                restTime: 120
            ),
            Exercise(
                name: "Archer pull-ups",
                description: "Tractions asymétriques",
                sets: [
                    ExerciseSet(targetReps: 4, setNumber: 1),
                    ExerciseSet(targetReps: 4, setNumber: 2),
                    ExerciseSet(targetReps: 3, setNumber: 3),
                    ExerciseSet(targetReps: 3, setNumber: 4),
                    ExerciseSet(targetReps: 2, setNumber: 5)
                ],
                restTime: 150
            )
        ]
        
        return WorkoutLevel(
            id: 5,
            name: "Niveau 5 - Le Maître de l'Apesanteur",
            description: "Approcher la perfection",
            exercises: exercises,
            requiredScore: 800
        )
    }
    
    private func createLevel6_LeLegendaireMuscleUp() -> WorkoutLevel {
        let exercises = [
            Exercise(
                name: "Muscle-up strict",
                description: "Muscle-up complet sans assistance",
                sets: [
                    ExerciseSet(targetReps: 1, setNumber: 1),
                    ExerciseSet(targetReps: 1, setNumber: 2),
                    ExerciseSet(targetReps: 1, setNumber: 3),
                    ExerciseSet(targetReps: 1, setNumber: 4),
                    ExerciseSet(targetReps: 1, setNumber: 5)
                ],
                restTime: 300
            ),
            Exercise(
                name: "Muscle-up kipping",
                description: "Muscle-up avec élan maîtrisé",
                sets: [
                    ExerciseSet(targetReps: 3, setNumber: 1),
                    ExerciseSet(targetReps: 3, setNumber: 2),
                    ExerciseSet(targetReps: 2, setNumber: 3),
                    ExerciseSet(targetReps: 2, setNumber: 4),
                    ExerciseSet(targetReps: 2, setNumber: 5)
                ],
                restTime: 240
            ),
            Exercise(
                name: "Weighted pull-ups",
                description: "Tractions lestées (15-20kg)",
                sets: [
                    ExerciseSet(targetReps: 5, setNumber: 1),
                    ExerciseSet(targetReps: 5, setNumber: 2),
                    ExerciseSet(targetReps: 4, setNumber: 3),
                    ExerciseSet(targetReps: 4, setNumber: 4),
                    ExerciseSet(targetReps: 3, setNumber: 5)
                ],
                restTime: 180
            ),
            Exercise(
                name: "One arm pull-up progression",
                description: "Progression vers la traction à un bras",
                sets: [
                    ExerciseSet(targetReps: 2, setNumber: 1),
                    ExerciseSet(targetReps: 2, setNumber: 2),
                    ExerciseSet(targetReps: 1, setNumber: 3),
                    ExerciseSet(targetReps: 1, setNumber: 4),
                    ExerciseSet(targetReps: 1, setNumber: 5)
                ],
                restTime: 240
            )
        ]
        
        return WorkoutLevel(
            id: 6,
            name: "Niveau 6 - Le Légendaire Muscle-Up",
            description: "Maîtrise absolue du mouvement",
            exercises: exercises,
            requiredScore: 800
        )
    }
}
