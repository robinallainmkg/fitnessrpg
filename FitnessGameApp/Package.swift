// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "FitnessGameApp",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "FitnessGameApp",
            targets: ["FitnessGameApp"]),
    ],
    dependencies: [
        .package(url: "https://github.com/firebase/firebase-ios-sdk", from: "10.17.0")
    ],
    targets: [
        .target(
            name: "FitnessGameApp",
            dependencies: [
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestoreSwift", package: "firebase-ios-sdk")
            ]
        )
    ]
)
