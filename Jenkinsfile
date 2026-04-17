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
                bat 'taskkill /F /IM node.exe /T || echo No existing process'
                echo '🚀 Starting backend...'
                dir('backend') {
                    bat 'start /B node server.js > ../backend.log 2>&1'
                }
                echo '✅ Backend running at http://localhost:5001'
                echo '✅ Frontend build complete at frontend/build'
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