pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Spring Boot Backend') {
            steps {
                dir('springboot-backend') {
                    sh '''
            export PATH=$PATH:/opt/homebrew/bin
            mvn clean package -DskipTests
            '''

                }
            }
        }

        stage('Install Frontend Dependencies & Build') {
            steps {
                dir('my-app') {
                    sh '''
            export PATH=$PATH:/opt/homebrew/bin
            npm ci
            npm run build
            '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Run Containers') {
            steps {
                
                sh 'docker-compose down'

                
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        success {
            echo "Deployment successful!"
        }
        failure {
            echo "Something went wrong during the pipeline."
        }
    }
}
