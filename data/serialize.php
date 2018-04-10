<?php
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    // The request is NOT using the POST method, discard
    echo 'only post method allowed.';
    http_response_code(403);
    exit;
}
else if(isset($_SERVER["CONTENT_TYPE"]) && strncasecmp($_SERVER["CONTENT_TYPE"], 'application/json', 16) != 0) {
    echo 'Content type must be: application/json';
    http_response_code(401);
    exit;
}


var_dump(file_get_contents('php://input'));
echo json_last_error();

/*

$configjson = json_decode(file_get_contents("config.json"),true);
$appsjson = json_decode(file_get_contents("apps.json"),true);

foreach ($configjson as $key => $value) {
    if (isset($_POST[$key]) && $_POST[$key] != $value)
    {
        echo 'current: '.$value.' old: '.$_POST[$key].'\n';
    }
}

echo 'DONE. zebi.';
*/
?>