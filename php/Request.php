<?php

/**
 * Created by PhpStorm.
 * User: robin
 * Date: 13/04/16
 * Time: 11:10
 */
class Request
{
    protected $url;
    protected $curl;
    protected $queryParams;
    protected $headers;

    public function __construct($url = '', $queryParams = [], $headers = [])
    {
        $this->url = $url;
        $this->queryParams = $queryParams;
        $this->headers = $headers;
    }

    private function initializeCurl()
    {
        $this->curl = curl_init();
        curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($this->curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($this->curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($this->curl, CURLOPT_AUTOREFERER, true);
        $this->setHeaders($this->headers);
        $this->setCurlUrl();
    }

    public function setUrl($url)
    {
        $this->url = $url;
        $this->setCurlUrl();
    }

    public function setQueryParams($queryParams)
    {
        $this->queryParams = $queryParams;
        $this->setCurlUrl();
    }

    public function setHeaders($headers)
    {
        $this->headers = $headers;
        if (!empty($this->headers)) {
            curl_setopt($this->curl, CURLOPT_HTTPHEADER, $headers);
        }
    }

    private function setCurlUrl(){
        $httpQueryParams = http_build_query($this->queryParams);
        $urlWithParams = empty($params) ? $this->url : $this->url . '?' . $httpQueryParams;
        curl_setopt($this->curl, CURLOPT_URL, $urlWithParams);
    }

    public function get($url = '', $queryParams = [], $headers = [])
    {
        $this->initializeCurl();

        if (!empty($url)) {
            $this->setUrl($url);
        }
        if (!empty($queryParams)) {
            $this->setQueryParams($queryParams);
        }
        if (!empty($headers)) {
            $this->setHeaders($headers);
        }
        return $this->sendRequest();
    }

    public function post($url = '', $queryParams = [], $headers = [], $data = '')
    {
        $this->initializeCurl();

        if (!empty($url)) {
            $this->setUrl($url);
        }
        if (!empty($queryParams)) {
            $this->setQueryParams($queryParams);
        }
        if (!empty($headers)) {
            $this->setHeaders($headers);
        }
        if (!empty($data)) {
            curl_setopt($this->curl, CURLOPT_POSTFIELDS, $data);
        }
        curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, "POST");
        return $this->sendRequest();
    }

    private function sendRequest()
    {
        $resp = array(curl_exec($this->curl), curl_getinfo($this->curl, CURLINFO_HTTP_CODE));
        curl_close($this->curl);
        return $resp;
    }
}