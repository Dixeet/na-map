<?php
include 'php/NaApiData.php';

$ports = new NaApiData('http://storage.googleapis.com/nacleanopenworldprodshards/ItemTemplates_cleanopenworldprodeu1.json','cache/Items.js', 7200);
echo($ports->getContent());
