<?php
    $filename = "scr/high_scores.csv";

    if(file_exists($filename)){
      $str=file_get_contents("$filename");
    }
    else{
      $str=file_get_contents("scr/high_scores_backup.csv");
    }
    
    $response=array();
    $fields=array("name","score","killed");
    $entries=preg_split('/\n|\r\n?/', $str);
     
    for($i=0; $i<10; $i++){

            $adatok=explode(";",$entries[$i]);
            
          for($j=0; $j<count($adatok); $j++){
            $response[$i][$fields[$j]] = $adatok[$j];
          }   
    }

    $compare=array();
    foreach($response as $key => $value){
      $compare[$key]=$value["score"];
    }
    array_multisort($compare, SORT_DESC, $response);

    echo json_encode($response);
   
?>