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
                    withEnv([
                        'PATH+HOME=/opt/homebrew/bin',  
                        'MONGO_URL=mongodb://localhost:27017/dummy',
                        'ACCESS_TOKEN=dev-access-token',
                        'REFRESH_TOKEN=dev-refresh-token'
                    ]) {
                        sh '''
                        npm ci
                        npm run build
                        '''
                    }
                }
            }
        }

        stage('Build Docker Images') {
    steps {
        sh '/usr/local/bin/docker-compose build'
    }
}

stage('Run Containers') {
    steps {
        sh '/usr/local/bin/docker-compose down'
        sh '/usr/local/bin/docker-compose up -d'
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
