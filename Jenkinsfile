pipeline {
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Pulling latest code from GitHub...'
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Deploy') {
            steps {
                bat 'taskkill /F /IM node.exe 2>nul || exit 0'
                dir('backend') {
                    bat 'start "SNW-Backend" /B node server.js'
                }
                echo 'App deployed at http://localhost:5001'
            }
        }
    }

    post {
        success {
            echo 'Pipeline SUCCESS - App is running'
        }
        failure {
            echo 'Pipeline FAILED - Check logs above'
        }
    }
}