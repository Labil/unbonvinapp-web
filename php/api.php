<?php
/*
*   Author: Solveig Hansen 2014
*/
    include 'database_login.php';
    header('Content-type: application/json; charset=UTF-8');

    /*
        Defines the column names in the SQL database.
    */
    define("ID", "_id");
    define("NAME_S", "name");
    define("TYPE_S", "type");
    define("YEAR_S", "year");
    define("GRAPE_S", "grape");
    define("COUNTRY_S", "country");
    define("REGION_S", "region");
    define("SCORE_S", "score");
    define("PRODNUM_S", "productnum");
    define("SELECTION_S", "selection");
    define("PRICE_S", "price");
    define("STARS_S", "stars");
    define("SWEETNESS_S", "sweetness");
    define("AROMA_S", "aroma");
    define("TASTE_S", "taste");
    define("CONCLUSION_S", "conclusion");
    define("SOURCE_S", "source");
    define("SOURCEDATE_S", "sourcedate");
    define("NOTE_S", "note");
    define("UPDATEVERSION_S", "updateVersion");
    define("TABLE_WINES", "wines");
    define("RESULT_LIMIT", 50); //This might be changed or input dynamically by user in js

?>

    <?php 

        function insertWine($name, $type, $year, $grape, $country, $region, $score, $prodnum, $price,
            $stars, $aroma, $taste, $conclusion, $source){

           $sql = "INSERT INTO wines (name, type, year, grape, country, region, score, productnum, price, stars, aroma, taste, conclusion, source) VALUES ('$name', '$type', '$year', '$grape', '$country', '$region', '$score', '$prodnum', '$price', '$stars', '$aroma', '$taste', '$conclusion', '$source')";


           /*$sql = "INSERT INTO wines (name, type, year, grape, country, region, score, productnum, price, stars, aroma, taste, conclusion, source) VALUES ('Mikael', 'Hvit', '1985', 'Drue', 'Norge', 'Porsgrunn', '100', '123', '300', '6', 'bitter', 'Søt', 'Not available', 'Meg')";*/

            $result = mysql_query($sql) or die(mysql_error());

            $returnArray = array('result' => $result, 'status' => "OK");

            return json_encode($returnArray);
        }

    
        /*
            Main function for handling queries. Gets called by the other query-functions.
            Returns elements from the database as a JSON object based on the query specifiers.
        */
        function queryWines($sql){
           // print("WOOP");
            $resultArray = array();
            /* Select queries return a resultset */
           /* if ($result = $db->query("SELECT Name FROM wines LIMIT 10")) {
                printf("Select returned %d rows.\n", $result->num_rows);
                $result->close();
            }*/

            /*if(!$result = $db->query($sql)){
                die('There was an error running the query [' . $db->error . ']');
            }*/
            $result = mysql_query($sql) or die(mysql_error());
            $returnedRows = 0;
            
            /*while($row = $result->fetch_assoc()){
                $resultArray[] = array('id' => intval($row[ID]), 'name' => $row[NAME_S], 
                    'type' => $row[TYPE_S], 'year' => $row[YEAR_S], 'grape' => $row[GRAPE_S],
                    'country' => $row[COUNTRY_S], 'region' => $row[REGION_S],
                    'score' => $row[SCORE_S], 'prodnum' => $row[PRODNUM_S], 
                    'selection' => $row[SELECTION_S], 'price' => $row[PRICE_S], 'stars'=>$row[stars],
                    'sweetness'=> $row[SWEETNESS_S], 'aroma'=> $row[AROMA_S], 'taste' =>$row[taste],
                    'conclusion' => $row[CONCLUSION_S], 'source'=> $row[SOURCE_S], 
                    'sourcedate' => $row[SOURCEDATE_S], 'note' => $row[NOTE_S]);
            }*/
            while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
                $resultArray[] = array('id' => intval($row[ID]), 'name' => $row[NAME_S], 
                    'type' => $row[TYPE_S], 'year' => $row[YEAR_S],
                    'country' => $row[COUNTRY_S], 'region' => $row[REGION_S],
                     'price' => $row[PRICE_S], 'stars'=>$row[stars], 
                     'aroma' => $row[AROMA_S], 'taste' => $row[taste], 
                     'conclusion' => $row[CONCLUSION_S]);
                $returnedRows++;
            }
           // $returnedRows = $result->num_rows;
          // $result->free();

            $returnArray = array('result' => $resultArray, 'returned_rows' => $returnedRows,
                'status' => "OK");

           // $out = array_values($returnArray);
            //print($returnArray);

            return json_encode($returnArray);
        }
        //gets all wines limited by LIMIT
        function getWines($param) {
            
            $sql = "SELECT * FROM " . TABLE_WINES  . getSortQry($param) . "LIMIT 0," . RESULT_LIMIT;
            return queryWines($sql);
        }

        //Returns the correct ORDER BY based on params
        function getSortQry($param){
            if($param != null){
                if($param == "alpha") return " ORDER BY " . NAME_S . " ASC "; //ASC is default
                else if($param == "type") return " ORDER BY " . TYPE_S . " ASC ";
                else if($param == "price") return " ORDER BY " . PRICE_S . " ASC ";
                else return " ";
            }
            else return " ";
        }
        // Get wine by name LIKE 'name%' -> in list. Might return only one item in list if only one is found
        function getWineByName($name, $param) {
            $sql = "SELECT * FROM " . TABLE_WINES . " WHERE " . NAME_S . " LIKE \"" . $name . "%\"" . getSortQry($param);
            return queryWines($sql);
        }
        
        //Maybe people wanna find out wines that are HIGHER than the given price? Hmm
        function getWineByPrice($price, $param){
            $sort_qry = getSortQry($param);
            //For price, it seems to be auto-sorted by price and trying to sort again fucks up smth?
            if($param == "price")
                $sort_qry = "";
            
            $qry = "SELECT * FROM " . TABLE_WINES . " WHERE " . PRICE_S . " < " . $price . $sort_qry;
            return queryWines($qry);
        }
        
        function getWineByType($type, $param){
            $qry = "SELECT * FROM " . TABLE_WINES . " WHERE " . TYPE_S . "=\"" . $type .
                    "\"" . getSortQry($param);
            return queryWines($qry);
        }
        
        function getWineByYear($year, $param){
            $qry = "SELECT * FROM " . TABLE_WINES . " WHERE " . YEAR_S . "=" . $year . getSortQry($param);
            return queryWines($qry);
        }
        
        /*
            Returns the error JSON object
        */
        function errorResponse($errCode) {
            $ary = array("results" => array(), "status" => $errCode);
            return json_encode($ary);
        }
        
      
        ////////////////////////////////////////////////////////////////////////
        //////  BEGIN MAIN  ////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////
        
        
        /*
            Some simple sanitation.
        */
        $req = (isset($_GET['req']) && $_GET['req']) ? $_GET['req'] : "NO_REQUEST";
        $req = preg_replace("/([^a-zA-Z0-9]+)/", "", $req);

       /* $db = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
        if($db->connect_errno){
            die('Unable to connect to database [' . $db->connect_error . ']');
            exit();
        }*/

        /* Print current character set */
        //$charset = $db->charset_set_name();
        //printf("Current character set is %s\n", $charset);
        $db = mysql_connect($dbhost, $dbuser, $dbpass) or die(mysql_error());
        if (!$db) {
            die('Could not connect: ' . mysql_error());
        }

        if(!mysql_select_db($dbname)) {
            die("Could not select database");
        }

        //To parse accented characters that are returned from the db
        mysql_query('SET CHARACTER SET utf8');


        /*
            Check for our defined requests
        */
        if($req == "name"){
            $name = (isset($_GET['name']) && $_GET['name']) ? $_GET['name'] : 'ERROR';
            $param = (isset($_GET['param']) && $_GET['param']) ? $_GET['param'] : 'ERROR';
           /* if(preg_match("/^(\d+)(\.(\d+))?$/", $name) != 1) {
                mysql_close($conn);
                die(errorResponse("INVALID_ARGUMENT"));
            }*/
            echo getWineByName($name, $param);
        }
        else if($req == "all"){
            $param = (isset($_GET['param']) && $_GET['param']) ? $_GET['param'] : 'ERROR';
            echo getWines($param);
        }  
        //Price is a bit unfinished. For now it returns prices lower than the input
        else if($req == "price"){
            $price = (isset($_GET['price']) && $_GET['price']) ? $_GET['price'] : 'ERROR';
            $param = (isset($_GET['param']) && $_GET['param']) ? $_GET['param'] : 'ERROR';
            echo getWineByPrice($price, $param);
        }
        else if($req == "type"){
            $type = (isset($_GET['type']) && $_GET['type']) ? $_GET['type'] : 'ERROR';
            $param = (isset($_GET['param']) && $_GET['param']) ? $_GET['param'] : 'ERROR';
            echo getWineByType($type, $param);
        } 
        else if($req == "year"){
            $year = (isset($_GET['year']) && $_GET['year']) ? $_GET['year'] : 'ERROR';
            $param = (isset($_GET['param']) && $_GET['param']) ? $_GET['param'] : 'ERROR';
            echo getWineByYear($year, $param);
        } 
        else if($req == "insert"){
            
            if(isset($_POST["name"])) {
                $n = (isset($_POST['name']) && $_POST['name']) ? $_POST['name'] : '';
                $t = (isset($_POST['type']) && $_POST['type']) ? $_POST['type'] : '';
                $y = (isset($_POST['year']) && $_POST['year']) ? $_POST['year'] : '';
                $g = (isset($_POST['grape']) && $_POST['grape']) ? $_POST['grape'] : '';
                $c = (isset($_POST['country']) && $_POST['country']) ? $_POST['country'] : '';
                $r = (isset($_POST['region']) && $_POST['region']) ? $_POST['region'] : '';
                $s = (isset($_POST['score']) && $_POST['score']) ? $_POST['score'] : '';
                $p = (isset($_POST['prodnum']) && $_POST['prodnum']) ? $_POST['prodnum'] : '';
                $pr = (isset($_POST['price']) && $_POST['price']) ? $_POST['price'] : '';
                $st = (isset($_POST['stars']) && $_POST['stars']) ? $_POST['stars'] : '';
                $ar = (isset($_POST['aroma']) && $_POST['aroma']) ? $_POST['aroma'] : '';
                $ta = (isset($_POST['taste']) && $_POST['taste']) ? $_POST['taste'] : '';
                $co = (isset($_POST['conclusion']) && $_POST['conclusion']) ? $_POST['conclusion'] : '';
                $so = (isset($_POST['source']) && $_POST['source']) ? $_POST['source'] : '';

                echo insertWine($n, $t, $y, $g, $c, $r, $s, $p, $pr, $st, $ar, $ta, $co, $so);
                //echo getWineByName($_POST['name'], "asc");
            }
        }

        //mysqli_real_escape_string($_POST['name']);

        /* 
            Returns error response if invalid request
        */
        else {  
            echo errorResponse("INVALID_REQUEST");
        }


        mysql_close($db);
        //$db->close();
        
    ?>
