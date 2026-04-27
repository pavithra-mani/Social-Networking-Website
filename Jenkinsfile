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
                dir('backend') { bat 'npm install' }
            }
        }
        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') { bat 'npm install' }
            }
        }
        stage('Run Frontend Tests') {
            steps {
                dir('frontend') {
                    bat 'set CI=true && npm test -- --watchAll=false --passWithNoTests'
                }
            }
        }
        stage('Deploy') {
            steps {
                bat 'taskkill /F /IM node.exe /T & exit 0'
                dir('backend') {
                    bat '''
                        echo NEO4J_URI=bolt://localhost:7687> .env
                        echo NEO4J_USER=neo4j>> .env
                        echo NEO4J_PASSWORD=your_actual_password>> .env
                        echo PORT=5001>> .env
                    '''
                    bat 'start "backend-server" /min cmd /c "node server.js > ..\\backend.log 2>&1"'
                }
                dir('frontend') {
                    bat 'start "frontend-server" /min cmd /c "npm start > ..\\frontend.log 2>&1"'
                }
                echo '✅ Backend running at http://localhost:5001'
                echo '✅ Frontend starting at http://localhost:3000'
            }
        }
    }
    post {
        always {
            bat 'if exist backend.log copy backend.log backend-build.log'
            bat 'if exist frontend.log copy frontend.log frontend-build.log'
            archiveArtifacts artifacts: '**/*.log', allowEmptyArchive: true
            archiveArtifacts artifacts: 'backend/package.json, frontend/package.json', allowEmptyArchive: true
        }
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed.'
        }
    }
}