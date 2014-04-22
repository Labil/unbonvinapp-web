<?php
	session_start();

	$isLoggedIn = false;
	if(session_is_registered(myusername)){
		$isLoggedIn = true;
	}
	else{
		$isLoggedIn = false;
	}
	$arr = array('is_logged_in' => $isLoggedIn);
	echo(json_encode($arr));
?>