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

                echo '🚀 Writing deploy script...'
                bat '''
                    echo $b = 'C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Social-Network-Pipeline\\backend' > C:\\deploy.ps1
                    echo $f = 'C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Social-Network-Pipeline\\frontend' >> C:\\deploy.ps1
                    echo Unregister-ScheduledTask -TaskName 'JenkinsBackend' -Confirm:$false -ErrorAction SilentlyContinue >> C:\\deploy.ps1
                    echo Unregister-ScheduledTask -TaskName 'JenkinsFrontend' -Confirm:$false -ErrorAction SilentlyContinue >> C:\\deploy.ps1
                    echo $ba = New-ScheduledTaskAction -Execute 'node.exe' -Argument 'server.js' -WorkingDirectory $b >> C:\\deploy.ps1
                    echo $fa = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c npm start' -WorkingDirectory $f >> C:\\deploy.ps1
                    echo $tr = New-ScheduledTaskTrigger -Once -At (Get-Date).AddSeconds(5) >> C:\\deploy.ps1
                    echo $st = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 8) >> C:\\deploy.ps1
                    echo $pr = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest >> C:\\deploy.ps1
                    echo Register-ScheduledTask -TaskName 'JenkinsBackend' -Action $ba -Trigger $tr -Settings $st -Principal $pr -Force >> C:\\deploy.ps1
                    echo Register-ScheduledTask -TaskName 'JenkinsFrontend' -Action $fa -Trigger $tr -Settings $st -Principal $pr -Force >> C:\\deploy.ps1
                    echo Start-ScheduledTask -TaskName 'JenkinsBackend' >> C:\\deploy.ps1
                    echo Start-ScheduledTask -TaskName 'JenkinsFrontend' >> C:\\deploy.ps1
                '''

                bat 'powershell -ExecutionPolicy Bypass -File C:\\deploy.ps1'

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