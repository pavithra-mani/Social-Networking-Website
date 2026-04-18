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

                echo '🚀 Launching backend and frontend...'
                bat '''
                    powershell -Command "& {
                        $backendPath = 'C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Social-Network-Pipeline\\backend'
                        $frontendPath = 'C:\\ProgramData\\Jenkins\\.jenkins\\workspace\\Social-Network-Pipeline\\frontend'
                        
                        $backendAction = New-ScheduledTaskAction -Execute 'node.exe' -Argument 'server.js' -WorkingDirectory $backendPath
                        $frontendAction = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c npm start' -WorkingDirectory $frontendPath
                        
                        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddSeconds(3)
                        $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 8)
                        $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
                        
                        Unregister-ScheduledTask -TaskName 'JenkinsBackend' -Confirm:$false -ErrorAction SilentlyContinue
                        Unregister-ScheduledTask -TaskName 'JenkinsFrontend' -Confirm:$false -ErrorAction SilentlyContinue
                        
                        Register-ScheduledTask -TaskName 'JenkinsBackend' -Action $backendAction -Trigger $trigger -Settings $settings -Principal $principal -Force
                        Register-ScheduledTask -TaskName 'JenkinsFrontend' -Action $frontendAction -Trigger $trigger -Settings $settings -Principal $principal -Force
                        
                        Start-ScheduledTask -TaskName 'JenkinsBackend'
                        Start-ScheduledTask -TaskName 'JenkinsFrontend'
                        
                        Write-Host 'Tasks launched successfully'
                    }"
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