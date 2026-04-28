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
                        echo NEO4J_PASSWORD=password123>> .env
                        echo PORT=5001>> .env
                    '''
                }

                bat '''
                    echo @echo off > C:\\Users\\Prajwal\\Desktop\\start-app.bat
                    echo start "LogServer" /D "C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Social-Network-Pipeline\\backend" cmd /k ""C:\\Program Files\\nodejs\\node.exe" logserver.js" >> C:\\Users\\Prajwal\\Desktop\\start-app.bat
                    echo start "Backend" /D "C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Social-Network-Pipeline\\backend" cmd /k ""C:\\Program Files\\nodejs\\node.exe" server.js > C:\\Users\\Prajwal\\Desktop\\backend.log 2>&1" >> C:\\Users\\Prajwal\\Desktop\\start-app.bat
                    echo set CI= >> C:\\Users\\Prajwal\\Desktop\\start-app.bat
                    echo start "Frontend" /D "C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Social-Network-Pipeline\\frontend" cmd /k ""C:\\Program Files\\nodejs\\npm.cmd" start > C:\\Users\\Prajwal\\Desktop\\frontend.log 2>&1" >> C:\\Users\\Prajwal\\Desktop\\start-app.bat
                '''

                bat 'powershell -Command "Start-Process -FilePath \'C:\\Users\\Prajwal\\Desktop\\start-app.bat\' -WindowStyle Normal"'

                echo '✅ Backend running at http://localhost:5001'
                echo '✅ Frontend running at http://localhost:3000'
            }
        }
    }
    post {
        always {
            bat 'ping 127.0.0.1 -n 21 > nul'
            bat 'if exist C:\\Users\\Prajwal\\Desktop\\backend.log copy C:\\Users\\Prajwal\\Desktop\\backend.log backend.log'
            bat 'if exist C:\\Users\\Prajwal\\Desktop\\frontend.log copy C:\\Users\\Prajwal\\Desktop\\frontend.log frontend.log'
            archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
        }
        success { echo '🎉 Pipeline completed successfully!' }
        failure { echo '❌ Pipeline failed.' }
    }
}