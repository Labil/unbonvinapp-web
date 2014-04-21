<?php
include_once 'database_login.php';

function connectToDB(){
    $db = mysqli_connect(HOST, USER, PASSWORD, DATABASE); 
    if (!$db) { 
        die('Connect Error (' . mysqli_connect_errno() . ') ' . mysqli_connect_error());
        exit(); 
    } 
    //To parse accented characters that are returned from the db
    $db->set_charset("utf8");
    return $db;
}

function checkForPostString($str){
    /* Connect to db to do real_escape_string */
    $db = connectToDB();
    //If string is set, escape it (\' etc), so that it can be inserted in db
    $ret = (isset($_POST[$str]) && $_POST[$str]) ? $db->escape_string($_POST[$str]) : '';
    $db->close();
    return $ret;
}

function checkForGetString($str){
    $ret = (isset($_GET[$str]) && $_GET[$str]) ? $_GET[$str] : 'ERROR';
    return $ret;
}