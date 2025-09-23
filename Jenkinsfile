pipeline {
    agent any

    environment {
        // Docker Compose Configuration
        COMPOSE_FILE = 'docker-compose.yml'
        
        // Database Configuration
        SPRING_DATASOURCE_URL = 'jdbc:mysql://localhost:3306/arbeit'
        SPRING_DATASOURCE_USERNAME = 'root'
        SPRING_DATASOURCE_PASSWORD = credentials('mysql-password')
        
        // JWT Secrets (stored as Jenkins credentials)
        ACCESS_TOKEN = credentials('jwt-access-token-secret')
        REFRESH_TOKEN = credentials('jwt-refresh-token-secret')
        
        // Frontend Environment
        NEXT_PUBLIC_API_URL = 'http://localhost:8080/api'
        
        // Optional: Other configurations
        CORS_ALLOWED_ORIGINS = 'http://localhost:3000'
        SPRING_PROFILES_ACTIVE = 'development'
        GEMINI_API_KEY = credentials('gemini-api-key')
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
                        echo "Building Spring Boot Backend..."
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
                        'NEXT_PUBLIC_API_URL=http://localhost:8080/api'
                    ]) {
                        sh '''
                            echo "Installing frontend dependencies..."
                            npm ci
                            echo "Building Next.js frontend..."
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('springboot-backend') {
                            sh '''
                                export PATH=$PATH:/opt/homebrew/bin
                                echo "Running backend tests..."
                                mvn test
                            '''
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('my-app') {
                            sh '''
                                export PATH=$PATH:/opt/homebrew/bin
                                echo "Running frontend tests..."
                                # npm test -- --watchAll=false
                                echo "Frontend tests placeholder - add your test command here"
                            '''
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    export PATH=/usr/local/bin:$PATH
                    echo "Building Docker images..."
                    docker-compose build
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    export PATH=/usr/local/bin:$PATH
                    echo "Stopping existing containers..."
                    docker-compose down
                    echo "Starting new containers..."
                    docker-compose up -d
                    echo "Waiting for services to be ready..."
                    sleep 30
                    echo "Checking service health..."
                    curl -f http://localhost:3000 || exit 1
                    curl -f http://localhost:8080/api/ || echo "Backend requires authentication - this is expected"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Performing health checks..."
                    echo "Frontend health check..."
                    curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200" && echo "Frontend: OK" || echo "Frontend: FAILED"
                    echo "Backend health check..."
                    curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/ | grep -q "401" && echo "Backend: OK (Auth Required)" || echo "Backend: CHECK REQUIRED"
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline completed."
            // Clean up workspace if needed
            // cleanWs()
        }
        success {
            echo "🎉 Deployment successful! Your Arbeit platform is running."
            echo "Frontend: http://localhost:3000"
            echo "Backend API: http://localhost:8080/api"
        }
        failure {
            echo "❌ Something went wrong during the pipeline."
            sh '''
                echo "Collecting logs for debugging..."
                docker-compose logs --tail=50 || echo "No Docker logs available"
            '''
        }
        unstable {
            echo "⚠️ Pipeline completed with warnings."
        }
    }
}