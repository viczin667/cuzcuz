<?php
require_once 'database.php'; // Inclui o arquivo de conexão com o banco de dados

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? 0.0;
    $image_url = $_POST['image_url'] ?? '';

    // Validação básica
    if (empty($name) || empty($price)) {
        $message = '<p style="color: red;">Nome e Preço são obrigatórios!</p>';
    } else {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("INSERT INTO products (name, description, price, image_url) VALUES (:name, :description, :price, :image_url)");
        
        try {
            $stmt->execute([
                ':name' => $name,
                ':description' => $description,
                ':price' => $price,
                ':image_url' => $image_url
            ]);
            $message = '<p style="color: green;">Produto adicionado com sucesso!</p>';
            // Limpa o formulário após o sucesso
            $name = $description = $image_url = '';
            $price = 0.0;
        } catch (PDOException $e) {
            $message = '<p style="color: red;">Erro ao adicionar produto: ' . $e->getMessage() . '</p>';
        }
    }
}

// Recupera todos os produtos para exibição
$pdo = getDbConnection();
$products = $pdo->query("SELECT * FROM products ORDER BY created_at DESC")->fetchAll(PDO::FETCH_ASSOC);

?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel Admin - Cuscuz Vendas</title>
    <link rel="stylesheet" href="style.css"> <style>
        /* Estilos específicos para o admin */
        body {
            background-color: #0d0d0d; /* Fundo mais escuro para o admin */
            color: #eee;
        }
        .admin-container {
            max-width: 800px;
            margin: 50px auto;
            padding: 30px;
            background-color: #1a1a1a;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
        }
        .admin-container h1, .admin-container h2 {
            color: #00bfff;
            text-align: center;
            margin-bottom: 25px;
        }
        .admin-form .form-group label {
            color: #ddd;
        }
        .admin-form input[type="text"],
        .admin-form input[type="number"],
        .admin-form textarea {
            background-color: #2b2b2b;
            border: 1px solid #444;
            color: white;
            padding: 10px;
            width: calc(100% - 22px); /* Ajuste para padding */
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .admin-form button {
            background-color: #00bfff;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            width: 100%;
            transition: background-color 0.3s ease;
        }
        .admin-form button:hover {
            background-color: #0099cc;
        }
        .product-list {
            margin-top: 40px;
        }
        .product-list h2 {
            margin-bottom: 20px;
        }
        .product-item {
            background-color: #222;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            border-left: 5px solid #00bfff;
        }
        .product-item img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
            border: 2px solid #00bfff;
        }
        .product-details {
            flex-grow: 1;
        }
        .product-details h3 {
            margin: 0 0 5px 0;
            color: #eee;
            text-align: left;
            font-size: 1.2em;
        }
        .product-details p {
            margin: 0;
            color: #ccc;
            text-align: left;
            font-size: 0.9em;
        }
        .product-details .price {
            font-weight: bold;
            color: #ffd700; /* Cor dourada para o preço */
            font-size: 1.1em;
            margin-top: 5px;
        }
        /* Ajuste para o formulário de feedback no style.css para não afetar o admin */
        .form-group input[type="text"], .form-group input[type="email"], .form-group textarea {
             /* Remova a margem-bottom de 15px se estiver sobrepondo */
             margin-bottom: 0; 
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <h1>Painel Administrativo Cuscuz Vendas</h1>
        <?php echo $message; ?>

        <h2>Adicionar Novo Produto</h2>
        <form action="admin.php" method="POST" class="admin-form">
            <div class="form-group">
                <label for="name">Nome do Produto:</label>
                <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($name); ?>" required>
            </div>
            <div class="form-group">
                <label for="description">Descrição:</label>
                <textarea id="description" name="description" rows="4"><?php echo htmlspecialchars($description); ?></textarea>
            </div>
            <div class="form-group">
                <label for="price">Preço (R$):</label>
                <input type="number" id="price" name="price" step="0.01" value="<?php echo htmlspecialchars($price); ?>" required>
            </div>
            <div class="form-group">
                <label for="image_url">URL da Imagem (opcional):</label>
                <input type="text" id="image_url" name="image_url" value="<?php echo htmlspecialchars($image_url); ?>">
            </div>
            <button type="submit">Adicionar Produto</button>
        </form>

        <div class="product-list">
            <h2>Produtos Cadastrados</h2>
            <?php if (empty($products)): ?>
                <p>Nenhum produto cadastrado ainda.</p>
            <?php else: ?>
                <?php foreach ($products as $product): ?>
                    <div class="product-item">
                        <?php if (!empty($product['image_url'])): ?>
                            <img src="<?php echo htmlspecialchars($product['image_url']); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>">
                        <?php endif; ?>
                        <div class="product-details">
                            <h3><?php echo htmlspecialchars($product['name']); ?></h3>
                            <p><?php echo htmlspecialchars($product['description']); ?></p>
                            <p class="price">R$ <?php echo number_format($product['price'], 2, ',', '.'); ?></p>
                            <p style="font-size: 0.8em; color: #777;">ID: <?php echo $product['id']; ?> - Cadastrado em: <?php echo date('d/m/Y H:i', strtotime($product['created_at'])); ?></p>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>