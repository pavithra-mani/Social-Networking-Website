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
        stage('Deploy') {
            steps {
                echo '🚀 Stopping any existing processes...'
                bat 'taskkill /F /IM node.exe /T & exit 0'

                echo '🚀 Writing environment config...'
                dir('backend') {
                    bat '''
                        echo NEO4J_URI=bolt://localhost:7687> .env
                        echo NEO4J_USER=neo4j>> .env
                        echo NEO4J_PASSWORD=your_neo4j_password>> .env
                        echo PORT=5001>> .env
                    '''
                    bat 'start "backend-server" /min cmd /c "node server.js > ..\\backend.log 2>&1"'
                }

                echo '🚀 Starting frontend...'
                dir('frontend') {
                    bat 'start "frontend-server" /min cmd /c "npm start > ..\\frontend.log 2>&1"'
                }

                echo '✅ Backend running at http://localhost:5001'
                echo '✅ Frontend running at http://localhost:3000'
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