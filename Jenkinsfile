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
                        echo NEO4J_PASSWORD=your_actual_password>> .env
                        echo PORT=5001>> .env
                    '''
                }

                echo '🚀 Starting backend and frontend...'
                bat '''
                    powershell -Command "Start-Process cmd -ArgumentList '/k', 'cd /d C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Social-Network-Pipeline\\backend && node server.js' -WindowStyle Normal"
                    powershell -Command "Start-Process cmd -ArgumentList '/k', 'cd /d C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Social-Network-Pipeline\\frontend && set CI=& npm start' -WindowStyle Normal"
                '''

                echo '✅ Backend starting at http://localhost:5001'
                echo '✅ Frontend starting at http://localhost:3000'
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