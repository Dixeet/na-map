<?php
include 'php/NaApiData.php';

$ports = new NaApiData('http://storage.googleapis.com/nacleanopenworldprodshards/Nations_cleanopenworldprodeu1.json','cache/Nations.js', 7200);
echo($ports->getContent());
