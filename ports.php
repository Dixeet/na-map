<?php
include 'php/NaApiData.php';

$ports = new NaApiData('http://storage.googleapis.com/nacleanopenworldprodshards/Ports_cleanopenworldprodeu1.json','cache/Ports.js', 7200);
echo($ports->getContent());
