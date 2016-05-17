<?php
include 'php/NaApiData.php';

$ports = new NaApiData('http://storage.googleapis.com/nacleanopenworldprodshards/Shops_cleanopenworldprodeu1.json','cache/Shops.js', 7200);
echo($ports->getContent());
