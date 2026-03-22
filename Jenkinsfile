pipeline {

    agent any

    environment {
        JWT_SECRET = credentials('jwt-secret')
    }

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
                echo '>>> STAGE 3: Running Jest tests...'
                sh '''
                    docker compose run --rm \
                      -e MONGODB_URI=mongodb://mongodb:27017/fullstackdb_test \
                      -e JWT_SECRET=test_secret_for_jest \
                      backend npm test
                '''
            }
        }

        stage('Stop Old Containers') {
            steps {
                echo '>>> STAGE 4: Stopping old containers...'
                sh 'docker compose down --remove-orphans || true'
                sh 'docker rm -f mongodb backend frontend || true'
            }
        }

        stage('Deploy') {
            steps {
                echo '>>> STAGE 5: Deploying new containers...'
                sh 'JWT_SECRET=${JWT_SECRET} docker compose up -d --force-recreate'
            }
        }

        stage('Verify') {
            steps {
                echo '>>> STAGE 6: Verifying deployment...'
                sh '''
                    sleep 15
                    curl -f http://172.17.0.1:5000/api/health
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
