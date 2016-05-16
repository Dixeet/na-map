<?php
/**
 * Created by PhpStorm.
 * User: robin
 * Date: 16/05/16
 * Time: 17:49
 */
include 'Request.php';

class NaApiData
{
    protected $url;
    protected $filename;

    public function __init($url = '', $filename = '')
    {
        $this->url = $url;
        $this->filename = $filename;
    }

    public function respond()
    {

    }

    private function checkFile()
    {
        
    }

    private function getData()
    {

    }
}