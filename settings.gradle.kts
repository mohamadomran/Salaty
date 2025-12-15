pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Salaty"

// App module
include(":app")

// Core modules
include(":core:designsystem")
include(":core:data")
include(":core:domain")
include(":core:common")

// Feature modules
include(":feature:home")
include(":feature:tracking")
include(":feature:qada")
include(":feature:statistics")
include(":feature:settings")
include(":feature:onboarding")
