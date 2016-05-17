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
    protected $content;
//    protected $updateTimestamp;
    protected $cacheTime;

    public function __construct($url = '', $filename = '', $cacheTime= '7200')
    {
        $this->url = $url;
        $this->filename = $filename;
        $this->cacheTime = $cacheTime;
//        $todayUpdate = new DateTime('today ' . $updateTime);
//        $this->updateTimestamp = $todayUpdate->getTimestamp();
    }

    public function getContent()
    {
        $this->checkFile();
        return $this->content;
    }

    private function checkFile()
    {
        $handle = fopen($this->filename, "r") or $this->getData();
        if (!empty($handle)) {
            $currentTime = time();
            $fileTime = filemtime($this->filename);
            //If i want to update only one time a day thanks to the hour of update
//            $rangeUpdate = 86400;
//            if ($fileTime - $this->updateTimestamp < 0) {
//                if ($currentTime - $this->updateTimestamp < 0 && $this->updateTimestamp - $rangeUpdate - $fileTime < $rangeUpdate) {
//                    $this->content = fread($handle, filesize($this->filename)) . ' old cached';
//                } else {
//                    $this->getData();
//                }
            if($currentTime - $fileTime > $this->cacheTime){
                $this->getData();
            } else {
                $this->content = "//cached data \r\n" . fread($handle, filesize($this->filename));
            }
        }
        fclose($handle);
    }

    private function getData()
    {
        $req = new Request($this->url);
        $res = $req->get();
        $handle = fopen($this->filename, "w");
        $this->content = $res[0];
        fwrite($handle, $this->content);
        fclose($handle);
    }
}