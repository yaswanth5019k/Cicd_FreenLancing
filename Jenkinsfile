pipeline {
    agent any

    tools {
        jdk 'JDK_HOME'
        maven 'MAVEN_HOME'
        nodejs 'NODE_HOME'
    }

    environment {
        BACKEND_DIR = 'springboot-backend'
        FRONTEND_DIR = 'my-app'

        TOMCAT_URL = 'http://localhost:9191/manager/text'
        TOMCAT_USER = 'admin'
        TOMCAT_PASS = 'admin'

        BACKEND_WAR = 'springapp.war'
        FRONTEND_WAR = 'frontapp.war'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/yaswanth5019k/Freelanceing.git', branch: 'main'
            }
        }

        stage('Build Frontend (Next.js)') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    script {
                        def nodeHome = tool name: 'NODE_HOME', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                        env.PATH = "${nodeHome}/bin:${env.PATH}"
                    }
                    sh 'npm install'
                    sh 'npm run export-war'
                    sh 'ls -la out/ 2>/dev/null || echo "ERROR: out/ directory not created"'
                }
            }
        }

        stage('Package Frontend as WAR') {
            steps {
                dir("${env.FRONTEND_DIR}") {
                    sh """
                        mkdir -p frontapp_war/WEB-INF
                        cp -r out/* frontapp_war/
                        jar -cvf ${env.WORKSPACE}/${FRONTEND_WAR} -C frontapp_war .
                    """
                }
                sh 'ls -la ${WORKSPACE}/*.war 2>/dev/null || echo "No WAR files after frontend packaging"'
            }
        }

        stage('Build Backend (Spring Boot WAR)') {
            steps {
                dir("${env.BACKEND_DIR}") {
                    sh 'mvn clean package'
                    sh "cp target/*.war ${env.WORKSPACE}/${BACKEND_WAR}"
                }
                sh 'ls -la ${WORKSPACE}/*.war 2>/dev/null || echo "No WAR files in workspace"'
            }
        }

        stage('Deploy Backend to Tomcat (/springapp)') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh "ls -la ${BACKEND_WAR}"
                    sh """
                        curl -u ${TOMCAT_USER}:${TOMCAT_PASS} \\
                          --upload-file ${BACKEND_WAR} \\
                          "${TOMCAT_URL}/deploy?path=/springapp&update=true"
                    """
                }
            }
        }

        stage('Deploy Frontend to Tomcat (/frontapp)') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh "ls -la ${FRONTEND_WAR}"
                    sh """
                        curl -u ${TOMCAT_USER}:${TOMCAT_PASS} \\
                          --upload-file ${FRONTEND_WAR} \\
                          "${TOMCAT_URL}/deploy?path=/frontapp&update=true"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Backend deployed: http://54.159.15.170:9090/springapp"
            echo "✅ Frontend deployed: http://54.159.15.170:9090/frontapp"
        }
        failure {
            echo "❌ Build or deployment failed"
        }
    }
}
