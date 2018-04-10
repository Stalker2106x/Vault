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
//Extracting JSON POST data
$post = json_decode(file_get_contents('php://input'));

if (isset($post->config)) //Update config
{
    $configjson = json_decode(file_get_contents("config.json"),true);

    //Update data
    foreach ($configjson as $key => $value) {
        if (isset($post->config->{$key}) && $post->{$key} != $value) //If key exists in post 
        {
            echo 'old: '.$value.' new: '.$post->{$key}.'\n';
            $configjson[$key] = $post->{$key}; //set data
        }
    }
    //Now serialize to file
    $fp = fopen('config.json', 'w');
    fwrite($fp, json_encode($configjson, JSON_PRETTY_PRINT));
    fclose($fp);
}
else if (isset($post->apps)) //Update apps
{
    $appsjson = json_decode(file_get_contents("apps.json"),true);

    //Update data !!

    //Now serialize to file
    $fp = fopen('apps.json', 'w');
    fwrite($fp, json_encode($configjson, JSON_PRETTY_PRINT));
    fclose($fp);
}


$appsjson = json_decode(file_get_contents("apps.json"),true);


echo 'DONE.';
?>