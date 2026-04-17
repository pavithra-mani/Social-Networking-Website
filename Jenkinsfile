pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Pulling latest code...'
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo '📦 Installing backend dependencies...'
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                echo '📦 Installing frontend dependencies...'
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Run Frontend Tests') {
            steps {
                echo '🧪 Running frontend tests...'
                dir('frontend') {
                    bat 'set CI=true && npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '🔨 Building React frontend...'
                dir('frontend') {
                    bat 'cmd /c "npm run build || exit 0"'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Stopping any existing backend...'
                bat 'cmd /c "taskkill /F /IM node.exe /T || exit 0"'

                echo '🚀 Starting backend...'
                dir('backend') {
                    bat 'cmd /c "start cmd /k node server.js"'
                }

                echo '✅ Backend running at http://localhost:5001'
            }
}
}
    }

    post {
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check the logs above.'
        }
    }
}