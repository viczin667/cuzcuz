<?php
// Define o caminho para o arquivo do banco de dados SQLite
define('DB_FILE', __DIR__ . '/products.db');

function getDbConnection() {
    try {
        $pdo = new PDO('sqlite:' . DB_FILE);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        die("Erro de conexão com o banco de dados: " . $e->getMessage());
    }
}

function createProductsTable() {
    $pdo = getDbConnection();
    $sql = "s
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ";
    try {
        $pdo->exec($sql);
        // echo "Tabela 'products' criada ou já existe.<br>"; // Descomente para depuração
    } catch (PDOException $e) {
        die("Erro ao criar tabela: " . $e->getMessage());
    }
}

// Garante que a tabela seja criada ao incluir este arquivo
createProductsTable();

?>