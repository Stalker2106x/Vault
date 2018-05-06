<?php
//Enforcing valid request method
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    // The request is NOT using the POST method, discard
    echo 'Bad request: only post method allowed.';
    http_response_code(403);
    exit;
}
else if(isset($_SERVER["CONTENT_TYPE"]) && strncasecmp($_SERVER["CONTENT_TYPE"], 'application/json', 16) != 0) {
    echo 'Content type must be: application/json';
    http_response_code(400);
    exit;
}

//Extracting JSON POST data
$post = json_decode(file_get_contents('php://input'));
//Reading config before anything for passphrase check
$configjson = json_decode(file_get_contents("config.json"),true);

if (!isset($post->passphrase) || $configjson['passphrase'] != $post->passphrase)
{
    echo 'Authorization: Wrong or missing passphrase.';
    http_response_code(401);
    exit;
}

if (isset($post->config)) $postconfig = $post->config;
if (isset($post->apps)) $postapps = $post->apps;

if (isset($postconfig)) //Update config if present
{

    //Update data
    foreach ($configjson as $key => $value) {
        if (isset($postconfig->{$key}) && $postconfig->{$key} != $value) //If key exists in post
        {
            echo '['.$key.']: '.$configjson->{$key};
            echo ' => '.$postValue;
            $configjson->{$key} = $postValue; //set data
        }
    }
    //Now serialize config to file
    $fp = fopen('config.json', 'w');
    fwrite($fp, json_encode($configjson, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    fclose($fp);
}
if (isset($postapps)) //Update apps if present
{
    $appsjson = json_decode(file_get_contents("apps.json"));

    //Loop through app collection
    $i = 0;
    foreach ($appsjson->apps as $app ) {
        //Now iterate inside post data to update json data
        echo '['.$i.']';
        foreach ($postapps[$i] as $key => $postValue) {
            if (!isset($app->{$key}) || $postValue != $app->{$key}) //If key doesnt exists or is modified in post
            {
                if ($key == "deleted" && $postValue == true) echo 'DELETED';
                if (isset($app->{$key})) echo '['.$key.']: '.$app->{$key};
                else echo 'NEW';
                echo ' => '.$postValue;
                $app->{$key} = $postValue; //set data
            }
        }
        echo '[/'.$i.']';
        $i = $i + 1;
    }

    //Now serialize to file
    $fp = fopen('apps.json', 'w');
    fwrite($fp, json_encode($appsjson, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    fclose($fp);
}

?>