pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-hub-creds'
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_USER = 'your_dockerhub_user'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npx tsc --noEmit' // Basic compilation check
                    sh 'npm run test'     // Run Jest unit tests
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh "docker login -u ${USER} -p ${PASS}"
                        
                        // Build Backend
                        def backendImage = docker.build("${DOCKER_USER}/paper-trade-backend:${env.BUILD_ID}", "./backend")
                        backendImage.push()
                        backendImage.push("latest")

                        // Build Frontend
                        def frontendImage = docker.build("${DOCKER_USER}/paper-trade-frontend:${env.BUILD_ID}", "./frontend")
                        frontendImage.push()
                        frontendImage.push("latest")
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                kubectl set image deployment/paper-trade-backend backend=${DOCKER_USER}/paper-trade-backend:${BUILD_ID}
                kubectl set image deployment/paper-trade-frontend frontend=${DOCKER_USER}/paper-trade-frontend:${BUILD_ID}
                
                kubectl rollout status deployment/paper-trade-backend
                kubectl rollout status deployment/paper-trade-frontend
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Deployment successful! Environment is up-to-date.'
        }
        failure {
            echo 'Deployment failed! Check the pipeline logs.'
        }
    }
}
