pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo '>>> STAGE 1: Pulling latest code from GitHub...'
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                echo '>>> STAGE 2: Building Docker images...'
                sh 'docker compose build --no-cache'
            }
        }

        stage('Test') {
            steps {
                echo '>>> STAGE 3: Running tests...'
                sh 'docker compose run --rm backend npm test'
            }
        }

        stage('Stop Old Containers') {
            steps {
                echo '>>> STAGE 4: Stopping old containers...'
                sh 'docker compose down || true'
            }
        }

        stage('Deploy') {
            steps {
                echo '>>> STAGE 5: Deploying new containers...'
                sh 'docker compose up -d'
            }
        }

        stage('Verify') {
            steps {
                echo '>>> STAGE 6: Verifying deployment...'
                sh '''
                    sleep 10
                    curl -f http://localhost:5000/api/health
                    echo ""
                    docker compose ps
                '''
            }
        }

    }

    post {
        success {
            echo '========================================'
            echo 'DEPLOYMENT SUCCEEDED - APP IS LIVE'
            echo '========================================'
        }
        failure {
            echo '========================================'
            echo 'DEPLOYMENT FAILED - READ LOGS ABOVE'
            echo '========================================'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
