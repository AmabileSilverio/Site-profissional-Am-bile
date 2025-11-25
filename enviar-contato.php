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

// Salvar mensagem em arquivo (funcionará em qualquer servidor)
$pasta_contatos = 'contatos/';
if (!is_dir($pasta_contatos)) {
    mkdir($pasta_contatos, 0755, true);
}

$dados_contato = [
    'data' => date('Y-m-d H:i:s'),
    'nome' => $nome,
    'email' => $email,
    'assunto' => $assunto,
    'mensagem' => $mensagem,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Desconhecido'
];

$arquivo_contato = $pasta_contatos . 'contato_' . time() . '_' . uniqid() . '.json';
$resultado_salvo = file_put_contents($arquivo_contato, json_encode($dados_contato, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

if (!$resultado_salvo) {
    echo json_encode(['success' => false, 'message' => 'Erro ao salvar mensagem. Por favor, tente novamente.']);
    exit;
}

// Tentar enviar por email (se configurado no servidor)
try {
    $destinatario = 'amabile.silverio34@gmail.com';
    $assuntoEmail = 'Contato do Site - ' . $assunto;
    
    $corpoEmail = "Nova mensagem recebida do site:\n\n";
    $corpoEmail .= "Nome: " . $nome . "\n";
    $corpoEmail .= "E-mail: " . $email . "\n";
    $corpoEmail .= "Assunto: " . $assunto . "\n\n";
    $corpoEmail .= "Mensagem:\n" . $mensagem . "\n\n";
    $corpoEmail .= "---\n";
    $corpoEmail .= "Enviado em: " . date('d/m/Y H:i:s') . "\n";
    $corpoEmail .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    
    $headers = "From: noreply@site.com\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Tentar enviar (pode não funcionar se o servidor não está configurado)
    @mail($destinatario, $assuntoEmail, $corpoEmail, $headers);
} catch (Exception $e) {
    // Silenciosamente falha se não conseguir enviar email
}

// Registrar em log também
$log_file = 'contatos.log';
$log_entry = date('Y-m-d H:i:s') . " | Nome: $nome | Email: $email | Assunto: $assunto\n";
file_put_contents($log_file, $log_entry, FILE_APPEND);

echo json_encode([
    'success' => true,
    'message' => 'Mensagem recebida com sucesso! Em breve retornaremos seu contato.'
]);
?>

