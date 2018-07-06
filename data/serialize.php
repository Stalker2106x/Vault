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
$postdata = json_decode(file_get_contents('php://input'), true);
//Reading vault config (before anything because passphrase check is needed)
$config = json_decode(file_get_contents("config.json"), true);

if (!isset($postdata["passphrase"]) || $config['passphrase'] != $postdata["passphrase"])
{
    echo 'Authorization: Wrong or missing passphrase.';
    http_response_code(401);
    exit;
}

// SERIALIZATION ROUTINES BEGIN HERE

if (isset($postdata["config"])) //Update config if present
{

    //Update data
    foreach ($postdata["config"] as $param => $value) {
        if (isset($config[$param]) && $value != "" && $config[$param] != $value) //If key exists in configuration and post value is different
        {
            echo $param." changed to: ".$postdata["config"][$param];
            $config[$param] = $postdata["config"][$param]; //set data
        }
    }
    //Now serialize config to file
    $fp = fopen('config.json', 'w');
    fwrite($fp, json_encode($config, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    fclose($fp);
}

if (isset($postdata["apps"])) //Update apps if present
{
    $apps = json_decode(file_get_contents("apps.json"), true);
    //Loop through posted apps
    for ($i = 0; $i < count($postdata["apps"]); ++$i) {
        //Now iterate inside posted app to update json data
        echo 'app'.$i.': {';
        foreach ($postdata["apps"][$i] as $param => $value) {
            if ($value != "" && (!isset($apps[$i][$param]) || $value != $apps[$i][$param])) //If posted key doesnt exists, or post is not empty and different from config
            {
                echo $param.": ".$value;
                $apps[$i][$param] = $value; //set data
            }
        }
        echo '} ';
    }
    $apps = array_values($apps); //Remove app indexes for serialization
    //Now serialize to file
    $fp = fopen('apps.json', 'w');
    fwrite($fp, json_encode($apps, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    fclose($fp);
}

?>