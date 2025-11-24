<?php
header('Content-Type: application/json; charset=utf-8');

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

// Receber e sanitizar os dados
$nome = isset($_POST['nome']) ? trim($_POST['nome']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$assunto = isset($_POST['assunto']) ? trim($_POST['assunto']) : 'Contato do Site';
$mensagem = isset($_POST['mensagem']) ? trim($_POST['mensagem']) : '';

// Validação no servidor
$errors = [];

if (empty($nome)) {
    $errors[] = 'O nome é obrigatório.';
} elseif (strlen($nome) < 3) {
    $errors[] = 'O nome deve ter pelo menos 3 caracteres.';
}

if (empty($email)) {
    $errors[] = 'O e-mail é obrigatório.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'E-mail inválido.';
}

if (empty($mensagem)) {
    $errors[] = 'A mensagem é obrigatória.';
} elseif (strlen($mensagem) < 10) {
    $errors[] = 'A mensagem deve ter pelo menos 10 caracteres.';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// Configurações do e-mail
$destinatario = 'amabile.silverio34@gmail.com'; // Seu e-mail
$assuntoEmail = 'Contato do Site - ' . $assunto;

// Preparar o corpo do e-mail
$corpoEmail = "Nova mensagem recebida do site:\n\n";
$corpoEmail .= "Nome: " . $nome . "\n";
$corpoEmail .= "E-mail: " . $email . "\n";
$corpoEmail .= "Assunto: " . $assunto . "\n\n";
$corpoEmail .= "Mensagem:\n" . $mensagem . "\n";

// Cabeçalhos do e-mail
$headers = "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Tentar enviar o e-mail
$enviado = mail($destinatario, $assuntoEmail, $corpoEmail, $headers);

if ($enviado) {
    // Opcional: Salvar em arquivo de log
    $log = date('Y-m-d H:i:s') . " - Mensagem de: $nome ($email) - Assunto: $assunto\n";
    file_put_contents('contatos.log', $log, FILE_APPEND);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Mensagem enviada com sucesso!'
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Erro ao enviar e-mail. Por favor, tente novamente ou entre em contato diretamente.'
    ]);
}
?>

